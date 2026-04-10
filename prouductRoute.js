const express = require('express');
const router  = express.Router();
const getProductsController = require('../controller/products');
const authJwt = require('../middleware/authJwt')

router.get('/', getProductsController.getAllproducts);
router.post('/',getProductsController.createProuducts);
router.get('/get/featured/:count', getProductsController.ProductsCount);
router.get('/:id', getProductsController.getProuduct);
router.put('/:id', getProductsController.UpdateProduct);
router.delete('/:id', getProductsController.DeleteProducts);

module.exports  = router;