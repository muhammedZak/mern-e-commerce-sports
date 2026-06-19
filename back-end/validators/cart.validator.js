const { body } = require('express-validator');

const addCartItemValidation = [
  body('productId').isMongoId().withMessage('Valid product ID is required'),

  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
];

module.exports = {
  addCartItemValidation,
};
