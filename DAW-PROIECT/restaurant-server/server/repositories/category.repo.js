// în ambele repo-uri
const BaseRepository = require('./BaseRepository');

const Category = require('../models/Category');

class CategoryRepo extends BaseRepository {
    //constructor(pool) { this.pool = pool; }

    async findAll() {
        const { rows } = await this.pool.query('SELECT * FROM categories ORDER BY name ASC');
        return rows.map(r => new Category(r));
    }
}
module.exports = CategoryRepo;
