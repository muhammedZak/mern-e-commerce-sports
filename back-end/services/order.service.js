const mongoose = require('mongoose');

const Order = require('../models/order.model');
const Cart = require('../models/cart.model');
const Product = require('../models/product.model');
const User = require('../models/user.model');

const AppError = require('../utils/app-error.util');

const inventoryService = require('./inventory.service');
const checkoutService = require('./checkout.service');

const {
  ORDER_STATUS,
  PAYMENT_STATUS,
} = require('../constants/order.constants');

const { generateOrderNumber } = require('../utils/order-number.util');
const { PRODUCT_STATUS } = require('../constants/product.constants');

const createOrder = async (userId, addressId, notes = '') => {
  const { cart, address, subtotal, shippingCost, tax, total } =
    await checkoutService.validateCheckout(userId, addressId);

  const orderItems = cart.items.map((item) => ({
    product: item.product._id,
    productName: item.product.name,
    sku: item.product.sku,
    image: item.product.primaryImage?.url || '',
    unitPrice: item.priceSnapshot,
    quantity: item.quantity,
    lineTotal: item.priceSnapshot * item.quantity,
  }));

  const session = await mongoose.startSession();

  try {
    let createdOrder;

    await session.withTransaction(async () => {
      for (const item of cart.items) {
        await inventoryService.commitStock(
          item.product._id,
          item.quantity,
          session,
        );
      }

      const orders = await Order.create(
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
        { session },
      );

      createdOrder = orders[0];

      cart.items = [];

      await cart.save({ session });
    });

    return createdOrder;
  } catch (error) {
    throw error;
  } finally {
    await session.endSession();
  }
};

const getMyOrders = async (userId) => {
  return Order.find({
    user: userId,
  })
    .select(
      `
    orderNumber
    total
    orderStatus
    paymentStatus
    createdAt
  `,
    )
    .sort({
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
