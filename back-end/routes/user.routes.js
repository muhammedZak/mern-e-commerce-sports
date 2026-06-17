const express = require('express');
const router = express.Router();

const {
  getProfile,
  updatedProfile,
  changePassword,
} = require('../controllers/user.controller');
const {
  updateProfileValidation,
  changePasswordValidation,
} = require('../validators/auth.validator');
const validate = require('../middleware/validate.middleware');
const { protect } = require('../middleware/auth.middleware');

router.get('/me', protect, getProfile);
router.patch('/me', protect, updateProfileValidation, validate, updatedProfile);
router.patch(
  '/change-password',
  protect,
  changePasswordValidation,
  validate,
  changePassword,
);

module.exports = router;
