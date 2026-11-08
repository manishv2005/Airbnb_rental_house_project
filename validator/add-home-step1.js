
const { body, validationResult } = require('express-validator');
const { get_property_types } = require('../models/property_type');
const { listing_type } = require('../models/listing_type');

exports.validate_step1_data = [
    body('id')
        .optional({ checkFalsy: true })
        .isString()
        .trim()
        .isLength({min:8 ,max:8})
        .withMessage("home not found"),
    body('property_type_id')
        .notEmpty()
        .withMessage("property type is required")
        .isNumeric({ gt: -1 })
        .withMessage("property type must be a number"),

    body('listing_type_id')
        .notEmpty()
        .withMessage("listing type is required")
        .isNumeric({ gt: -1 })
        .withMessage("listing type must be a number"),

    body('max_guests')
        .notEmpty()
        .withMessage("Max guests is required")
        .isNumeric({ gt: 0 })
        .withMessage("Max guests must be a number"),

    body('total_bedrooms')
        .notEmpty()
        .withMessage("Total bedrooms is required")
        .isNumeric({ gt: -1 })
        .withMessage("Total bedrooms must be a number"),

    body('total_bathrooms')
        .notEmpty()
        .withMessage("Total bathrooms is required")
        .isNumeric({ gt: 0 })
        .withMessage("Total bathrooms must be a number"),



     async (req, res, next) =>  {
        const errors = validationResult(req);
        console.log(req.body);
        if (!errors.isEmpty()) {
            const [propertyTypes] = await get_property_types();
            const [listingTypes] = await listing_type () ;
            return res.status(422).render("./host/add-home-step1", {
                errors: errors.array().map(err => err.msg),
                oldInput: req.body,
                listingTypes,
                propertyTypes,
                user: req.session.user,
                activePage: 'add-home'
            });
        }
        console.log('edit_validation_passed');
        next();
        
    }
]






