const Category = require('../models/category.model');
const mongoose = require('mongoose');
const AppError = require('../utils/app-error.util');
const ApiQuery = require('../utils/api-query.util');

const createCategory = async (categoryData, userId) => {
  const existingCategory = await Category.findOne({
    name: categoryData.name,
  });

  if (existingCategory) {
    throw new AppError('Category already exists', 409);
  }

  const category = await Category.create({
    ...categoryData,
    createdBy: userId,
  });

  return category;
};

const getCategories = async (queryParams) => {
  const queryBuilder = new ApiQuery(queryParams)
    .filter(['status'])
    .search(['name']);

  const filters = {
    isDeleted: false,
    ...queryBuilder.getFilters(),
  };

  const { page, limit, skip } = queryBuilder.getPagination();

  const sort = queryBuilder.getSort();

  const [categories, total] = await Promise.all([
    Category.find(filters).sort(sort).skip(skip).limit(limit),

    Category.countDocuments(filters),
  ]);

  return {
    categories,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getCategory = async (identifier) => {
  let query = {
    isDeleted: false,
  };

  if (mongoose.Types.ObjectId.isValid(identifier)) {
    query._id = identifier;
  } else {
    query.slug = identifier;
  }

  const category = await Category.findOne(query);

  if (!category) {
    throw new AppError('Category not found', 404);
  }

  return category;
};

const updateCategory = async (categoryId, updateData) => {
  const category = await Category.findById(categoryId);

  if (!category || category.isDeleted) {
    throw new AppError('Category not found', 404);
  }

  const allowedFields = ['name', 'description', 'image', 'status'];

  Object.keys(updateData).forEach((key) => {
    if (allowedFields.includes(key)) {
      category[key] = updateData[key];
    }
  });

  await category.save();

  return category;
};

const archiveCategory = async (categoryId) => {
  const category = await Category.findById(categoryId);

  if (!category) {
    throw new AppError('Category not found', 404);
  }

  category.isDeleted = true;

  await category.save();
};

const restoreCategory = async (categoryId) => {
  const category = await Category.findById(categoryId);

  if (!category) {
    throw new AppError('Category not found', 404);
  }

  category.isDeleted = false;

  await category.save();

  return category;
};

module.exports = {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  archiveCategory,
  restoreCategory,
};
