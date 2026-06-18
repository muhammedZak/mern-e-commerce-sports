const express = require('express');

const router = express.Router();

const {
  adjustInventory,
  getInventoryHistory,
} = require('../controllers/inventory.controller');

const protect = require('../middleware/protect');

const authorize = require('../middleware/authorize');

const validate = require('../middleware/validate');

const {
  adjustInventoryValidation,
} = require('../validators/inventory.validator');

const { USER_ROLES } = require('../constants/user.constants');

router.patch(
  '/:productId/adjust',
  protect,
  authorize(USER_ROLES.ADMIN),
  adjustInventoryValidation,
  validate,
  adjustInventory,
);

router.get(
  '/:productId/history',
  protect,
  authorize(USER_ROLES.ADMIN),
  getInventoryHistory,
);

module.exports = router;
