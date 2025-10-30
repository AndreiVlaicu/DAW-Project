// server/middlewares/validate.js
const { z } = require('zod');

exports.validate = (schema) => (req, res, next) => {
    const parsed = schema.safeParse({ body: req.body, params: req.params, query: req.query });
    if (!parsed.success) {
        return res.status(400).json({ error: 'Date invalide', details: parsed.error.flatten() });
    }
    // atașăm valorile curate pe req.valid
    req.valid = parsed.data;
    next();
};
