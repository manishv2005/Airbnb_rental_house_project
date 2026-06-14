//external module
const express = require('express');
const hostRouter = express.Router();
const { validateHomeData, validateHomeIdParam } = require('../validator/home-validator');
const { validatequery } = require('../validator/request-dataValidator');

// import local module to get path of rootdir
const rootdir = require('../utils/util');

const hostcontroller = require('../controller/host-controller');

const { getpage404 } = require('../controller/error-controller');

// using middleware 
hostRouter.use((req, res, next) => {
    if (req.session.host) {
        next();
    } else {
        if (!req.session.user) {
          return res.redirect('/auth/user/login') ;
        }
        return res.redirect('/user');
    }
});

//middleware to handle get add-home path give a form to register a home
hostRouter.get('/add-home', hostcontroller.getAddHome);

// handlin post add-home page and give suceess message
hostRouter.post('/add-home',validateHomeData, hostcontroller.postAddHome);


// handling /host request (Host Dashboard showing their own homes)
hostRouter.get('/',validatequery, hostcontroller.getHostDashboard);

hostRouter.get("/edit-home/:homeId", validateHomeIdParam, hostcontroller.getEditHome);

hostRouter.post("/edit-home", validateHomeData, hostcontroller.postEditHome);

hostRouter.post("/delete-home/:homeId", validateHomeIdParam, hostcontroller.postDeleteHome);


hostRouter.use(getpage404);

module.exports = hostRouter;