const { body, param } = require('express-validator');

const addCartItemValidation = [
  body('productId').isMongoId().withMessage('Valid product ID is required'),

  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
];

const updateCartItemValidation = [
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
];

const cartProductIdValidation = [
  param('productId').isMongoId().withMessage('Invalid product ID'),
];

module.exports = {
  addCartItemValidation,
  updateCartItemValidation,
  cartProductIdValidation,
};
