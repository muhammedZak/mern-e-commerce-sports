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

const getProduct = async (req, res, next) => {
  try {
    const product = await productService.getProduct(req.params.identifier);

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const product = await productService.updateProduct(req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

const archiveProduct = async (req, res, next) => {
  try {
    await productService.archiveProduct(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Product archived successfully',
    });
  } catch (error) {
    next(error);
  }
};

const restoreProduct = async (req, res, next) => {
  try {
    const product = await productService.restoreProduct(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Product restored successfully',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

const uploadProductImages = async (req, res, next) => {
  try {
    const product = await productService.uploadProductImages(
      req.params.id,
      req.files,
    );

    res.status(200).json({
      success: true,
      message: 'Images uploaded successfully',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

const deleteProductImage = async (req, res, next) => {
  try {
    const product = await productService.deleteProductImage(
      req.params.id,
      req.params.filename,
    );

    res.status(200).json({
      success: true,
      message: 'Image deleted successfully',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

const setPrimaryImage = async (req, res, next) => {
  try {
    const product = await productService.setPrimaryImage(
      req.params.id,
      req.body.filename,
    );

    res.status(200).json({
      success: true,
      message: 'Primary image updated successfully',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

const reorderImages = async (req, res, next) => {
  try {
    const product = await productService.reorderImages(
      req.params.id,
      req.body.images,
    );

    res.status(200).json({
      success: true,
      message: 'Product gallery reordered successfully',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

const updateImageAltText = async (req, res, next) => {
  try {
    const product = await productService.updateImageAltText(
      req.params.id,
      req.body.filename,
      req.body.alt,
    );

    res.status(200).json({
      success: true,
      message: 'Image alt text updated successfully',
      data: product,
    });
  } catch (error) {
    next(error);
  }
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
