const multer = require('multer');
const AppError = require('../utils/app-error.util');

const errorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    err.message =
      err.code === 'LIMIT_FILE_SIZE'
        ? 'File size exceeds 5MB limit'
        : err.message;

    err.statusCode = 400;
  }

  if (err instanceof AppError) {
    console.log(err);
    return res.status(err.statusCode).json({
      success: false,
      status: 'error',
      message: err.message || 'Something went wrong',
      errors: err.errors || [],
    });
  }

  console.error('[UNEXPECTED ERROR]', err);

  return res.status(500).json({
    success: false,
    status: 'error',
    message: 'Internal Server Error',
    errors: [],
  });
};

module.exports = errorHandler;
