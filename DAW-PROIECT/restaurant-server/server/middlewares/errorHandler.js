const { AppError } = require('../errors/AppError');

module.exports = function errorHandler(err, _req, res, _next) {
    if (err.code === 'EBADCSRFTOKEN') {
        return res.status(403).json({ error: 'CSRF invalid' });
    }
    if (err instanceof AppError) {
        return res.status(err.status).json({ error: err.message, details: err.details ?? undefined });
    }
    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'Eroare server' });
};
