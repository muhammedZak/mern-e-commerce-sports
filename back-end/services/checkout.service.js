const Cart = require('../models/cart.model');
const User = require('../models/user.model');

const AppError = require('../utils/app-error.util');

const { PRODUCT_STATUS } = require('../constants/product.constants');

const validateCheckout = async (userId, addressId) => {
  const cart = await Cart.findOne({
    user: userId,
  }).populate('items.product');

  if (!cart || cart.items.length === 0) {
    throw new AppError('Cart is empty', 400);
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  const address = user.address.id(addressId);

  if (!address) {
    throw new AppError('Shipping address not found', 404);
  }

  let subtotal = 0;

  for (const item of cart.items) {
    const product = item.product;

    if (!product) {
      throw new AppError('Product no longer exists', 400);
    }

    if (product.isDeleted) {
      throw new AppError(`${product.name} is unavailable`, 400);
    }

    if (product.status !== PRODUCT_STATUS.ACTIVE) {
      throw new AppError(`${product.name} is not available`, 400);
    }

    subtotal += item.priceSnapshot * item.quantity;
  }

  const shippingCost = 0;
  const tax = 0;

  const total = subtotal + shippingCost + tax;

  return {
    cart,
    address,
    subtotal,
    shippingCost,
    tax,
    total,
  };
};

const getCheckoutSummary = async (userId, addressId) => {
  const checkout = await validateCheckout(userId, addressId);

  return {
    subtotal: checkout.subtotal,
    shippingCost: checkout.shippingCost,
    tax: checkout.tax,
    total: checkout.total,
    totalItems: checkout.cart.totalItems,
  };
};

module.exports = {
  validateCheckout,
  getCheckoutSummary,
};
