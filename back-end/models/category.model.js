const mongoose = require('mongoose');
const slugify = require('slugify');

const { CATEGORY_STATUS } = require('../constants/category.constants');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      maxlength: 100,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    image: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: Object.values(CATEGORY_STATUS),
      default: CATEGORY_STATUS.ACTIVE,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

categorySchema.pre('validate', function () {
  if (this.name) {
    this.slug = slugify(this.name, {
      lower: true,
      strict: true,
      trim: true,
    });
  }
});

categorySchema.set('toJSON', {
  versionKey: false,
  virtuals: true,
});

module.exports = mongoose.model('Category', categorySchema);
