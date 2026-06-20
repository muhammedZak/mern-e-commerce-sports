const { body, param } = require('express-validator');

const registerValidation = [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must not exceed 50 characters'),
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must not exceed 50 characters'),
  body('email')
    .trim()
    .normalizeEmail()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({
      min: 8,
      max: 128,
    })
    .withMessage(
      'Password must be at least 8 characters long and must not exceed 128 charecters',
    )
    .isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
    .withMessage(
      'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    ),
];

const loginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email address'),

  body('password').notEmpty().withMessage('Password is required'),
];

const verifyEmailValidation = [
  body('token').trim().notEmpty().withMessage('Verification token is required'),
];

const forgotPasswordValidation = [
  body('email')
    .trim()
    .normalizeEmail()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email address'),
];

const resetPasswordValidation = [
  body('token').trim().notEmpty().withMessage('Token is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({
      min: 8,
      max: 128,
    })
    .withMessage(
      'Password must be at least 8 characters long and must not exceed 128 characters',
    )
    .isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
    .withMessage(
      'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    ),
  body('confirmPassword')
    .notEmpty()
    .withMessage('Confirm password is required')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }

      return true;
    }),
];

const updateProfileValidation = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be between 1 and 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be between 1 and 50 characters'),
  body('phone')
    .optional()
    .trim()
    .isMobilePhone()
    .withMessage('Invalid phone number'),
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .notEmpty()
    .withMessage('New password is required')
    .isLength({
      min: 8,
      max: 128,
    })
    .withMessage(
      'Password must be at least 8 characters long and must not exceed 128 characters',
    )
    .isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
    .withMessage(
      'Password must contain uppercase, lowercase, number and special character',
    )
    .custom((value, { req }) => {
      if (value === req.body.currentPassword) {
        throw new Error('New password must be different from current password');
      }

      return true;
    }),
  body('confirmPassword')
    .notEmpty()
    .withMessage('Confirm password is required')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Passwords do not match');
      }

      return true;
    }),
];

const addressValidation = [
  body('street')
    .trim()
    .notEmpty()
    .withMessage('Street is required')
    .isLength({ max: 200 })
    .withMessage('Street must not exceed 200 characters'),

  body('city')
    .trim()
    .notEmpty()
    .withMessage('City is required')
    .isLength({ max: 100 })
    .withMessage('City must not exceed 100 characters'),

  body('state')
    .trim()
    .notEmpty()
    .withMessage('State is required')
    .isLength({ max: 100 })
    .withMessage('State must not exceed 100 characters'),

  body('zipCode')
    .trim()
    .notEmpty()
    .withMessage('Zip code is required')
    .isLength({ max: 20 })
    .withMessage('Zip code must not exceed 20 characters'),

  body('country')
    .trim()
    .notEmpty()
    .withMessage('Country is required')
    .isLength({ max: 100 })
    .withMessage('Country must not exceed 100 characters'),

  body('label')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Label must not exceed 50 characters'),

  body('isPrimary')
    .optional()
    .isBoolean()
    .withMessage('isPrimary must be a boolean'),
];

const addressIdValidation = [
  param('addressId').isMongoId().withMessage('Invalid address ID'),
];

module.exports = {
  registerValidation,
  loginValidation,
  verifyEmailValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  updateProfileValidation,
  changePasswordValidation,
  addressIdValidation,
  addressValidation,
};
