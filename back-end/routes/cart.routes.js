const express = require('express');

const router = express.Router();

const {
  addItemToCart,
  getMyCart,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
} = require('../controllers/cart.controller');

const { protect, authorize } = require('../middleware/auth.middleware');

const validate = require('../middleware/validate.middleware');

const {
  addCartItemValidation,
  updateCartItemValidation,
  cartProductIdValidation,
} = require('../validators/cart.validator');

router.post('/items', protect, addCartItemValidation, validate, addItemToCart);
router.get('/', protect, getMyCart);
router.patch(
  '/items/:productId',
  protect,
  cartProductIdValidation,
  updateCartItemValidation,
  validate,
  updateCartItemQuantity,
);
router.delete(
  '/items/:productId',
  protect,
  cartProductIdValidation,
  validate,
  removeCartItem,
);
router.delete('/', protect, clearCart);

module.exports = router;
