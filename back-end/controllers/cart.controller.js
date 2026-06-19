const cartService = require('../services/cart.service');

const addItemToCart = async (req, res, next) => {
  try {
    const cart = await cartService.addItemToCart(
      req.user.id,
      req.body.productId,
      Number(req.body.quantity),
    );

    res.status(200).json({
      success: true,
      message: 'Item added to cart successfully',
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};

const getMyCart = async (req, res, next) => {
  try {
    const cart = await cartService.getMyCart(req.user.id);

    res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};

const updateCartItemQuantity = async (req, res, next) => {
  try {
    const cart = await cartService.updateCartItemQuantity(
      req.user.id,
      req.params.productId,
      Number(req.body.quantity),
    );

    res.status(200).json({
      success: true,
      message: 'Cart item updated successfully',
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};

const removeCartItem = async (req, res, next) => {
  try {
    const cart = await cartService.removeCartItem(
      req.user.id,
      req.params.productId,
    );

    res.status(200).json({
      success: true,
      message: 'Cart item removed successfully',
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};

const clearCart = async (req, res, next) => {
  try {
    const cart = await cartService.clearCart(req.user.id);

    res.status(200).json({
      success: true,
      message: 'Cart cleared successfully',
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addItemToCart,
  getMyCart,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
};
