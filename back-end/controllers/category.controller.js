const categoryService = require('../services/category.service');

const createCategory = async (req, res, next) => {
  try {
    const category = await categoryService.createCategory(
      req.body,
      req.user._id,
    );

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

const getCategories = async (req, res, next) => {
  try {
    const result = await categoryService.getCategories(req.query);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getCategory = async (req, res, next) => {
  try {
    const category = await categoryService.getCategory(req.params.identifier);

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCategory,
  getCategories,
  getCategory,
};
