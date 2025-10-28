class CategoryService {
    constructor(categoryRepo) { this.categoryRepo = categoryRepo; }
    async list() { return this.categoryRepo.findAll(); }
}
module.exports = CategoryService;
