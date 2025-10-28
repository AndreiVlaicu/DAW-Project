const Category = require('../models/Category');

class CategoryRepo {
    constructor(pool) { this.pool = pool; }

    async findAll() {
        const { rows } = await this.pool.query('SELECT * FROM categories ORDER BY name ASC');
        return rows.map(r => new Category(r));
    }
}
module.exports = CategoryRepo;
