const path = require('path');
const fs = require('fs');

const productUploadPath = path.join(process.cwd(), 'uploads', 'products');

if (!fs.existsSync(productUploadPath)) {
  fs.mkdirSync(productUploadPath, { recursive: true });
}

const getProductStoragePath = () => {
  return productUploadPath;
};

module.exports = { getProductStoragePath };
