const BaseEntity = require('./BaseEntity');
class Person extends BaseEntity {
    constructor({ id, name, ...rest }) {
        super({ id, ...rest });
        this.name = name;
    }
}
module.exports = Person;
