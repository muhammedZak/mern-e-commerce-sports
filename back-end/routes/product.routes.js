const express = require('express');

const upload = require('../middleware/upload.middlware');

const { USER_ROLES } = require('../constants/user.constants');

const router = express.Router();

const {
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
} = require('../controllers/product.controller');

const {
  createProductValidation,
  updateProductValidation,
  setPrimaryImageValidation,
  reorderImagesValidation,
  updateImageAltTextValidation,
  productIdValidation,
} = require('../validators/product.validator');

const validate = require('../middleware/validate.middleware');

const { protect, authorize } = require('../middleware/auth.middleware');

router.post(
  '/',
  protect,
  authorize(USER_ROLES.ADMIN),
  createProductValidation,
  validate,
  createProduct,
);

router.get('/', getProducts);
router.get('/:identifier', getProduct);
router.patch(
  '/:id',
  protect,
  authorize(USER_ROLES.ADMIN),
  updateProductValidation,
  productIdValidation,
  validate,
  updateProduct,
);
router.delete(
  '/:id',
  protect,
  authorize(USER_ROLES.ADMIN),
  productIdValidation,
  validate,
  archiveProduct,
);
router.patch(
  '/:id/restore',
  protect,
  authorize(USER_ROLES.ADMIN),
  productIdValidation,
  validate,
  restoreProduct,
);

router.post(
  '/:id/images',
  protect,
  authorize(USER_ROLES.ADMIN),
  productIdValidation,
  validate,
  upload.array('images', 10),
  uploadProductImages,
);

router.delete(
  '/:id/images/:filename',
  protect,
  authorize(USER_ROLES.ADMIN),
  productIdValidation,
  validate,
  deleteProductImage,
);

router.patch(
  '/:id/images/primary',
  protect,
  authorize(USER_ROLES.ADMIN),
  productIdValidation,
  setPrimaryImageValidation,
  validate,
  setPrimaryImage,
);

router.patch(
  '/:id/images/reorder',
  protect,
  authorize(USER_ROLES.ADMIN),
  productIdValidation,
  reorderImagesValidation,
  validate,
  reorderImages,
);

router.patch(
  '/:id/images/alt-text',
  protect,
  authorize(USER_ROLES.ADMIN),
  productIdValidation,
  updateImageAltTextValidation,
  validate,
  updateImageAltText,
);

module.exports = router;
