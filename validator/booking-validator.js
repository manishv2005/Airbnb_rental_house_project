const { body, param, query, validationResult } = require('express-validator');

exports.validateReservation = [
    body('homeId', 'invalid request').notEmpty().isNumeric(),
    body('checkinDate', 'checkin date is required').notEmpty().isDate().withMessage('Invalid date format').custom((value , {req})=> {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // remove time, keep only date
        const checkin = new Date(value);
        if(checkin < today) {
            throw new Error('you enter a past date');
        }
        return true;
    }),
    body('checkoutDate', 'checkout date is required').notEmpty().isDate().withMessage('Invalid date format').custom((value , {req})=> {
        const checkin = new Date(req.body.checkinDate);
        const checkout = new Date(value);
        if(checkin >= checkout) {
            throw new Error('checkout date should be greater than checkin date');
        }
        return true;
    }) ,

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const errorMsg = errors.array().map(e => e.msg) ;
            return res.redirect(`/user/housedetail/${req.body.homeId}?error=${encodeURIComponent(errorMsg)}`);
        }
        next();
    }
]




exports.validateBookingId = [
    param('booking_id', 'Invalid request').notEmpty().isUUID(),
    body('booking_id').optional().isUUID(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array().map((error) => ({ msg: error.msg })) });
        }
        next();
    }
]



exports.validateHomeId = [
    body('homeId', 'Invalid request').notEmpty().isNumeric(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.redirect('/user');
        }
        next();
    }
]

exports.validateHouseDetailQuery = [
    param('homeId', 'Invalid request').notEmpty().isNumeric(),
    query('error').optional().trim().escape(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.redirect('/user');
        }
        next();
    }
]



