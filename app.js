const express = require('express');
const app = express();
const morgan = require('morgan');
require('dotenv').config();

const productRoutes = require('./routes/prouductRoute');
const categoryRoutes = require('./routes/categoryRoute');
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes');
const orderItems = require('./routes/orderItems');
const { authJwt, restrictTo } = require('./middleware/authJwt');
const errorHandler = require('./middleware/errorhandler');
const api = process.env.API_URL;
//For Security🔒
const limiter = require('./Security/RateLimiting');
const helmet = require('helmet');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');

// middleware
app.use(express.json());
app.use(morgan('tiny'));

// 🔒 auth
app.use(authJwt);
app.use(helmet());
app.use(xss());
app.use(mongoSanitize());
app.use(limiter);

// routes
app.use(`${api}/products`, productRoutes);
app.use(`${api}/categories`, categoryRoutes);
app.use(`${api}/user`, userRoutes);
app.use(`${api}/order`, orderRoutes);
app.use(`${api}/orderItems`, orderItems);

// error handling
app.use(errorHandler);

module.exports = app;