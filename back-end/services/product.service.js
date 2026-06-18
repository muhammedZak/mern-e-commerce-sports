const path = require('path');
const mongoose = require('mongoose');
const Product = require('../models/product.model');
const Category = require('../models/category.model');
const AppError = require('../utils/app-error.util');
const ApiQuery = require('../utils/api-query.util');
const { deleteFile } = require('../utils/file.util');
const { MAX_PRODUCT_IMAGES } = require('../constants/upload.constants');

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

const uploadProductImages = async (productId, files) => {
  const product = await Product.findOne({ _id: productId, isDeleted: false });

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  if (!files || files.length === 0) {
    throw new AppError('At least one image is required', 400);
  }

  const totalImages = product.images.length + files.length;

  if (totalImages > MAX_PRODUCT_IMAGES) {
    throw new AppError(`Maximum ${MAX_PRODUCT_IMAGES} images allowed`, 400);
  }

  const nextSortOrder =
    product.images.length > 0
      ? Math.max(...product.images.map((image) => image.sortOrder)) + 1
      : 1;

  const imageDocuments = files.map((file, index) => ({
    url: `/uploads/products/${file.filename}`,
    filename: file.filename,
    alt: product.name,
    isPrimary: product.images.length === 0 && index === 0,
    sortOrder: nextSortOrder + 1,
  }));

  product.images.push(...imageDocuments);

  await product.save();

  return product;
};

const deleteProductImage = async (productId, filename) => {
  const product = await Product.findOne({
    _id: productId,
    isDeleted: false,
  });

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  const imageIndex = product.images.findIndex(
    (image) => image.filename === filename,
  );

  if (imageIndex === -1) {
    throw new AppError('Image not found', 404);
  }

  const imageToDelete = product.images[imageIndex];

  const wasPrimary = imageToDelete.isPrimary;

  product.images.splice(imageIndex, 1);

  if (wasPrimary && product.images.length > 0) {
    product.images[0].isPrimary = true;
  }

  await product.save();

  const filePath = path.join(process.cwd(), 'uploads', 'products', filename);

  await deleteFile(filePath);

  return product;
};

const setPrimaryImage = async (productId, filename) => {
  const product = await Product.findOne({
    _id: productId,
    isDeleted: false,
  });

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  const image = product.images.find((img) => img.filename === filename);

  if (!image) {
    throw new AppError('Image not found', 404);
  }

  product.images.forEach((img) => {
    img.isPrimary = false;
  });

  image.isPrimary = true;

  await product.save();

  return product;
};

const reorderImages = async (productId, imageOrder) => {
  const product = await Product.findOne({
    _id: productId,
    isDeleted: false,
  });

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  if (imageOrder.length !== product.images.length) {
    throw new AppError('Image order does not match gallery', 400);
  }

  const imageMap = new Map();

  product.images.forEach((image) => {
    imageMap.set(image.filename, image);
  });

  imageOrder.forEach((filename, index) => {
    const image = imageMap.get(filename);

    if (!image) {
      throw new AppError(`Invalid image: ${filename}`, 400);
    }

    image.sortOrder = index + 1;
  });

  product.images.sort((a, b) => a.sortOrder - b.sortOrder);

  await product.save();

  return product;
};

const updateImageAltText = async (productId, filename, alt) => {
  const product = await Product.findOne({
    _id: productId,
    isDeleted: false,
  });

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  const image = product.images.find((img) => img.filename === filename);

  if (!image) {
    throw new AppError('Image not found', 404);
  }

  image.alt = alt;

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
  uploadProductImages,
  deleteProductImage,
  setPrimaryImage,
  reorderImages,
  updateImageAltText,
};
