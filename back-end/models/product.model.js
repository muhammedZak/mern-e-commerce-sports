const mongoose = require('mongoose');
const slugify = require('slugify');

const { PRODUCT_STATUS } = require('../constants/product.constants');

const imageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
      trim: true,
    },

    filename: {
      type: String,
      required: true,
      trim: true,
    },

    alt: {
      type: String,
      trim: true,
      default: '',
    },

    isPrimary: {
      type: Boolean,
      default: false,
    },

    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    _id: false,
  },
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    shortDescription: {
      type: String,
      trim: true,
      maxlength: 300,
    },

    description: {
      type: String,
      trim: true,
      default: '',
    },

    brand: {
      type: String,
      trim: true,
      maxlength: 100,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },

    sku: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    compareAtPrice: {
      type: Number,
      min: 0,
    },

    stockQuantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    reservedQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },

    images: {
      type: [imageSchema],
      default: [],
    },

    featured: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: Object.values(PRODUCT_STATUS),
      default: PRODUCT_STATUS.DRAFT,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    lowStockThreshold: {
      type: Number,
      default: 5,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  },
);

productSchema.virtual('primaryImage').get(function () {
  return this.images.find((image) => image.isPrimary) || this.images[0] || null;
});

productSchema.pre('validate', function () {
  const primaryImages = this.images.filter((image) => image.isPrimary);

  if (primaryImages.length > 1) {
    throw new Error('A product can only have one primary image');
  }
});

productSchema.virtual('isInStock').get(function () {
  return this.stockQuantity > 0;
});

productSchema.virtual('availableStock').get(function () {
  return this.stockQuantity - this.reservedQuantity;
});

productSchema.virtual('inStock').get(function () {
  return this.availableStock > 0;
});

productSchema.virtual('lowStock').get(function () {
  return this.availableStock <= this.lowStockThreshold;
});

productSchema.pre('validate', function () {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, {
      lower: true,
      strict: true,
      trim: true,
    });
  }
});

productSchema.index({
  slug: 1,
});

productSchema.index({
  category: 1,
});

productSchema.index({
  status: 1,
});

productSchema.index({
  featured: 1,
});

productSchema.index({
  category: 1,
  status: 1,
});

module.exports = mongoose.model('Product', productSchema);
