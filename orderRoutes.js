const express = require('express');
const route = express.Router();
const orderController = require('../controller/orderController');
const { authJwt, restrictTo } = require('../middleware/authJwt');


route.get('/',authJwt,restrictTo(), orderController.getOrders);
route.get('/:id',authJwt,restrictTo(), orderController.getorder);

route.put('/:id',authJwt ,restrictTo() ,orderController.UpdateStatus);

route.post('/', orderController.makeOrder);
route.get('/SalesReport' , orderController.getSalesReport);
module.exports = route;