class ProductController {
    constructor(service) { this.service = service; }

    // normalizează modelul (camelCase) -> răspuns JSON (snake_case)
    toDTO = (p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price,
        image_url: p.imageUrl ?? null,     // <— cheia pe care o așteaptă front-ul
        category_id: p.categoryId ?? null, // idem
        // dacă repo-ul a adăugat category_name din JOIN, păstrează-l
        category: p.category_name ?? undefined,
    });

    list = async (_req, res, next) => {
        try {
            const items = await this.service.list();
            res.json(items.map(this.toDTO));
        } catch (e) { next(e); }
    };

    get = async (req, res, next) => {
        try {
            const p = await this.service.get(Number(req.params.id));
            res.json(this.toDTO(p));
        } catch (e) { next(e); }
    };

    create = async (req, res, next) => {
        try {
            // body-ul tău are snake_case (image_url, category_id) – service-ul știe să le preia
            const p = await this.service.create(req.body);
            res.json({ ok: true, id: p.id });
        } catch (e) { next(e); }
    };

    remove = async (req, res, next) => {
        try {
            await this.service.remove(Number(req.params.id));
            res.json({ ok: true });
        } catch (e) { next(e); }
    };
}
module.exports = ProductController;
