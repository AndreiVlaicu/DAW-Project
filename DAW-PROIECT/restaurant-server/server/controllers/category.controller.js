class CategoryController {
    constructor(service) { this.service = service; }

    // GET /api/categories
    list = async (req, res, next) => {
        try {
            const rows = await this.service.list();
            res.json(rows);
        } catch (e) { next(e); }
    };

    // POST /api/admin/categories
    create = async (req, res, next) => {
        try {
            const saved = await this.service.add({
                name: req.body?.name,
                slug: req.body?.slug,
            });
            res.json(saved);
        } catch (e) { next(e); }
    };
}
module.exports = CategoryController;
