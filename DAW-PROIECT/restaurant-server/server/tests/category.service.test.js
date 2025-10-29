const CategoryService = require('../services/category.service');

describe('CategoryService', () => {
    const fakeRepo = {
        findAll: jest.fn().mockResolvedValue([{ id: 1, name: 'Pizza' }])
    };

    beforeEach(() => jest.clearAllMocks());

    test('list delegă la repo.findAll', async () => {
        const svc = new CategoryService(fakeRepo);
        const r = await svc.list();
        expect(fakeRepo.findAll).toHaveBeenCalledTimes(1);
        expect(r).toEqual([{ id: 1, name: 'Pizza' }]);
    });
});
