const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

const connectDB = require('./config/db');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).send('API is Running');
});

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => console.log(`[SERVER] running on port ${PORT}`));
  } catch (error) {
    console.error(`[STARTUP ERROR] ${error.message}`);
    process.exit(1);
  }
};

startServer();
