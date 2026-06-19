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

module.exports = {
  addItemToCart,
};
