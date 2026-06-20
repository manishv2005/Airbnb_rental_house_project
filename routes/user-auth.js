const express = require('express');
const UserauthRouter = express.Router();
const { validateUserSignup ,validateUserLogin} = require('../validator/user-auth-validator');
const authcontroller = require('../controller/user-auth-controller');
const {getpage404} = require('../controller/error-controller');
const {csrfSynchronisedProtection} = require('../utils/csrfSync-Configuration') ;
const {authLimiter} = require('../utils/rate-limit') ;



UserauthRouter.get('/user/login', authcontroller.getUserLogin);

UserauthRouter.post('/user/login',authLimiter,csrfSynchronisedProtection,validateUserLogin ,authcontroller.postUserLogin);


UserauthRouter.get('/user/signup',authcontroller.getUserSignup);

UserauthRouter.post('/user/signup',authLimiter,csrfSynchronisedProtection, validateUserSignup, authcontroller.postUserSignup);

UserauthRouter.post('/user/logout',authLimiter,csrfSynchronisedProtection, authcontroller.postUserLogout);





module.exports = UserauthRouter;