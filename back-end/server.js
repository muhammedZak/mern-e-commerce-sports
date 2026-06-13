require('dotenv').config();

const app = require('./app');
const emailProvider = require('./providers/email.provider');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    await emailProvider.verifyConnection();

    app.listen(PORT, () => {
      console.log(`[SERVER] running on port ${PORT}`);
    });
  } catch (error) {
    console.error(`[STARTUP ERROR] ${error.message}`);
    process.exit(1);
  }
};

startServer();
