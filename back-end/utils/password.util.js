const bcrypt = require('bcrypt');

const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS || 12);

const hashPassword = async (password) => {
  return await bcrypt.hash(password, BCRYPT_ROUNDS);
};

const comparePassword = async (candidatePassword, userPassword) => {
  return await bcrypt.compare(candidatePassword, userPassword);
};

module.exports = {
  hashPassword,
  comparePassword,
};
