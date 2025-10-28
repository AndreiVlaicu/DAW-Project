const { ValidationError, NotFoundError } = require('../errors/AppError');

class ProductService {
    constructor(productRepo) {
        this.productRepo = productRepo;
    }
    async list() {
        return this.productRepo.findAllWithCategory();
    }
    async create(dto) {
        if (!dto.name || !dto.price) throw new ValidationError('Nume și preț sunt obligatorii');
        return this.productRepo.create({
            name: dto.name.trim(),
            description: dto.description ?? '',
            price: Number(dto.price) || 0,
            image_url: dto.image_url ?? null,
            category_id: dto.category_id ? Number(dto.category_id) : null,
        });
    }
    async remove(id) {
        if (!id) throw new ValidationError('ID lipsă');
        await this.productRepo.remove(id);
    }
}
module.exports = ProductService;
