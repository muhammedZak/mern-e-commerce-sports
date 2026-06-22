const checkoutService = require('../services/checkout.service');

const getCheckoutSummary = async (req, res, next) => {
  try {
    const summary = await checkoutService.getCheckoutSummary(
      req.user._id,
      req.query.addressId,
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
  getCheckoutSummary,
};


