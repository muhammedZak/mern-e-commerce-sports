const mongoose = require('mongoose');
const validator = require('validator');

const { generateToken } = require('../utils/token.util');
const { hashPassword, comparePassword } = require('../utils/password.util');

const TOKEN_EXPIRY_MINUTES = Number(process.env.TOKEN_EXPIRY_MINUTES || 10);
const { USER_ROLES, USER_STATUS } = require('../constants/user.constants');

const addressSchema = new mongoose.Schema({
  street: {
    type: String,
    trim: true,
  },
  city: {
    type: String,
    trim: true,
  },
  state: {
    type: String,
    trim: true,
  },
  zipCode: {
    type: String,
    trim: true,
  },
  country: {
    type: String,
    trim: true,
  },
  isPrimary: {
    type: Boolean,
    default: false,
  },
  label: {
    type: String,
    trim: true,
  },
});

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      validate: [validator.isEmail, 'Invalid email address'],
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
      validate: {
        validator: (value) => !value || validator.isMobilePhone(value, 'any'),
        message: 'Invalid phone number',
      },
    },
    avatar: {
      type: String,
      trim: true,
    },
    dateOfBirth: {
      type: Date,
    },
    address: [addressSchema],
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      default: USER_ROLES.CUSTOMER,
    },
    status: {
      type: String,
      enum: Object.values(USER_STATUS),
      default: USER_STATUS.ACTIVE,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isPhoneVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
      trim: true,
    },
    emailVerificationTokenExpires: {
      type: Date,
    },
    phoneVerificationToken: {
      type: String,
      trim: true,
    },
    phoneVerificationTokenExpires: {
      type: Date,
    },
    passwordResetToken: {
      type: String,
      trim: true,
    },
    passwordResetExpires: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  this.password = await hashPassword(this.password);
});

userSchema.pre('findOneAndUpdate', async function (next) {
  try {
    this.setOptions({
      runValidators: true,
    });

    const update = this.getUpdate();

    if (!update) {
      return next();
    }

    const password = update.password || update.$set?.password;

    if (!password) {
      return next();
    }

    if (typeof password === 'string' && password.startsWith('$2')) {
      return next(
        new Error('Hashed passwords must not be supplied to update operations'),
      );
    }

    const hashedPassword = await hashPassword(password);

    if (update.password) {
      update.password = hashedPassword;
    }

    if (update.$set?.password) {
      update.$set.password = hashedPassword;
    }

    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await comparePassword(candidatePassword, this.password);
};

userSchema.methods.generatePasswordResetToken = function () {
  const { rawToken, hashedToken } = generateToken();
  this.passwordResetToken = hashedToken;
  this.passwordResetExpires = Date.now() + TOKEN_EXPIRY_MINUTES * 60 * 1000; // Token expiry time
  return rawToken;
};

userSchema.methods.generateEmailVerificationToken = function () {
  const { rawToken, hashedToken } = generateToken();
  this.emailVerificationToken = hashedToken;
  this.emailVerificationTokenExpires =
    Date.now() + TOKEN_EXPIRY_MINUTES * 60 * 1000; // Token expiry time
  return rawToken;
};

userSchema.methods.generatePhoneVerificationToken = function () {
  const { rawToken, hashedToken } = generateToken();
  this.phoneVerificationToken = hashedToken;
  this.phoneVerificationTokenExpires =
    Date.now() + TOKEN_EXPIRY_MINUTES * 60 * 1000; // Token expiry time
  return rawToken;
};

module.exports = mongoose.model('User', userSchema);
