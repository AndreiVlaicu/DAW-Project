const ProductService = require('../services/product.service');
const { ValidationError } = require('../errors/AppError');

describe('ProductService', () => {
    const fakeRepo = {
        findAllWithCategory: jest.fn().mockResolvedValue([{ id: 1, name: 'X' }]),
        create: jest.fn().mockResolvedValue({ id: 1 }),
        remove: jest.fn().mockResolvedValue(undefined),
    };

    beforeEach(() => jest.clearAllMocks());

    test('listActive delegă la repo.findAllWithCategory', async () => {
        const svc = new ProductService(fakeRepo);
        const r = await svc.listActive();
        expect(fakeRepo.findAllWithCategory).toHaveBeenCalledTimes(1);
        expect(r).toEqual([{ id: 1, name: 'X' }]);
    });

    test('list delegă la repo.findAllWithCategory', async () => {
        const svc = new ProductService(fakeRepo);
        const r = await svc.list();
        expect(fakeRepo.findAllWithCategory).toHaveBeenCalledTimes(1);
        expect(r).toEqual([{ id: 1, name: 'X' }]);
    });

    test('create OK cu payload corect', async () => {
        const svc = new ProductService(fakeRepo);
        const dto = { name: 'Pizza', price: 12.5, description: '', image_url: null, category_id: 2 };
        const r = await svc.create(dto);
        expect(fakeRepo.create).toHaveBeenCalledWith({
            name: 'Pizza', price: 12.5, description: '', image_url: null, category_id: 2
        });
        expect(r).toEqual({ id: 1 });
    });

    test('create aruncă la nume lipsă', async () => {
        const svc = new ProductService(fakeRepo);
        await expect(svc.create({ price: 10 })).rejects.toBeInstanceOf(ValidationError);
    });

    test('create aruncă la preț negativ', async () => {
        const svc = new ProductService(fakeRepo);
        await expect(svc.create({ name: 'P', price: -1 })).rejects.toBeInstanceOf(ValidationError);
    });

    test('remove aruncă la id invalid', async () => {
        const svc = new ProductService(fakeRepo);
        await expect(svc.remove('')).rejects.toBeInstanceOf(ValidationError);
    });

    test('remove delegă corect la repo.remove', async () => {
        const svc = new ProductService(fakeRepo);
        await svc.remove(5);
        expect(fakeRepo.remove).toHaveBeenCalledWith(5);
    });
});
