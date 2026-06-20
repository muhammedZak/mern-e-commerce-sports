const express = require('express');
const router = express.Router();

const {
  getProfile,
  updatedProfile,
  changePassword,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
} = require('../controllers/user.controller');
const {
  updateProfileValidation,
  changePasswordValidation,
  addressValidation,
  addressIdValidation,
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

router.get('/addresses', protect, getAddresses);

router.post('/addresses', protect, addressValidation, validate, addAddress);

router.patch(
  '/addresses/:addressId',
  protect,
  addressIdValidation,
  addressValidation,
  validate,
  updateAddress,
);

router.delete(
  '/addresses/:addressId',
  protect,
  addressIdValidation,
  validate,
  deleteAddress,
);

module.exports = router;
