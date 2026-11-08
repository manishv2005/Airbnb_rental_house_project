// ==============================================================================
// Host Routes Configuration
// ==============================================================================

const express = require('express');
const multer = require('multer');
const hostRouter = express.Router();

// Controllers
const hostcontroller = require('../controller/hostcontroller');
const hostEditHomeController = require('../controller/host-edithome-controller');
const { getpage404 } = require('../controller/error-controller');

// Utilities & Security Middleware
const { multerConfig } = require('../utils/multer-config');
const { datapostlimiter } = require('../utils/rate-limit');
const { csrfSynchronisedProtection } = require('../utils/csrfSync-Configuration');

// Validators
const { validatequery } = require('../validator/request-dataValidator');
const { validateHomeIdParam } = require('../validator/home-validator');
const { validate_step1_data } = require('../validator/add-home-step1');
const { validate_step2_data } = require('../validator/add-home-step2');
const { validate_step3_data } = require('../validator/add-home-step3-datavalidator');
const { validate_step4_data } = require('../validator/add-home-step4-datvlidatoe');
const { validate_step5_data } = require('../validator/add-home-step5-validator');

// Specific Multer Middleware for Image Uploads (Used ONLY on Step 4)
const uploadPropertyImages = (req, res, next) => {
    multer(multerConfig).array('images', 5)(req, res, (err) => {
        if (err) {
            console.error('Multer upload error:', err);
            return res.status(400).send('Error uploading file: ' + err.message);
        }
        next();
    });
};

const { Host } = require('../models/host');

// ==============================================================================
// 1. Host Authentication Guard
// ==============================================================================
hostRouter.use(async (req, res, next) => {
    if (req.session.host) {
        if (!req.session.host.hostId) {
            try {
                const userId = req.session.user?.UserId || req.session.host.UserId || req.session.host.HostId;
                const [host] = await Host.findByUserId(userId);
                if (host && host.length > 0) {
                    req.session.host = {
                        hostId: host[0].hostId,
                        TaxId: host[0].TaxId,
                        UserId: host[0].UserId,
                        PhoneNumber: host[0].PhoneNumber,
                    };
                    return req.session.save((err) => {
                        if (err) return next(err);
                        next();
                    });
                } else {
                    delete req.session.host;
                    return res.redirect('/auth/Host/login');
                }
            } catch (err) {
                return next(err);
            }
        }
        return next();
    }
    if (!req.session.user) {
        return res.redirect('/auth/user/login');
    }
    return res.redirect('/user');
});

// ==============================================================================
// 2. Legacy / Compatibility Redirects (Avoid 404 for deleted routes)
// ==============================================================================
hostRouter.get('/add-home', (req, res) => {
    res.redirect('/host/add-home-step1');
});

hostRouter.get('/edit-home/:homeId', validateHomeIdParam, (req, res) => {
    res.redirect(`/host/edit-home-step1?id=${req.params.homeId}`);
});

// ==============================================================================
// 3. Host Dashboard
// ==============================================================================
hostRouter.get('/', validatequery, hostcontroller.getHostDashboard);

// ==============================================================================
// 4. Add Home Wizard (5 Steps)
// ==============================================================================

// Step 1: Property & Listing Type
hostRouter.get('/add-home-step1', hostcontroller.getAddHomeStep1);
hostRouter.post(
    '/add-home-step1',
    datapostlimiter,
    csrfSynchronisedProtection,
    validate_step1_data,
    hostcontroller.postAddHomeStep1
);

// Step 2: Room & Bathroom Configuration
hostRouter.get(
    '/add-home-step2/:homeId',
    validateHomeIdParam,
    hostcontroller.getAddHomeStep2
);
hostRouter.post(
    '/add-home-step2/:homeId',
    datapostlimiter,
    csrfSynchronisedProtection,
    validateHomeIdParam,
    validate_step2_data,
    hostcontroller.postAddHomeStep2
);

// Step 3: Location & Coordinates
hostRouter.get(
    '/add-home-step3/:homeId',
    validateHomeIdParam,
    hostcontroller.getAddHomeStep3
);
hostRouter.post(
    '/add-home-step3/:homeId',
    datapostlimiter,
    csrfSynchronisedProtection,
    validate_step3_data,
    hostcontroller.postAddHomeStep3
);

// Step 4: Images & Pricing
hostRouter.get(
    '/add-home-step4/:homeId',
    validateHomeIdParam,
    hostcontroller.getAddHomeStep4
);
hostRouter.post(
    '/add-home-step4/:homeId',
    datapostlimiter,
    uploadPropertyImages,
    csrfSynchronisedProtection,
    validateHomeIdParam,
    validate_step4_data,
    hostcontroller.postAddHomeStep4
);

// Step 5: Description & House Rules
hostRouter.get(
    '/add-home-step5/:homeId',
    validateHomeIdParam,
    hostcontroller.getAddHomeStep5
);
hostRouter.post(
    '/add-home-step5/:homeId',
    datapostlimiter,
    csrfSynchronisedProtection,
    validateHomeIdParam,
    validate_step5_data,
    hostcontroller.postAddHomeStep5
);

// ==============================================================================
// 5. Edit Home Wizard (5 Steps)
// ==============================================================================

// Step 1: Property & Listing Type
hostRouter.get('/edit-home-step1', hostEditHomeController.getEditHomeStep1);
hostRouter.post(
    '/edit-home-step1',
    datapostlimiter,
    csrfSynchronisedProtection,
    validate_step1_data,
    hostEditHomeController.postEditHomeStep1
);

// Step 2: Room & Bathroom Configuration
hostRouter.get(
    '/edit-home-step2/:homeId',
    validateHomeIdParam,
    hostEditHomeController.getEditHomeStep2
);
hostRouter.post(
    '/edit-home-step2/:homeId',
    datapostlimiter,
    csrfSynchronisedProtection,
    validateHomeIdParam,
    validate_step2_data,
    hostEditHomeController.postEditHomeStep2
);

// Step 3: Location & Coordinates
hostRouter.get(
    '/edit-home-step3/:homeId',
    validateHomeIdParam,
    hostEditHomeController.getEditHomeStep3
);
hostRouter.post(
    '/edit-home-step3/:homeId',
    datapostlimiter,
    csrfSynchronisedProtection,
    validate_step3_data,
    hostEditHomeController.postEditHomeStep3
);

// Step 4: Images & Pricing
hostRouter.get(
    '/edit-home-step4/:homeId',
    validateHomeIdParam,
    hostEditHomeController.getEditHomeStep4
);
hostRouter.post(
    '/edit-home-step4/:homeId',
    datapostlimiter,
    uploadPropertyImages,
    csrfSynchronisedProtection,
    validateHomeIdParam,
    validate_step4_data,
    hostEditHomeController.postEditHomeStep4
);

// Step 5: Description & House Rules
hostRouter.get(
    '/edit-home-step5/:homeId',
    validateHomeIdParam,
    hostEditHomeController.getEditHomeStep5
);
hostRouter.post(
    '/edit-home-step5/:homeId',
    datapostlimiter,
    csrfSynchronisedProtection,
    validateHomeIdParam,
    validate_step5_data,
    hostEditHomeController.postEditHomeStep5
);

// ==============================================================================
// 6. Delete Home
// ==============================================================================
hostRouter.post(
    '/delete-home/:homeId',
    datapostlimiter,
    csrfSynchronisedProtection,
    validateHomeIdParam,
    hostcontroller.postDeleteHome
);

// ==============================================================================
// 7. 404 Catch-All
// ==============================================================================
hostRouter.use(getpage404);

module.exports = hostRouter;
