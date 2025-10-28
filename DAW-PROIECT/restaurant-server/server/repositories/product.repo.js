const Product = require('../models/Product');

class ProductRepo {
    constructor(pool) { this.pool = pool; }

    async findAllWithCategory() {
        const { rows } = await this.pool.query(`
      SELECT p.*, c.name AS category_name
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      ORDER BY p.id DESC
    `);
        return rows.map(r => ({ ...new Product(r), category_name: r.category_name || null }));
    }

    async create({ name, description, price, image_url, category_id }) {
        const q = `
      INSERT INTO products (name, description, price, image_url, category_id, is_active, created_at, updated_at)
      VALUES ($1,$2,$3,$4,$5,true, NOW(), NOW())
      RETURNING *`;
        const { rows } = await this.pool.query(q, [name, description, price, image_url, category_id]);
        return new Product(rows[0]);
    }

    async remove(id) {
        await this.pool.query('DELETE FROM products WHERE id = $1', [id]);
    }
}
module.exports = ProductRepo;
