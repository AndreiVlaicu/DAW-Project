const BaseEntity = require('./BaseEntity');
class Category extends BaseEntity {
    constructor({ id, name, slug, ...rest }) {
        super({ id, ...rest });
        this.name = name;
        this.slug = slug;
    }
}
module.exports = Category;
