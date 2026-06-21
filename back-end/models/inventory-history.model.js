const mongoose = require('mongoose');

const inventoryHistorySchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },

    previousQuantity: {
      type: Number,
      required: true,
    },

    newQuantity: {
      type: Number,
      required: true,
    },

    adjustment: {
      type: Number,
      required: true,
    },

    reason: {
      type: String,
      required: true,
    },

    adjustedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

inventoryHistorySchema.index({
  product: 1,
  createdAt: -1,
});

inventoryHistorySchema.index({
  adjustedBy: 1,
  createdAt: -1,
});

module.exports = mongoose.model('InventoryHistory', inventoryHistorySchema);
