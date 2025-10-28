const { AppError } = require('../errors/AppError');

function errorHandler(err, req, res, next) {
    if (err instanceof AppError) {
        return res.status(err.status).json({ error: err.message, details: err.details ?? undefined });
    }
    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'Eroare server' });
}
module.exports = errorHandler;
