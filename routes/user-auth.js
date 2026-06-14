const express = require('express');
const UserauthRouter = express.Router();
const { validateUserSignup ,validateUserLogin} = require('../validator/user-auth-validator');
const authcontroller = require('../controller/user-auth-controller');
const {getpage404} = require('../controller/error-controller');

UserauthRouter.get('/user/login', authcontroller.getUserLogin);

UserauthRouter.post('/user/login',validateUserLogin ,authcontroller.postUserLogin);

UserauthRouter.post('/user/logout', authcontroller.postUserLogout);

UserauthRouter.get('/user/signup', authcontroller.getUserSignup);

UserauthRouter.post('/user/signup', validateUserSignup, authcontroller.postUserSignup);






module.exports = UserauthRouter;