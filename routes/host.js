//external module
const express = require('express');
const hostRouter = express.Router();
const { validateHomeData, validateHomeIdParam } = require('../validator/home-validator');
const { validatequery } = require('../validator/request-dataValidator');
const {csrfSynchronisedProtection} = require('../utils/csrfSync-Configuration') ;
const multer = require('multer'); 
const { multerConfig } = require('../utils/multer-config');


// import local module to get path of rootdir

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

hostRouter.get('/',validatequery, hostcontroller.getHostDashboard);

hostRouter.get("/edit-home/:homeId", validateHomeIdParam, hostcontroller.getEditHome);

hostRouter.post("/delete-home/:homeId", csrfSynchronisedProtection,validateHomeIdParam, hostcontroller.postDeleteHome);


hostRouter.use(multer(multerConfig).single('image'), (err, req, res, next) => {
    if (err) {
        console.error('Multer error:', err);
        return res.status(400).send('Error uploading file: ' + err.message);
    }
    next();
});

// handlin post add-home page and give suceess message
hostRouter.post('/add-home',csrfSynchronisedProtection, validateHomeData, hostcontroller.postAddHome);


// handling /host request (Host Dashboard showing their own homes)


hostRouter.post("/edit-home",csrfSynchronisedProtection,validateHomeData, hostcontroller.postEditHome);



hostRouter.use(getpage404);

module.exports = hostRouter;