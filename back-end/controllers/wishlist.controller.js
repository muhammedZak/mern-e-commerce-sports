const wishlistService = require('../services/wishlist.service');

const addToWishlist = async (req, res, next) => {
  try {
    const wishlist = await wishlistService.addToWishlist(
      req.user.id,
      req.params.productId,
    );

    res.status(200).json({
      success: true,
      message: 'Product added to wishlist',
      data: wishlist,
    });
  } catch (error) {
    next(error);
  }
};

const getMyWishlist = async (req, res, next) => {
  try {
    const wishlist = await wishlistService.getMyWishlist(req.user.id);

    res.status(200).json({
      success: true,
      data: wishlist,
    });
  } catch (error) {
    next(error);
  }
};

const removeFromWishlist = async (req, res, next) => {
  try {
    const wishlist = await wishlistService.removeFromWishlist(
      req.user.id,
      req.params.productId,
    );

    res.status(200).json({
      success: true,
      message: 'Product removed from wishlist',
      data: wishlist,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addToWishlist,
  getMyWishlist,
  removeFromWishlist,
};
