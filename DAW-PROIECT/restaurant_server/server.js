// server.js — Express + PostgreSQL (fără .env)

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const { Pool } = require('pg');
const pgSession = require('connect-pg-simple')(session);
const csurf = require('csurf');
const bcrypt = require('bcryptjs');

// ---- CONFIG SIMPLĂ (modifică aici dacă ai alt DB/port) ----
$env: DATABASE_URL = "postgres://postgres:1q2w3e@localhost:5432/dawprojectfinal"
const PORT = 4000;
const CORS_ORIGIN = 'http://localhost:5173';
const SESSION_SECRET = 'dev_secret_schimba_ma';

// ---- PG POOL ----
const pool = new Pool({ connectionString: DATABASE_URL });

// ---- APP ----
const app = express();
app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: CORS_ORIGIN, credentials: true }));

app.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: new pgSession({ pool, tableName: 'session', createTableIfMissing: true }),
    cookie: { httpOnly: true, sameSite: 'lax', secure: false, maxAge: 1000 * 60 * 60 * 24 }
}));

// CSRF: primești token din /api/csrf-token și îl pui în X-CSRF-Token la POST/PUT/DELETE
app.use(csurf({ cookie: true }));

// helpers
function requireAuth(req, res, next) {
    if (!req.session.user) return res.status(401).json({ error: 'Neautentificat' });
    next();
}
function requireEmployee(req, res, next) {
    if (!req.session.user || req.session.user.role !== 'employee') return res.status(403).json({ error: 'Interzis' });
    next();
}

// ---- ROUTES ----
app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.get('/api/csrf-token', (req, res) => res.json({ token: req.csrfToken() }));

// 👇 ADAUGĂ asta AICI (nu la final!):
app.get('/api/categories', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT id,name,slug FROM categories ORDER BY name ASC');
        res.json(rows);
    } catch (e) {
        console.error('GET /api/categories error', e);
        res.status(500).json({ error: 'Eroare server' });
    }
});
app.post('/api/admin/categories', requireEmployee, async (req, res) => {
    try {
        let { name, slug } = req.body;
        if (!name) return res.status(400).json({ error: 'Nume necesar' });
        if (!slug) slug = name.toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const { rows } = await pool.query(
            'INSERT INTO categories(name,slug) VALUES($1,$2) RETURNING id,name,slug',
            [name, slug]
        );
        res.json(rows[0]);
    } catch (e) {
        console.error('POST /api/admin/categories error', e);
        res.status(500).json({ error: 'Eroare server' });
    }
});
// Auth
app.post('/api/auth/register', async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) return res.status(400).json({ error: 'Câmpuri lipsă' });
        const hash = await bcrypt.hash(password, 10);
        const { rows } = await pool.query(
            'INSERT INTO users (name,email,password_hash,role) VALUES ($1,$2,$3,$4) RETURNING id,name,email,role',
            [name, email, hash, 'client']
        );
        req.session.user = rows[0];
        res.json({ ok: true, user: rows[0] });
    } catch (e) { next(e); }
});
app.post('/api/auth/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const { rows } = await pool.query('SELECT * FROM users WHERE email=$1 LIMIT 1', [email]);
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

// Products public
app.get('/api/products', async (_req, res, next) => {
    try {
        const { rows } = await pool.query(`
      SELECT p.id, p.name, p.description, p.price, p.image_url, c.name AS category
      FROM products p LEFT JOIN categories c ON c.id=p.category_id
      WHERE p.is_active = true
      ORDER BY c.name, p.name
    `);
        res.json(rows);
    } catch (e) { next(e); }
});
app.get('/api/products/:id', async (req, res, next) => {
    try {
        const { rows } = await pool.query('SELECT * FROM products WHERE id=$1', [req.params.id]);
        if (!rows[0]) return res.status(404).json({ error: 'Produs inexistent' });
        res.json(rows[0]);
    } catch (e) { next(e); }
});

// Cart/Orders (client)
app.post('/api/orders', requireAuth, async (req, res, next) => {
    const client = await pool.connect();
    try {
        const items = req.body.items || []; // [{product_id, qty}]
        if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ error: 'Coș gol' });

        await client.query('BEGIN');
        const insOrder = await client.query('INSERT INTO orders (user_id, status) VALUES ($1,$2) RETURNING id', [req.session.user.id, 'new']);
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
        await client.query('ROLLBACK');
        next(e);
    } finally { client.release(); }
});
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

// Admin (employee)
app.get('/api/admin/orders', requireEmployee, async (_req, res, next) => {
    try {
        const { rows } = await pool.query(`
      SELECT o.id, u.name AS user_name, o.status, o.created_at,
             COALESCE(SUM(oi.qty*oi.unit_price),0)::numeric(12,2) AS total
      FROM orders o
      JOIN users u ON u.id=o.user_id
      LEFT JOIN order_items oi ON oi.order_id=o.id
      GROUP BY o.id, u.name
      ORDER BY o.created_at DESC`);
        res.json(rows);
    } catch (e) { next(e); }
});
app.post('/api/admin/products', requireEmployee, async (req, res, next) => {
    try {
        const { name, description = '', price, image_url = null, category_id = null } = req.body;
        if (!name || price == null) return res.status(400).json({ error: 'Nume și preț obligatorii' });
        const { rows } = await pool.query(
            'INSERT INTO products (name,description,price,image_url,category_id) VALUES ($1,$2,$3,$4,$5) RETURNING id',
            [name, description, price, image_url, category_id]
        );
        res.json({ ok: true, id: rows[0].id });
    } catch (e) { next(e); }
});

app.delete('/api/admin/products/:id', requireEmployee, async (req, res, next) => {
    try {
        await pool.query('DELETE FROM products WHERE id=$1', [req.params.id]);
        res.json({ ok: true });
    } catch (e) { next(e); }
});

// error handler (inclusiv CSRF)
app.use((err, _req, res, _next) => {
    if (err.code === 'EBADCSRFTOKEN') return res.status(403).json({ error: 'CSRF invalid' });
    console.error(err);
    res.status(500).json({ error: 'Eroare server' });
});

app.listen(PORT, () => console.log(`API: http://localhost:${PORT}`));
