// server/routes/category.routes.js
const express = require('express');
const router = express.Router();

module.exports = (controller, requireEmployee) => {
    // Public (listă pt. dropdown/panou lateral)
    router.get('/categories', controller.list);

    // Admin (dacă vei adăuga UI de creare)
    router.post('/admin/categories', requireEmployee, controller.create);

    return router;
};
