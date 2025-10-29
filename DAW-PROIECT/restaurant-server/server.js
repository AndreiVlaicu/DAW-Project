// server.js — Express + PostgreSQL (arhitectură MVC)

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const { Pool } = require('pg');
const pgSession = require('connect-pg-simple')(session);
const csurf = require('csurf');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// ===== CONFIG =====
const DATABASE_URL = process.env.DATABASE_URL
    || 'postgres://postgres:1q2w3e@localhost:5432/dawprojectfinal';
const ORDER_STATUSES = ['new', 'preparing', 'ready', 'completed', 'canceled'];
const PORT = Number(process.env.PORT || 4000);
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';
const SESSION_SECRET = process.env.SESSION_SECRET || 'dev_secret_schimba_ma';

const PUBLIC_DIR = path.join(__dirname, 'web', 'public');
const SAFE_DIRS = { carusel: 'carusel', hero: 'carusel', uploads: 'uploads' };

// ===== DB POOL =====
const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: process.env.PGSSL === '1' ? { rejectUnauthorized: false } : undefined,
});

// ===== APP =====
const app = express();
app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: CORS_ORIGIN, credentials: true }));

app.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: new pgSession({
        pool,
        tableName: 'session',
        createTableIfMissing: true,
    }),
    cookie: { httpOnly: true, sameSite: 'lax', secure: false, maxAge: 1000 * 60 * 60 * 24 },
}));

// CSRF după sesiuni
app.use(csurf({ cookie: true }));

// ===== Helpers Auth =====
function requireAuth(req, res, next) {
    if (!req.session.user) return res.status(401).json({ error: 'Neautentificat' });
    next();
}
function requireEmployee(req, res, next) {
    if (!req.session.user || req.session.user.role !== 'employee') {
        return res.status(403).json({ error: 'Interzis' });
    }
    next();
}

// ===== Health + CSRF =====
app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.get('/api/csrf', (req, res) => { const t = req.csrfToken(); res.set('X-CSRF-Token', t); res.json({ token: t }); });
app.get('/api/csrf-token', (req, res) => { const t = req.csrfToken(); res.set('X-CSRF-Token', t); res.json({ token: t }); });

// ===== ASSETS (imagini din public) =====
app.get('/api/assets/images', (req, res) => {
    try {
        const dirKey = String(req.query.dir || 'carusel');
        const subDir = SAFE_DIRS[dirKey];
        if (!subDir) return res.status(400).json({ error: 'Director invalid' });

        const abs = path.join(PUBLIC_DIR, subDir);
        const items = fs.readdirSync(abs)
            .filter(f => /\.(png|jpe?g|gif|webp|avif)$/i.test(f))
            .map(name => ({ name, url: `/${subDir}/${name}` }));

        res.json({ dir: dirKey, items });
    } catch (e) {
        console.error('GET /api/assets/images', e);
        res.status(500).json({ error: 'Eroare listare imagini' });
    }
});

// ===== AUTH =====
app.post('/api/auth/register', async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;
        if (!name || !email || !password) return res.status(400).json({ error: 'Câmpuri lipsă' });

        const hash = await bcrypt.hash(password, 10);
        const userRole = role === 'employee' ? 'employee' : 'client';

        const { rows } = await pool.query(
            `INSERT INTO users (name, email, password_hash, role, is_active, created_at, updated_at)
       VALUES ($1,$2,$3,$4,true,NOW(),NOW())
       RETURNING id,name,email,role`,
            [name.trim(), String(email).toLowerCase().trim(), hash, userRole]
        );

        req.session.user = rows[0];
        res.json({ ok: true, user: rows[0] });
    } catch (e) { next(e); }
});

app.post('/api/auth/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const { rows } = await pool.query(
            'SELECT * FROM users WHERE email=$1 LIMIT 1',
            [String(email).toLowerCase().trim()]
        );
        const u = rows[0];
        if (!u) return res.status(400).json({ error: 'Date invalide' });
        const ok = await bcrypt.compare(password, u.password_hash);
        if (!ok) return res.status(400).json({ error: 'Date invalide' });
        req.session.user = { id: u.id, name: u.name, email: u.email, role: u.role };
        res.json({ ok: true, user: req.session.user });
    } catch (e) { next(e); }
});

app.get('/api/auth/me', (req, res) => res.json({ user: req.session.user || null }));
app.post('/api/auth/logout', requireAuth, (req, res) => req.session.destroy(() => res.json({ ok: true })));

// ===== MVC: importuri + instanțe =====
const ProductRepo = require('./server/repositories/product.repo');
const CategoryRepo = require('./server/repositories/category.repo');

const ProductService = require('./server/services/product.service');
const CategoryService = require('./server/services/category.service');

const ProductController = require('./server/controllers/product.controller');
const CategoryController = require('./server/controllers/category.controller');

const productRoutesFactory = require('./server/routes/product.routes');
const categoryRoutesFactory = require('./server/routes/category.routes');

const buildApi = require('./server/routes');            // index.js
const errorHandler = require('./server/middlewares/errorHandler');

// Repo + Service + Controller
const productRepo = new ProductRepo(pool);
const categoryRepo = new CategoryRepo(pool);
const productService = new ProductService(productRepo);
const categoryService = new CategoryService(categoryRepo);
const productController = new ProductController(productService);
const categoryController = new CategoryController(categoryService);

// Rute /api pentru products + categories (MVC)
const productsRouter = productRoutesFactory(productController, requireEmployee);
const categoriesRouter = categoryRoutesFactory(categoryController, requireEmployee);
app.use('/api', buildApi({ productRoutes: productsRouter, categoryRoutes: categoriesRouter }));

// ===== ORDERS (client) =====
app.post('/api/orders', requireAuth, async (req, res, next) => {
    const client = await pool.connect();
    try {
        const items = req.body.items || []; // [{product_id, qty}]
        if (!Array.isArray(items) || items.length === 0)
            return res.status(400).json({ error: 'Coș gol' });

        await client.query('BEGIN');
        const insOrder = await client.query(
            'INSERT INTO orders (user_id, status, created_at, updated_at) VALUES ($1,$2,NOW(),NOW()) RETURNING id',
            [req.session.user.id, 'new']
        );
        const orderId = insOrder.rows[0].id;

        for (const it of items) {
            const prod = await client.query('SELECT price FROM products WHERE id=$1', [it.product_id]);
            if (!prod.rows[0]) throw new Error('Produs invalid: ' + it.product_id);
            const price = prod.rows[0].price;
            await client.query(
                'INSERT INTO order_items (order_id, product_id, qty, unit_price) VALUES ($1,$2,$3,$4)',
                [orderId, it.product_id, Math.max(1, parseInt(it.qty || 1)), price]
            );
        }
        await client.query('COMMIT');
        res.json({ ok: true, orderId });
    } catch (e) {
        await client.query('ROLLBACK'); next(e);
    } finally { client.release(); }
});

// Statusurile valide (pt. dropdown în AdminOrders.jsx)
app.get('/api/admin/order-statuses', requireEmployee, (_req, res) => {
    res.json(ORDER_STATUSES);
});

// Schimbă statusul unei comenzi
app.patch('/api/admin/orders/:id/status', requireEmployee, async (req, res, next) => {
    const id = Number(req.params.id);
    const to = String(req.body?.to_status || '').trim();

    if (!Number.isFinite(id)) return res.status(400).json({ error: 'ID invalid' });
    if (!ORDER_STATUSES.includes(to)) return res.status(400).json({ error: 'Status invalid' });

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const { rows } = await client.query('SELECT status FROM orders WHERE id=$1 FOR UPDATE', [id]);
        if (!rows[0]) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'Comanda nu există' }); }

        const from = rows[0].status;
        if (from === to) { await client.query('ROLLBACK'); return res.json({ ok: true, unchanged: true }); }

        await client.query('UPDATE orders SET status=$1, updated_at=NOW() WHERE id=$2', [to, id]);
        await client.query(
            `INSERT INTO order_status_history (order_id, from_status, to_status, changed_by_user, changed_at)
       VALUES ($1,$2,$3,$4,NOW())`,
            [id, from, to, req.session.user.id]
        );
        await client.query('COMMIT');
        res.json({ ok: true, from_status: from, to_status: to });
    } catch (e) {
        await client.query('ROLLBACK'); next(e);
    } finally { client.release(); }
});

// Comenzile mele (client)
app.get('/api/my-orders', requireAuth, async (req, res, next) => {
    try {
        const { rows } = await pool.query(`
      SELECT o.id, o.status, o.created_at,
             COALESCE(SUM(oi.qty*oi.unit_price),0)::numeric(12,2) AS total
      FROM orders o
      LEFT JOIN order_items oi ON oi.order_id=o.id
      WHERE o.user_id=$1
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `, [req.session.user.id]);
        res.json(rows);
    } catch (e) { next(e); }
});

// Admin – listă comenzi
app.get('/api/admin/orders', requireEmployee, async (_req, res, next) => {
    try {
        const { rows } = await pool.query(`
      SELECT o.id, u.name AS user_name, o.status, o.created_at,
             COALESCE(SUM(oi.qty*oi.unit_price),0)::numeric(12,2) AS total
      FROM orders o
      JOIN users u ON u.id=o.user_id
      LEFT JOIN order_items oi ON oi.order_id=o.id
      GROUP BY o.id, u.name
      ORDER BY o.created_at DESC
    `);
        res.json(rows);
    } catch (e) { next(e); }
});

// ===== ERROR HANDLER — ULTIMUL =====
app.use(require('./server/middlewares/errorHandler'));

// ===== START =====
app.listen(PORT, () => {
    console.log(`API: http://localhost:${PORT}`);
    console.log(`DB:  ${DATABASE_URL}`);
});
