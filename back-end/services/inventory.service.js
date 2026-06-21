const Product = require('../models/product.model');
const InventoryHistory = require('../models/inventory-history.model');

const AppError = require('../utils/app-error.util');

const { PRODUCT_STATUS } = require('../constants/product.constants');

const adjustInventory = async (productId, adjustment, reason, userId) => {
  const product = await Product.findOne({
    _id: productId,
    isDeleted: false,
  });

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  const previousQuantity = product.stockQuantity;

  const newQuantity = previousQuantity + adjustment;

  if (newQuantity < 0) {
    throw new AppError('Insufficient stock', 400);
  }

  product.stockQuantity = newQuantity;

  await product.save();

  await InventoryHistory.create({
    product: product._id,
    previousQuantity,
    newQuantity,
    adjustment,
    reason,
    adjustedBy: userId,
  });

  return product;
};

const getInventoryHistory = async (productId) => {
  const history = await InventoryHistory.find({
    product: productId,
  })
    .populate('adjustedBy', 'firstName lastName email')
    .sort({
      createdAt: -1,
    });

  return history;
};

const getInventorySummary = async (productId) => {
  const product = await Product.findOne({
    _id: productId,
    isDeleted: false,
  });

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  return {
    productId: product._id,
    stockQuantity: product.stockQuantity,
    reservedQuantity: product.reservedQuantity,
    availableStock: product.availableStock,
    lowStockThreshold: product.lowStockThreshold,
    inStock: product.inStock,
    lowStock: product.lowStock,
    inventoryStatus: product.inventoryStatus,
  };
};

const reserveStock = async (productId, quantity) => {
  const product = await Product.findOneAndUpdate(
    {
      _id: productId,
      isDeleted: false,
      status: PRODUCT_STATUS.ACTIVE,
      $expr: {
        $gte: [
          {
            $subtract: ['$stockQuantity', '$reservedQuantity'],
          },
          quantity,
        ],
      },
    },
    {
      $inc: {
        reservedQuantity: quantity,
      },
    },
    {
      new: true,
    },
  );

  if (!product) {
    throw new AppError('Insufficient inventory available', 400);
  }

  return product;
};

const releaseStock = async (productId, quantity) => {
  const product = await Product.findOne({
    _id: productId,
    isDeleted: false,
  });

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  const releaseAmount = Math.min(quantity, product.reservedQuantity);

  product.reservedQuantity -= releaseAmount;

  await product.save();

  return product;
};

const commitStock = async (productId, quantity) => {
  const product = await Product.findOneAndUpdate(
    {
      _id: productId,
      isDeleted: false,
      reservedQuantity: {
        $gte: quantity,
      },
    },
    {
      $inc: {
        stockQuantity: -quantity,
        reservedQuantity: -quantity,
      },
    },
    {
      new: true,
    },
  );

  if (!product) {
    throw new AppError('Insufficient reserved inventory', 400);
  }

  return product;
};

module.exports = {
  adjustInventory,
  getInventoryHistory,
  getInventorySummary,
  reserveStock,
  releaseStock,
  commitStock,
};
