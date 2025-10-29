// server/routes/product.routes.js
const express = require('express');
const router = express.Router();

module.exports = (controller, requireEmployee) => {
    // Public (frontend meniu)
    router.get('/products', controller.list);

    // Admin (creează / șterge)
    router.post('/admin/products', requireEmployee, controller.create);
    router.delete('/admin/products/:id', requireEmployee, controller.remove);

    return router;
};
