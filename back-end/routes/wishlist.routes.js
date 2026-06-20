const express = require('express');

const router = express.Router();

const { protect } = require('../middleware/auth.middleware');

const {
  addToWishlist,
  getMyWishlist,
  removeFromWishlist,
} = require('../controllers/wishlist.controller');

const validate = require('../middleware/validate.middleware');

const {
  wishlistProductValidation,
} = require('../validators/wishlist.validator');

router.get('/', protect, wishlistProductValidation, validate, getMyWishlist);

router.post(
  '/:productId',
  protect,
  wishlistProductValidation,
  validate,
  addToWishlist,
);

router.delete(
  '/:productId',
  protect,
  wishlistProductValidation,
  validate,
  removeFromWishlist,
);

module.exports = router;
