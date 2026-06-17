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
  console.log(req.user);
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

module.exports = { getProfile, updatedProfile, changePassword };
