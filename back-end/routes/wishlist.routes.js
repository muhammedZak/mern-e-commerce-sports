const express = require('express');

const router = express.Router();

const { protect } = require('../middleware/auth.middleware');

const {
  addToWishlist,
  getMyWishlist,
  removeFromWishlist,
} = require('../controllers/wishlist.controller');

router.get('/', protect, getMyWishlist);

router.post('/:productId', protect, addToWishlist);

router.delete('/:productId', protect, removeFromWishlist);

module.exports = router;
