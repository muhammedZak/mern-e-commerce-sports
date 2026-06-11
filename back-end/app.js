const express = require('express');
const app = express();
const authRoutes = require('./routes/auth.routes');

app.use(express.json());
app.use('/api/v1/auth', authRoutes);

module.exports = app;
