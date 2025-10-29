// server/services/category.service.js
class CategoryService {
    constructor(categoryRepo) {
        this.categoryRepo = categoryRepo;
    }

    async list() {
        return this.categoryRepo.findAll();
    }

    // alias pentru compatibilitate (dacă ai folosit alt nume în controller)
    async findAll() {
        return this.categoryRepo.findAll();
    }
}

module.exports = CategoryService;
