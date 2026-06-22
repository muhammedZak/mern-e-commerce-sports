const { query } = require('express-validator');

const checkoutSummaryValidation = [
  query('addressId')
    .notEmpty()
    .withMessage('Address ID is required')
    .isMongoId()
    .withMessage('Invalid address ID'),
];

module.exports = {
  checkoutSummaryValidation,
};
