// server/schemas/product.js
const { z } = require('zod');

exports.createProductSchema = z.object({
    body: z.object({
        name: z.string().min(2).max(120).trim(),
        description: z.string().max(1000).optional().transform(v => v || ''),
        price: z.preprocess((v) => Number(v), z.number().nonnegative()),
        image_url: z.string().max(500).optional().nullable(), // acceptă și path relativ
        category_id: z.preprocess((v) => v === '' || v == null ? null : Number(v),
            z.number().int().positive().nullable()).optional(),
    })
});
