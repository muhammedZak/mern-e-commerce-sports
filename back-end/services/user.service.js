const User = require('../models/user.model');
const AppError = require('../utils/app-error.util');

const getProfile = async (user) => {
  return {
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    status: user.status,
    isEmailVerified: user.isEmailVerified,
    isPhoneVerified: user.isPhoneVerified,
    address: user.address,
  };
};

const updateProfile = async (user, updateData) => {
  if (!user) {
    throw new AppError('User not found', 404);
  }

  const allowedFields = ['firstName', 'lastName', 'phone'];

  allowedFields.forEach((field) => {
    if (updateData[field] !== undefined) {
      user[field] = updateData[field];
    }
  });

  await user.save();

  return {
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    status: user.status,
    isEmailVerified: user.isEmailVerified,
  };
};

module.exports = { getProfile, updateProfile };
