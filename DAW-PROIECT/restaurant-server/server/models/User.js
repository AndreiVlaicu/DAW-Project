const Person = require('./Person');
class User extends Person {
    constructor({ id, name, email, role, ...rest }) {
        super({ id, name, ...rest });
        this.email = email;
        this.role = role; // 'client' | 'employee'
    }
}
module.exports = User;
