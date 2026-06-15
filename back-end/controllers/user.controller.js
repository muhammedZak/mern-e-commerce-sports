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

module.exports = { getProfile };
