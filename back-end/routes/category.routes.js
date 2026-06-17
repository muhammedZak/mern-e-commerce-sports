const express = require('express');

const router = express.Router();

const {
  createCategory,
  getCategories,
  getCategory,
} = require('../controllers/category.controller');

const {
  createCategoryValidation,
} = require('../validators/category.validator');

const validate = require('../middleware/validate.middleware');

const { protect, authorize } = require('../middleware/auth.middleware');

const { USER_ROLES } = require('../constants/user.constants');

router.get('/', getCategories);
router.get('/:identifier', getCategory);

router.post(
  '/',
  protect,
  authorize(USER_ROLES.ADMIN),
  createCategoryValidation,
  validate,
  createCategory,
);

module.exports = router;
