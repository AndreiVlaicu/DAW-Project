const express = require('express');
const router = express.Router();

module.exports = (controller, requireEmployee) => {
    router.get('/', controller.list);
    router.post('/admin', requireEmployee, controller.create);
    router.delete('/admin/:id', requireEmployee, controller.remove);
    return router;
};
