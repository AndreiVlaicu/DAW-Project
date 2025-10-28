const BaseEntity = require('./BaseEntity');
class Product extends BaseEntity {
    constructor({ id, category_id, name, description, price, image_url, is_active, ...rest }) {
        super({ id, ...rest });
        this.categoryId = category_id ?? null;
        this.name = name;
        this.description = description ?? '';
        this.price = Number(price);
        this.imageUrl = image_url ?? null;
        this.isActive = is_active ?? true;
    }
}
module.exports = Product;
