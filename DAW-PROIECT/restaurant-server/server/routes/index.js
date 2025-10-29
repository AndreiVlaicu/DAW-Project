// server/routes/index.js
const express = require('express');

module.exports = function buildApi({ productRoutes, categoryRoutes }) {
    const api = express.Router();
    api.use(productRoutes);
    api.use(categoryRoutes);
    return api;
};
