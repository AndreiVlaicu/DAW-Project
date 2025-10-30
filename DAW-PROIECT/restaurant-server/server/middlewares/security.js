const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

module.exports = function security(app) {
    app.disable('x-powered-by');

    app.use(helmet({
        contentSecurityPolicy: {
            useDefaults: true,
            directives: {
                defaultSrc: ["'self'"],
                imgSrc: ["'self'", "data:", "blob:"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                scriptSrc: ["'self'"],
                connectSrc: ["'self'", process.env.CORS_ORIGIN || 'http://localhost:5173'],
            },
        },
        referrerPolicy: { policy: 'no-referrer' },
        crossOriginResourcePolicy: { policy: 'same-site' },
    }));

    // limitare pe /api/auth (login/register)
    const authLimiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 30,
        standardHeaders: true,
        legacyHeaders: false,
    });
    app.use('/api/auth', authLimiter);

    // limitare doar pe operații de scriere din /api (sărim GET)
    const writeLimiter = rateLimit({
        windowMs: 60 * 1000,
        max: 120,
        skip: (req) => req.method === 'GET',
        standardHeaders: true,
        legacyHeaders: false,
    });
    app.use('/api', writeLimiter);   // <- aici era '/api/*' și dădea PathError
};
