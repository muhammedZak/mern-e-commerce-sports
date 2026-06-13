const User = require('../models/user.model');
const AppError = require('../utils/app-error.util');
const { generateAccessToken } = require('../utils/jwt.util');
const { USER_STATUS } = require('../constants/user.constants');
const emailService = require('./email.service');
const crypto = require('crypto');

const registerUser = async (userData) => {
  const existingUser = await User.findOne({ email: userData.email });

  if (existingUser) {
    throw new AppError('Email already exists', 409);
  }

  const user = new User({
    firstName: userData.firstName,
    lastName: userData.lastName,
    email: userData.email,
    password: userData.password,
  });

  const verificationToken = user.generateEmailVerificationToken();

  try {
    await user.save();
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];

      throw new AppError(`${field} already exists`, 409);
    }

    throw error;
  }

  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

  try {
    await emailService.sendVerificationEmail({
      email: user.email,
      firstName: user.firstName,
      verificationUrl,
    });
  } catch (error) {
    console.error('Failed to send verification email:', error);
  }

  return {
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    status: user.status,
    isEmailVerified: user.isEmailVerified,
  };
};

const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    throw new AppError('Invalid email or password', 401);
  }

  if (user.status !== USER_STATUS.ACTIVE) {
    throw new AppError('Account is not active', 403);
  }

  const token = generateAccessToken({ userId: user._id, role: user.role });

  return {
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      status: user.status,
      isEmailVerified: user.isEmailVerified,
    },
    token,
  };
};

const verifyEmail = async ({ token }) => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationTokenExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new AppError('Invalid or expired verification token', 400);
  }

  user.isEmailVerified = true;

  user.emailVerificationToken = undefined;
  user.emailVerificationTokenExpires = undefined;

  await user.save();

  return {
    message: 'Email verified successfully',
  };
};

module.exports = { registerUser, loginUser, verifyEmail };
