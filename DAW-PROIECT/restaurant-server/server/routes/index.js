const express = require('express');

module.exports = ({ productRoutes, categoryRoutes }) => {
    const api = express.Router();
    api.use('/products', productRoutes);
    api.use('/categories', categoryRoutes);
    return api;
};
