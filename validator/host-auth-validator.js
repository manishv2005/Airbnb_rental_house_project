const { check, body, validationResult } = require("express-validator");
const { Host } = require("../models/host");

exports.validateHostSignup = [
    (req,res,next)=> {
         if(!req.session.user) {
            return res.redirect('/auth/user/login');
        }
        next() ;
    },

    body('taxid')
    .notEmpty().withMessage('Tax ID (GSTIN) is required').bail()
    .trim()
    .toUpperCase() // Convert input to uppercase automatically
    .matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/)
    .withMessage('Please enter a valid 15-character GSTIN format') ,

    body('phonenumber')
    .notEmpty().withMessage('Phone number is required').bail()
    .trim()
    .isMobilePhone('en-IN').withMessage('Please enter a valid Indian mobile number') ,


    body('password')
    .notEmpty().withMessage('Password is required').bail()
    .trim()
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number')
    .matches(/[!@#$%^&*]/).withMessage('Password must contain at least one special character') 
    ,
    
    
    body('confirmPassword')
    .trim()
    .custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error("Passwords do not match");
        }
        return true;
    })
    ,

    body('terms').custom ((value , {req}) => {
        if (value !== 'on') {
            throw new Error( 'You must accept the terms and conditions');
        }
        return true;
    })
    ,

    (req,res,next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.render('./auth/Host/signup', {
                errors: errors.array().map(err => err.msg),
                oldInput: {
                    taxid: req.body.taxid,
                    phonenumber: req.body.phonenumber,
                    password: '',
                    terms: req.body.terms,
                }
            })
        }
        next() ;
    }

   



]




exports.hostLoginValidation = [
     (req, res, next) => {
        if (!req.session.user) {
            return res.redirect('/auth/user/login');
        }
        next() ;
     } ,
    
     body('password')
    .notEmpty().withMessage('Password is required').bail()
    .trim()
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number')
    .matches(/[!@#$%^&*]/).withMessage('Password must contain at least one special character') 
    ,
    
    (req,res,next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.render('./auth/Host/login', {
                errors: errors.array().map(err => err.msg),
                oldInput: {
                    password: '',
                    confirmPassword: '',
                }
            })
        }
        next() ;
    }

]



exports.checkHostExists = async (req) => {
    try {
    const {phonenumber, taxid } = req.body;
        const [rows] = await Host.PhoneNumberOrTaxIdExist(phonenumber, taxid);
        if (rows.length > 0) {
            return true ;
        }
        return false ;
    } catch (error) {
        throw error;
        
    }
   
}