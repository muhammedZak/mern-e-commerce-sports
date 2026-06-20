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

const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select('+password');

  if (!user) {
    throw new AppError('User not found', 404);
  }

  const isMatch = await user.comparePassword(currentPassword);

  if (!isMatch) {
    throw new AppError('Current password is incorrect', 400);
  }

  user.password = newPassword;

  await user.save();

  return {
    message: 'Password changed successfully',
  };
};

const getAddresses = async (user) => {
  return user.address;
};

const addAddress = async (user, addressData) => {
  if (addressData.isPrimary || user.address.length === 0) {
    user.address.forEach((address) => {
      address.isPrimary = false;
    });

    addressData.isPrimary = true;
  }

  user.address.push(addressData);

  await user.save();

  return user.address;
};

const updateAddress = async (user, addressId, updateData) => {
  const address = user.address.id(addressId);

  if (!address) {
    throw new AppError('Address not found', 404);
  }

  if (updateData.isPrimary) {
    user.address.forEach((item) => {
      item.isPrimary = false;
    });
  }

  Object.keys(updateData).forEach((key) => {
    address[key] = updateData[key];
  });

  await user.save();

  return user.address;
};

const deleteAddress = async (user, addressId) => {
  const address = user.address.id(addressId);

  if (!address) {
    throw new AppError('Address not found', 404);
  }

  const wasPrimary = address.isPrimary;

  address.deleteOne();

  if (wasPrimary && user.address.length > 0) {
    user.address[0].isPrimary = true;
  }

  await user.save();

  return user.address;
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
};
