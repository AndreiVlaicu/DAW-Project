class BaseRepository {
    constructor(pool) { this.pool = pool; }
    // "Interfață" – metode care trebuie implementate
    async findById(_id) { throw new Error('Not implemented'); }
    async list() { throw new Error('Not implemented'); }
}
module.exports = BaseRepository;
