const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
} = require('../controllers/auth.controller');
const {
  registerValidation,
  loginValidation,
  verifyEmailValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
} = require('../validators/auth.validator');
const validate = require('../middleware/validate.middleware');
const { protect } = require('../middleware/auth.middleware');

router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);
router.get('/me', protect, getMe);
router.post('/logout', logout);
router.post('/verify-email', verifyEmailValidation, validate, verifyEmail);
router.post(
  '/forgot-password',
  forgotPasswordValidation,
  validate,
  forgotPassword,
);
router.post(
  '/reset-password',
  resetPasswordValidation,
  validate,
  resetPassword,
);

module.exports = router;
