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
  categoryIdValidation,
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
  categoryIdValidation,
  updateCategoryValidation,
  validate,
  updateCategory,
);

router.delete(
  '/:id',
  protect,
  authorize(USER_ROLES.ADMIN),
  categoryIdValidation,
  validate,
  archiveCategory,
);

router.patch(
  '/:id/restore',
  protect,
  authorize(USER_ROLES.ADMIN),
  categoryIdValidation,
  validate,
  restoreCategory,
);

module.exports = router;
