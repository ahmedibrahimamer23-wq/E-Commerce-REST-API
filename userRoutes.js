const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');
const { authJwt, restrictTo } = require('../middleware/authJwt');

// const userProtect = require('../Auth/UserAuthentication');

//router.post('/',userController.createUser);
router.get('/',authJwt,restrictTo(),userController.getUsers);
router.post('/login', userController.login);
router.get('/:id',authJwt,restrictTo(),userController.getUserById);
router.post('/signup',userController.signup);




module.exports = router;