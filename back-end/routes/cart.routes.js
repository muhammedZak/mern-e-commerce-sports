const express = require('express');

const router = express.Router();

const { addItemToCart } = require('../controllers/cart.controller');

const { protect, authorize } = require('../middleware/auth.middleware');

const validate = require('../middleware/validate.middleware');

const { addCartItemValidation } = require('../validators/cart.validator');

router.post('/items', protect, addCartItemValidation, validate, addItemToCart);

module.exports = router;
