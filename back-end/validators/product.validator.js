const { body, param } = require('express-validator');

const createProductValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ max: 200 })
    .withMessage('Product name cannot exceed 200 characters'),

  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isMongoId()
    .withMessage('Invalid category id'),

  body('sku').trim().notEmpty().withMessage('SKU is required'),

  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isFloat({ min: 0 })
    .withMessage('Price must be greater than or equal to 0'),

  body('compareAtPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Compare at price must be greater than or equal to 0'),

  body('stockQuantity')
    .notEmpty()
    .withMessage('Stock quantity is required')
    .isInt({ min: 0 })
    .withMessage('Stock quantity must be greater than or equal to 0'),
];

const updateProductValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Product name cannot exceed 200 characters'),

  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be greater than or equal to 0'),

  body('compareAtPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Compare at price must be greater than or equal to 0'),

  body('stockQuantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock quantity must be greater than or equal to 0'),
];

const setPrimaryImageValidation = [
  body('filename').trim().notEmpty().withMessage('Filename is required'),
];

const reorderImagesValidation = [
  body('images').isArray({ min: 1 }).withMessage('Images array is required'),
];

const updateImageAltTextValidation = [
  body('filename').trim().notEmpty().withMessage('Filename is required'),

  body('alt')
    .trim()
    .notEmpty()
    .withMessage('Alt text is required')
    .isLength({ max: 200 })
    .withMessage('Alt text cannot exceed 200 characters'),
];

const productIdValidation = [
  param('id').isMongoId().withMessage('Invalid product ID'),
];

module.exports = {
  createProductValidation,
  updateProductValidation,
  setPrimaryImageValidation,
  reorderImagesValidation,
  updateImageAltTextValidation,
  productIdValidation,
};
