const Wishlist = require('../models/wishlist.model');
const Product = require('../models/product.model');

const AppError = require('../utils/app-error.util');

const { PRODUCT_STATUS } = require('../constants/product.constants');

const addToWishlist = async (userId, productId) => {
  const product = await Product.findOne({
    _id: productId,
    isDeleted: false,
    status: PRODUCT_STATUS.ACTIVE,
  });

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  let wishlist = await Wishlist.findOne({
    user: userId,
  });

  if (!wishlist) {
    wishlist = await Wishlist.create({
      user: userId,
      products: [],
    });
  }

  const alreadyExists = wishlist.products.some(
    (id) => id.toString() === productId,
  );

  if (!alreadyExists) {
    wishlist.products.push(productId);

    await wishlist.save();
  }

  return Wishlist.findById(wishlist._id).populate(
    'products',
    'name slug price images',
  );
};

const getMyWishlist = async (userId) => {
  const wishlist = await Wishlist.findOne({
    user: userId,
  }).populate('products', 'name slug price images');

  if (!wishlist) {
    return {
      products: [],
      totalItems: 0,
    };
  }

  return wishlist;
};

const removeFromWishlist = async (userId, productId) => {
  const wishlist = await Wishlist.findOne({
    user: userId,
  });

  if (!wishlist) {
    throw new AppError('Wishlist not found', 404);
  }

  wishlist.products = wishlist.products.filter(
    (id) => id.toString() !== productId,
  );

  await wishlist.save();

  return Wishlist.findById(wishlist._id).populate(
    'products',
    'name slug price images',
  );
};

module.exports = { addToWishlist, getMyWishlist, removeFromWishlist };
