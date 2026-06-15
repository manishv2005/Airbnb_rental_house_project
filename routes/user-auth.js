const express = require('express');
const UserauthRouter = express.Router();
const { validateUserSignup ,validateUserLogin} = require('../validator/user-auth-validator');
const authcontroller = require('../controller/user-auth-controller');
const {getpage404} = require('../controller/error-controller');
const {csrfSynchronisedProtection} = require('../utils/csrfSync-Configuration') ;



UserauthRouter.get('/user/login', authcontroller.getUserLogin);

UserauthRouter.post('/user/login',csrfSynchronisedProtection,validateUserLogin ,authcontroller.postUserLogin);

UserauthRouter.post('/user/logout',csrfSynchronisedProtection, authcontroller.postUserLogout);

UserauthRouter.get('/user/signup',authcontroller.getUserSignup);

UserauthRouter.post('/user/signup',csrfSynchronisedProtection, validateUserSignup, authcontroller.postUserSignup);






module.exports = UserauthRouter;