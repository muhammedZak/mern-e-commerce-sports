const { body } = require('express-validator');

const createCategoryValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Category name is required')
    .isLength({ max: 100 })
    .withMessage('Category name cannot exceed 100 characters'),

  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),

  body('image').optional().isURL().withMessage('Image must be a valid URL'),
];

module.exports = {
  createCategoryValidation,
};
