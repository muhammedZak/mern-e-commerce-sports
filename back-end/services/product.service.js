const Product = require('../models/product.model');
const AppError = require('../utils/app-error.util');

const createProduct = async (productData, userId) => {
  const existingSku = await Product.findOne({
    sku: productData.sku,
  });

  if (existingSku) {
    throw new AppError('Product SKU already exists', 409);
  }

  const product = await Product.create({
    ...productData,
    createdBy: userId,
  });

  return product;
};

module.exports = {
  createProduct,
};
