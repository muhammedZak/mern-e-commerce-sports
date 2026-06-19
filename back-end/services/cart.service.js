const Cart = require('../models/cart.model');
const Product = require('../models/product.model');

const AppError = require('../utils/app-error.util');

const inventoryService = require('./inventory.service');

const { PRODUCT_STATUS } = require('../constants/product.constants');

const addItemToCart = async (userId, productId, quantity) => {
  const product = await Product.findOne({
    _id: productId,
    isDeleted: false,
    status: PRODUCT_STATUS.ACTIVE,
  });

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  let cart = await Cart.findOne({
    user: userId,
  });

  if (!cart) {
    cart = await Cart.create({
      user: userId,
      items: [],
    });
  }

  const existingItem = cart.items.find(
    (item) => item.product.toString() === productId,
  );

  await inventoryService.reserveStock(productId, quantity);

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.items.push({
      product: product._id,
      quantity,
      priceSnapshot: product.price,
    });
  }

  await cart.save();

  return Cart.findById(cart._id).populate(
    'items.product',
    `
    name
    slug
    price
    images
    stockQuantity
    reservedQuantity
    lowStockThreshold
  `,
  );
};

const getMyCart = async (userId) => {
  const cart = await Cart.findOne({
    user: userId,
  }).populate({
    path: 'items.product',
    select: [
      'name',
      'slug',
      'price',
      'images',
      'stockQuantity',
      'reservedQuantity',
      'lowStockThreshold',
      'status',
      'isDeleted',
    ].join(' '),
  });

  if (!cart) {
    return {
      items: [],
      totalItems: 0,
      subtotal: 0,
    };
  }

  return cart;
};

const updateCartItemQuantity = async (userId, productId, newQuantity) => {
  const cart = await Cart.findOne({
    user: userId,
  });

  if (!cart) {
    throw new AppError('Cart not found', 404);
  }

  const item = cart.items.find((item) => item.product.toString() === productId);

  if (!item) {
    throw new AppError('Cart item not found', 404);
  }

  const oldQuantity = item.quantity;

  const difference = newQuantity - oldQuantity;

  if (difference > 0) {
    await inventoryService.reserveStock(productId, difference);
  }

  if (difference < 0) {
    await inventoryService.releaseStock(productId, Math.abs(difference));
  }

  item.quantity = newQuantity;

  await cart.save();

  return Cart.findById(cart._id).populate(
    'items.product',
    `
    name
    slug
    price
    images
    stockQuantity
    reservedQuantity
    lowStockThreshold
  `,
  );
};

const removeCartItem = async (userId, productId) => {
  const cart = await Cart.findOne({
    user: userId,
  });

  if (!cart) {
    throw new AppError('Cart not found', 404);
  }

  const item = cart.items.find((item) => item.product.toString() === productId);

  if (!item) {
    throw new AppError('Cart item not found', 404);
  }

  await inventoryService.releaseStock(productId, item.quantity);

  cart.items = cart.items.filter(
    (item) => item.product.toString() !== productId,
  );

  await cart.save();

  return Cart.findById(cart._id).populate({
    path: 'items.product',
    select: [
      'name',
      'slug',
      'price',
      'images',
      'stockQuantity',
      'reservedQuantity',
      'lowStockThreshold',
    ].join(' '),
  });
};

module.exports = {
  addItemToCart,
  getMyCart,
  updateCartItemQuantity,
  removeCartItem,
};
