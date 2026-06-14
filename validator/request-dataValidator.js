const { query, validationResult } = require("express-validator");

exports.validatequery = [
    query('error').optional().trim().escape(),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.redirect('/user');
        }
        next();
    }
] ;