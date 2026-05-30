const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error('[DB] MONGO_URI environment variable is missing');
  }

  try {
    const connection = await mongoose.connect(mongoUri);

    console.log(`[DB] Connected: ${connection.connection.host}`);

    return connection;
  } catch (error) {
    throw new Error(`[DB] Connection failed: ${error.message}`);
  }
};

module.exports = connectDB;
