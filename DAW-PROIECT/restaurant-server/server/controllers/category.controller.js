class CategoryController {
    constructor(service) { this.service = service; }
    list = async (req, res, next) => {
        try { res.json(await this.service.list()); }
        catch (e) { next(e); }
    };
}
module.exports = CategoryController;
