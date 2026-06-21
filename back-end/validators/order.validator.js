const { body, param } = require('express-validator');

const createOrderValidation = [
  body('addressId')
    .notEmpty()
    .withMessage('Address ID is required')
    .isMongoId()
    .withMessage('Invalid address ID'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters'),
];

const orderIdValidation = [
  param('orderId').isMongoId().withMessage('Invalid order ID'),
];

module.exports = {
  createOrderValidation,
  orderIdValidation,
};
