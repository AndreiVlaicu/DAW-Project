// server/utils/clean.js
const sanitize = require('sanitize-html');
exports.cleanText = (s) => sanitize(String(s ?? ''), { allowedTags: [], allowedAttributes: {} }).trim();
