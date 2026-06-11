const express = require('express');
const router = express.Router();
const { register } = require('../controllers/auth.controller');
const { registerValidation } = require('../validators/auth.validator');
const validate = require('../middleware/validate.middleware');

router.post('/register', registerValidation, validate, register);

module.exports = router;
