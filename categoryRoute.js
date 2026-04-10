const express = require('express');
const router = express.Router();
const categoryController = require('../controller/categoryController');

router.post('/',categoryController.CreateCategory);
router.get('/', categoryController.getCategory);
router.get('/:id', categoryController.getOneCategory);
router.put('/:id', categoryController.ubdateCategory)
module.exports = router;