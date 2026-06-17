const express = require('express');

const router = express.Router();

const { createProduct } = require('../controllers/product.controller');

const { createProductValidation } = require('../validators/product.validator');

const validate = require('../middleware/validate.middleware');

const { protect, authorize } = require('../middleware/auth.middleware');

router.post(
  '/',
  protect,
  authorize('admin'),
  createProductValidation,
  validate,
  createProduct,
);

module.exports = router;
