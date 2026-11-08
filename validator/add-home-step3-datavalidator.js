const {body , validationResult , param} = require('express-validator');



exports.validate_step3_data = [
    param('homeId')
        .notEmpty()
        .withMessage("Home id is required")
        .isLength({min:8, max:8})
        .withMessage("invalid home id"),


    body('flat_no')
        .trim()
        .notEmpty()
        .withMessage("Flat no is required")
        .isAlphanumeric('en-US',{ignore:' ,-. '})
        .withMessage("Flat no can only contains alphanumeric values "),

    body('city')
    .trim()
    .notEmpty()
    .withMessage("City is required")
    .isAlpha('en-US',{ignore:' ,-. '})
    .withMessage("City can only contains alphabetic values "),

    body('state')
    .trim()
    .notEmpty()
    .withMessage("State is required")
    .isAlpha('en-US',{ignore:' ,-. '})
    .withMessage("State can only contains alphabetic values "),

    body('pincode')
    .trim()
    .notEmpty()
    .withMessage("Pincode is required")
    .isNumeric()
    .withMessage("Pincode must be a number")
    .isLength({min:6,max:6})
    .withMessage("Pincode must be of 6 digits"),


    body('street_address')
    .trim()
    .notEmpty()
    .withMessage("Street address is required")
    .isAlphanumeric('en-US',{ignore:' ,-. '})
    .withMessage("Street address can only contains alphanumeric values "),

    body('landmark')
    .optional({ checkFalsy: true })
    .trim()
    .isAlphanumeric('en-US',{ignore:' ,-. '})
    .withMessage("Landmark can only contains alphanumeric values "),

    body('latitude')
    .trim()
    .notEmpty()
    .withMessage("Latitude is required")
    .isFloat({min:-90,max:90})
    .withMessage("Latitude must be a number between -90 and 90"),

    body('longitude')
    .trim()
    .notEmpty()
    .withMessage("Longitude is required")
    .isFloat({min:-180,max:180})
    .withMessage("Longitude must be a number between -180 and 180"),

    
   (req,res,next) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
        return res.redirect(`/host/add-home-step3/${req.params.homeId}?error=${encodeURIComponent(result.array()[0].msg)}`);
    }
    next();
   }
    
       


]