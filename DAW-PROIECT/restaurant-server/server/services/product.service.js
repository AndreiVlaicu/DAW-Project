// server/services/product.service.js
const { ValidationError } = require('../errors/AppError');

class ProductService {
    constructor(productRepo) {
        this.productRepo = productRepo;
    }

    // --- listări --------------------------------------------------------------
    async list() {
        // pentru UI admin (tabel) – include numele categoriei
        return this.productRepo.findAllWithCategory();
    }
    async listActive() {
        // alias pentru compatibilitate cu codul existent
        return this.productRepo.findAllWithCategory();
    }

    // --- creare produs --------------------------------------------------------
    async create(dto) {
        if (!dto || !dto.name || dto.price == null) {
            throw new ValidationError('Nume și preț sunt obligatorii');
        }
        const payload = {
            name: String(dto.name).trim(),
            description: dto.description ?? '',
            price: Number(dto.price) || 0,
            image_url: dto.image_url ?? null,
            category_id: dto.category_id ? Number(dto.category_id) : null,
        };
        if (payload.price < 0) throw new ValidationError('Preț invalid');

        return this.productRepo.create(payload);
    }
    async add(dto) {
        // alias – păstrează compatibilitatea cu controllerele/rutele
        return this.create(dto);
    }

    // --- ștergere -------------------------------------------------------------
    async remove(id) {
        const pid = Number(id);
        if (!pid) throw new ValidationError('ID invalid');
        await this.productRepo.remove(pid);
    }
    async delete(id) {
        // alias
        return this.remove(id);
    }
}

module.exports = ProductService;
