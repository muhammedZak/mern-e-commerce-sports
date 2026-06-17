const Product = require('../models/product.model');
const AppError = require('../utils/app-error.util');
const ApiQuery = require('../utils/api-query.util');

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

const getProducts = async (queryParams) => {
  const queryBuilder = new ApiQuery(queryParams)
    .filter()
    .search(['name', 'brand']);

  const filters = {
    isDeleted: false,
    status: 'active',
    ...queryBuilder.getFilters(),
  };

  const { page, limit, skip } = queryBuilder.getPagination();

  const sort = queryBuilder.getSort();

  const [products, total] = await Promise.all([
    Product.find(filters).sort(sort).skip(skip).limit(limit),

    Product.countDocuments(filters),
  ]);

  return {
    products,

    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

module.exports = {
  createProduct,
  getProducts,
};
