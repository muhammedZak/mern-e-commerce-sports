const mongoose = require('mongoose');

const Order = require('../models/order.model');
const Cart = require('../models/cart.model');
const Product = require('../models/product.model');
const User = require('../models/user.model');

const AppError = require('../utils/app-error.util');

const inventoryService = require('./inventory.service');

const {
  ORDER_STATUS,
  PAYMENT_STATUS,
} = require('../constants/order.constants');

const { generateOrderNumber } = require('../utils/order-number.util');
const { PRODUCT_STATUS } = require('../constants/product.constants');

const createOrder = async (userId, addressId, notes = '') => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  const cart = await Cart.findOne({ user: userId }).populate('items.product');

  if (!cart || cart.items.length === 0) {
    throw new AppError('Cart is empty', 400);
  }

  const address = user.address.id(addressId);

  if (!address) {
    throw new AppError('Shipping address not found', 404);
  }

  const orderItems = [];

  let subtotal = 0;

  for (const item of cart.items) {
    const product = item.product;

    if (
      !product ||
      product.isDeleted ||
      product.status !== PRODUCT_STATUS.ACTIVE
    ) {
      throw new AppError(`Product unavailabel: ${product?.name || 'Unknown'}`);
    }

    const lineTotal = item.priceSnapshot * item.quantity;

    subtotal += lineTotal;

    orderItems.push({
      product: product._id,
      productName: product.name,
      sku: product.sku,
      image: product.primaryImage?.url || '',
      unitPrice: item.priceSnapshot,
      quantity: item.quantity,
      lineTotal,
    });
  }

  const shippingCost = 0;
  const tax = 0;
  const total = subtotal + shippingCost + tax;

  const session = await mongoose.startSession();

  try {
    let order;

    await session.withTransaction(async () => {
      for (const item of cart.items) {
        await inventoryService.commitStock(
          item.product._id,
          item.quantity,
          session,
        );
      }

      order = await Order.create(
        [
          {
            orderNumber: generateOrderNumber(),
            user: userId,
            items: orderItems,
            subtotal,
            shippingCost,
            tax,
            total,
            shippingAddress: {
              street: address.street,
              city: address.city,
              state: address.state,
              zipCode: address.zipCode,
              country: address.country,
              label: address.label,
            },
            orderStatus: ORDER_STATUS.PENDING,
            paymentStatus: PAYMENT_STATUS.PENDING,
            notes,
          },
        ],
        {
          session,
        },
      );
      cart.items = [];
      await cart.save({ session });

      order = order[0];
    });

    return order;
  } finally {
    await session.endSession();
  }
};

const getMyOrders = async (userId) => {
  return Order.find({
    user: userId,
  }).sort({
    createdAt: -1,
  });
};

const getOrderById = async (orderId, userId) => {
  const order = await Order.findOne({
    _id: orderId,
    user: userId,
  }).populate(
    'items.product',
    `
  name
  slug
  images
`,
  );

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  return order;
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
};
