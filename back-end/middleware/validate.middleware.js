const { vaidationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = vaidationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }

  next();
};

module.exports = validate;
