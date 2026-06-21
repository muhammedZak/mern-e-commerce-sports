const express = require('express');

const router = express.Router();

const {
  createOrder,
  getMyOrders,
  getOrder,
} = require('../controllers/order.controller');

const { protect } = require('../middleware/auth.middleware');

const validate = require('../middleware/validate.middleware');

const {
  createOrderValidation,
  orderIdValidation,
} = require('../validators/order.validator');

router.post('/', protect, createOrderValidation, validate, createOrder);

router.get('/', protect, getMyOrders);

router.get('/:orderId', protect, orderIdValidation, validate, getOrder);

module.exports = router;
