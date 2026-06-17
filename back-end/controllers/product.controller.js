const productService = require('../services/product.service');

const createProduct = async (req, res, next) => {
  try {
    const product = await productService.createProduct(req.body, req.user._id);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

const getProducts = async (req, res, next) => {
  try {
    const result = await productService.getProducts(req.query);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProduct,
  getProducts,
};
