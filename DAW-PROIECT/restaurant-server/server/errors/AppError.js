class AppError extends Error {
    constructor(message, status = 400, details = null) {
        super(message);
        this.name = this.constructor.name;
        this.status = status;
        this.details = details;
        Error.captureStackTrace?.(this, this.constructor);
    }
}
class NotFoundError extends AppError {
    constructor(message = 'Resursa nu a fost găsită') { super(message, 404); }
}
class ValidationError extends AppError {
    constructor(message = 'Date invalide', details = null) { super(message, 422, details); }
}
module.exports = { AppError, NotFoundError, ValidationError };
