class BaseEntity {
    constructor({ id, created_at = null, updated_at = null }) {
        this.id = id;
        this.createdAt = created_at ? new Date(created_at) : null;
        this.updatedAt = updated_at ? new Date(updated_at) : null;
    }
}
module.exports = BaseEntity;
