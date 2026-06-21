const crypto = require('crypto');

const generateOrderNumber = () => {
  return `ORD-${Date.now()}-${crypto
    .randomBytes(3)
    .toString('hex')
    .toUpperCase()}`;
};

module.exports = { generateOrderNumber };
