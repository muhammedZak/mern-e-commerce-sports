const { body, param } = require('express-validator');

const { INVENTORY_REASONS } = require('../constants/inventory.constants');

const adjustInventoryValidation = [
  body('adjustment').isInt().withMessage('Adjustment must be an integer'),

  body('reason')
    .isIn(Object.values(INVENTORY_REASONS))
    .withMessage('Invalid inventory reason'),
];

const inventoryProductIdValidation = [
  param('productId').isMongoId().withMessage('Invalid product ID'),
];

module.exports = {
  adjustInventoryValidation,
  inventoryProductIdValidation,
};
