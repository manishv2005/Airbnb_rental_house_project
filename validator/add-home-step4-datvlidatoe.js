const { body, validationResult } = require("express-validator");


exports.validate_step4_data = [
    body('price')
        .trim()
        .notEmpty().withMessage('Price is required')
        .isNumeric().withMessage('Price must be a number')
        .custom((value) => value > 0).withMessage('Price must be greater than 0'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // Delete uploaded files if there are validation errors
            if (req.files && req.files.length > 0) {
                req.files.forEach(file => {
                    fs.unlink(file.path, (err) => {
                        if (err) console.error("Error deleting file:", err);
                    });
                });
            }
            return res.render('./host/add-home-step4', {
                errors: errors.array(),
                secure_id: req.params.homeId,
                user: req.session.user,
                activePage: 'add-home'
            });
        }
        next();
    }
];