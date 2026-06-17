const express = require('express');
const router = express.Router();

const {
  getProfile,
  updatedProfile,
} = require('../controllers/user.controller');
const { updateProfileValidation } = require('../validators/auth.validator');
const validate = require('../middleware/validate.middleware');
const { protect } = require('../middleware/auth.middleware');

router.get('/me', protect, getProfile);
router.patch('/me', protect, updateProfileValidation, validate, updatedProfile);

module.exports = router;
