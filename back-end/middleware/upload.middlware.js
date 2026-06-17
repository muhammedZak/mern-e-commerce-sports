const multer = require('multer');
const path = require('path');

const AppError = require('../utils/app-error.util');

const {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_SIZE,
} = require('../constants/upload.constants');

const {
  getProductStoragePath,
} = require('../providers/storage/localStorage.provider');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, getProductStoragePath());
  },

  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    return cb(new AppError('Only JPG, PNG and WEBP images are allowed', 400));
  }

  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_IMAGE_SIZE,
  },
});

module.exports = upload;
