const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  logout,
  verifyEmail,
} = require('../controllers/auth.controller');
const {
  registerValidation,
  loginValidation,
  verifyEmailValidation,
} = require('../validators/auth.validator');
const validate = require('../middleware/validate.middleware');
const { protect } = require('../middleware/auth.middleware');

router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);
router.get('/me', protect, getMe);
router.post('/logout', logout);
router.post('/verify-email', verifyEmailValidation, validate, verifyEmail);

module.exports = router;
