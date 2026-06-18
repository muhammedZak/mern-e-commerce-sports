const express = require('express');

const router = express.Router();

const {
  adjustInventory,
  getInventoryHistory,
  getInventorySummary,
} = require('../controllers/inventory.controller');

const { protect, authorize } = require('../middleware/auth.middleware');

const validate = require('../middleware/validate.middleware');

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

router.get(
  '/:productId/summary',
  protect,
  authorize(USER_ROLES.ADMIN),
  getInventorySummary,
);

module.exports = router;
