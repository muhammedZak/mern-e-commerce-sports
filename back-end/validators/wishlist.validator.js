const { param } = require('express-validator');

const wishlistProductValidation = [
  param('productId').isMongoId().withMessage('Invalid product ID'),
];

module.exports = {
  wishlistProductValidation,
};
