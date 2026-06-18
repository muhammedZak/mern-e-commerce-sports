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
} = require('../controllers/product.controller');

const {
  createProductValidation,
  updateProductValidation,
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
  validate,
  updateProduct,
);
router.delete('/:id', protect, authorize(USER_ROLES.ADMIN), archiveProduct);
router.patch(
  '/:id/restore',
  protect,
  authorize(USER_ROLES.ADMIN),
  restoreProduct,
);

router.post(
  '/:id/images',
  protect,
  authorize(USER_ROLES.ADMIN),
  upload.array('images', 10),
  uploadProductImages,
);

module.exports = router;
