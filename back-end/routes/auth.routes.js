const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/auth.controller');
const {
  registerValidation,
  loginValidation,
} = require('../validators/auth.validator');
const validate = require('../middleware/validate.middleware');

router.post('/register', registerValidation, validate, register);
router.post('/login', validate, login);

module.exports = router;
