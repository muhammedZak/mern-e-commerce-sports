const express = require('express');
const app = express();
const authRoutes = require('./routes/auth.routes');
const errorHandler = require('./middleware/error.middleware');
const AppError = require('./utils/app-error.util');

app.use(express.json());
app.use('/api/v1/auth', authRoutes);

app.use((req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
});

app.use(errorHandler);

module.exports = app;
