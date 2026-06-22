const express = require('express');

const router = express.Router();

const { getCheckoutSummary } = require('../controllers/checkout.controller');

const {
  checkoutSummaryValidation,
} = require('../validators/checkout.validator');

const validate = require('../middleware/validate.middleware');

const { protect } = require('../middleware/auth.middleware');

router.get(
  '/summary',
  protect,
  checkoutSummaryValidation,
  validate,
  getCheckoutSummary,
);

module.exports = router;
