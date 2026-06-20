const userService = require('../services/user.service');

const getProfile = async (req, res, next) => {
  try {
    const profile = await userService.getProfile(req.user);

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

const updatedProfile = async (req, res, next) => {
  try {
    const updatedUser = await userService.updateProfile(req.user, req.body);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfullly',
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const result = await userService.changePassword(
      req.user._id,
      req.body.currentPassword,
      req.body.newPassword,
    );

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

const getAddresses = async (req, res, next) => {
  try {
    const addresses = await userService.getAddresses(req.user);

    res.status(200).json({
      success: true,
      data: addresses,
    });
  } catch (error) {
    next(error);
  }
};

const addAddress = async (req, res, next) => {
  try {
    const addresses = await userService.addAddress(req.user, req.body);

    res.status(201).json({
      success: true,
      message: 'Address added successfully',
      data: addresses,
    });
  } catch (error) {
    next(error);
  }
};

const updateAddress = async (req, res, next) => {
  try {
    const addresses = await userService.updateAddress(
      req.user,
      req.params.addressId,
      req.body,
    );

    res.status(200).json({
      success: true,
      message: 'Address updated successfully',
      data: addresses,
    });
  } catch (error) {
    next(error);
  }
};

const deleteAddress = async (req, res, next) => {
  try {
    const addresses = await userService.deleteAddress(
      req.user,
      req.params.addressId,
    );

    res.status(200).json({
      success: true,
      message: 'Address deleted successfully',
      data: addresses,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updatedProfile,
  changePassword,
  addAddress,
  getAddresses,
  updateAddress,
  deleteAddress,
};
