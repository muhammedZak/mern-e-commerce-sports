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

module.exports = {
  createCategory,
  getCategories,
  getCategory,
};
