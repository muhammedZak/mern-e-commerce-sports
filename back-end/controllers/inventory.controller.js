const inventoryService = require('../services/inventory.service');

const adjustInventory = async (req, res, next) => {
  try {
    const product = await inventoryService.adjustInventory(
      req.params.productId,
      Number(req.body.adjustment),
      req.body.reason,
      req.user.id,
    );

    res.status(200).json({
      success: true,
      message: 'Inventory updated successfully',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

const getInventoryHistory = async (req, res, next) => {
  try {
    const history = await inventoryService.getInventoryHistory(
      req.params.productId,
    );

    res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    next(error);
  }
};

const getInventorySummary = async (req, res, next) => {
  try {
    const summary = await inventoryService.getInventorySummary(
      req.params.productId,
    );

    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  adjustInventory,
  getInventoryHistory,
  getInventorySummary,
};
