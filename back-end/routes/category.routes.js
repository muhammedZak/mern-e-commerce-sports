const express = require('express');

const router = express.Router();

const {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  archiveCategory,
  restoreCategory,
  getCategoryProducts,
} = require('../controllers/category.controller');

const {
  createCategoryValidation,
  updateCategoryValidation,
} = require('../validators/category.validator');

const validate = require('../middleware/validate.middleware');

const { protect, authorize } = require('../middleware/auth.middleware');

const { USER_ROLES } = require('../constants/user.constants');

router.get('/', getCategories);
router.get('/:slug/products', getCategoryProducts);
router.get('/:identifier', getCategory);

router.post(
  '/',
  protect,
  authorize(USER_ROLES.ADMIN),
  createCategoryValidation,
  validate,
  createCategory,
);

router.patch(
  '/:id',
  protect,
  authorize(USER_ROLES.ADMIN),
  updateCategoryValidation,
  validate,
  updateCategory,
);

router.delete('/:id', protect, authorize(USER_ROLES.ADMIN), archiveCategory);

router.patch(
  '/:id/restore',
  protect,
  authorize(USER_ROLES.ADMIN),
  restoreCategory,
);

module.exports = router;
