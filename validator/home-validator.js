const fs = require('fs');
const path = require('path');
const { body, validationResult, param } = require("express-validator");
exports.validateHomeData = [
    body('name')
        .notEmpty()
        .withMessage('Name is required').bail()
        .isAlpha('en-US', { ignore: ' ' })
        .withMessage('Name must contain only letters and spaces')
        .isLength({ max: 100 })
        .withMessage('Name must be less than 100 characters'),

    body('number')
        .notEmpty()
        .withMessage('Number is required').bail()
        .isNumeric()
        .withMessage('Number must be a valid number'),

    body('price')
        .notEmpty()
        .withMessage('Price is required').bail()
        .isFloat({ gt: 0 })
        .withMessage('Price must be a valid price '),

    body('description')
        .isLength({ max: 200 })
        .withMessage('Description must be less than 200 characters').bail()
        .isAlphanumeric('en-US', { ignore: ' ' })
        .withMessage('Description must be alphanumeric '),

    (req, res, next) => {
        const { id, name, number, price, description } = req.body;

        const oldInput = { id, name, number, price, description };
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            console.log("validation error");
            if (req.file) {
                const filePath = path.join(__dirname, '../', req.file.path);
                fs.unlink(filePath, (err) => {
                    if (err) {
                        console.error('Error deleting file:', err);
                        return;
                    }
                    console.log('File deleted successfully:', filePath);
                });
            }
            const isEditing = Boolean(id);
            return res.status(422).render("./host/edithosthome", {
                errors: errors.array().map(err => err.msg),
                home: oldInput,
                editing: isEditing,
                activePage: isEditing ? 'host-homes' : 'add-home',
                user: req.session.user
            });
        }

        next();
    }
];

exports.validateHomeIdParam = [
    param('homeId', 'Invalid request').notEmpty().isLength({min:8 , max:8}),
    (req, res, next) => {
         const errors = validationResult(req);
        if (!errors.isEmpty()) {
            if (req.url.includes("/host/")) {
            return res.redirect('/host');
            }
            else if (req.url.includes("/user/")) {
                return res.redirect('/user');
            }
        }
        next();
    }
];




