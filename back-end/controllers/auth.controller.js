const register = async (req, res, next) => {
  try {
    res
      .status(201)
      .json({ status: 'success', message: 'Register endpoint reached' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
};
