const express = require('express');
const route = express.Router();

const orderItemsController = require('../controller/orderItemsCont');

route.post('/', orderItemsController.makeOrderItem);

module.exports = route;