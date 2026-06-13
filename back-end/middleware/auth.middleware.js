const User = require('../models/user.model');
const AppError = require('../utils/app-error.util');
const { verifyAccessToken } = require('../utils/jwt.util');
const { USER_STATUS } = require('../constants/user.constants');

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError('Authentication required', 401);
    }

    const token = authHeader.split(' ')[1];

    const decoded = verifyAccessToken(token);

    const user = await User.findById(decoded.userId);

    if (!user) {
      throw new AppError('User no longer exists', 401);
    }

    if (user.status !== USER_STATUS.ACTIVE) {
      throw new AppError('Account is not active', 403);
    }

    req.user = user;

    next();
  } catch (error) {
    next(error);
  }
};

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError('Forbidden', 403));
    }
    next();
  };
};
