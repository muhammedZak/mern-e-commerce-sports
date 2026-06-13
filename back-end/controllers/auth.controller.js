const authService = require('../services/auth.service');

const register = async (req, res, next) => {
  try {
    const registerResult = await authService.registerUser(req.body);

    res.status(201).json({
      success: true,
      message:
        'User registered successfully. Please verify your email address.',
      data: registerResult,
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { user, token } = await authService.loginUser(req.body);

    res.cookie('accessToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: 'Login successfully',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res) => {
  const user = {
    id: req.user._id,
    firstName: req.user.firstName,
    lastName: req.user.lastName,
    fullName: req.user.fullName,
    email: req.user.email,
    role: req.user.role,
    status: req.user.status,
    isEmailVerified: req.user.isEmailVerified,
  };

  res.status(200).json({
    success: true,
    data: user,
  });
};

const logout = async (req, res) => {
  res.clearCookie('accessToken');

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};

const verifyEmail = async (req, res, next) => {
  try {
    const result = await authService.verifyEmail(req.body);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  logout,
  verifyEmail,
};
