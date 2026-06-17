const mongoose = require('mongoose');
const Product = require('../models/product.model');
const Category = require('../models/category.model');
const AppError = require('../utils/app-error.util');
const ApiQuery = require('../utils/api-query.util');

const createProduct = async (productData, userId) => {
  const existingSku = await Product.findOne({
    sku: productData.sku,
  });

  if (existingSku) {
    throw new AppError('Product SKU already exists', 409);
  }

  const category = await Category.findOne({
    _id: productData.category,
    isDeleted: false,
  });

  if (!category) {
    throw new AppError('Category not found', 404);
  }

  const product = await Product.create({
    ...productData,
    createdBy: userId,
  });

  return product;
};

const getProducts = async (queryParams) => {
  const queryBuilder = new ApiQuery(queryParams)
    .filter(['brand', 'status', 'featured', 'category'])
    .search(['name', 'brand']);

  const filters = {
    isDeleted: false,
    status: 'active',
    ...queryBuilder.getFilters(),
  };

  const { page, limit, skip } = queryBuilder.getPagination();

  const sort = queryBuilder.getSort();

  const [products, total] = await Promise.all([
    Product.find(filters)
      .populate('category', 'name slug')
      .sort(sort)
      .skip(skip)
      .limit(limit),

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

const getProduct = async (identifier) => {
  let query = {
    isDeleted: false,
    status: 'active',
  };

  if (mongoose.Types.ObjectId.isValid(identifier)) {
    query._id = identifier;
  } else {
    query.slug = identifier;
  }

  const product = await Product.findOne(query).populate(
    'category',
    'name slug',
  );

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  return product;
};

const updateProduct = async (productId, updateData) => {
  const product = await Product.findById(productId);

  if (!product || product.isDeleted) {
    throw new AppError('Product not found', 404);
  }

  const allowedFields = [
    'name',
    'shortDescription',
    'description',
    'brand',
    'price',
    'compareAtPrice',
    'stockQuantity',
    'featured',
    'status',
    'images',
  ];

  Object.keys(updateData).forEach((key) => {
    if (allowedFields.includes(key)) {
      product[key] = updateData[key];
    }
  });

  await product.save();

  return product;
};

const archiveProduct = async (productId) => {
  const product = await Product.findById(productId);

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  product.isDeleted = true;
  product.status = 'archived';

  await product.save();

  return;
};

const restoreProduct = async (productId) => {
  const product = await Product.findById(productId);

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  product.isDeleted = false;
  product.status = 'active';

  await product.save();

  return product;
};

module.exports = {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  archiveProduct,
  restoreProduct,
};
