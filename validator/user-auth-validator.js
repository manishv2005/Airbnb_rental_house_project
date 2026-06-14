const { body} = require("express-validator");
const {User} = require("../models/user");

exports.validateUserSignup = [
    body('firstname')
        .notEmpty().withMessage('First name is required').bail()
        .trim()
        .isLength({ min: 2 })
        .withMessage('First name must be at least 2 characters long')
        // .matches(/^[A-Za-z]+$/)
        .isAlpha()
        .withMessage('First name must contain only letters'),


    body('lastname')
        .optional({ checkFalsy: true })
        .trim()
        .isAlpha()
        .withMessage('Last name must contain only letters'),


    body('email')
        .notEmpty().withMessage('Email is required').bail()
        .trim()
        .normalizeEmail()
        .isEmail()
        .withMessage('Please enter a valid email address'),

   body('password')
        .notEmpty().withMessage("Password is required").bail()
        .trim() 
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
        .matches(/[A-Z]/)
        .withMessage('Password must contain at least one uppercase letter')
        .matches(/[a-z]/)
        .withMessage('Password must contain at least one lowercase letter')
        .matches(/[0-9]/)
        .withMessage('Password must contain at least one number')
        .matches(/[!@#$%^&*]/)
        .withMessage('Password must contain at least one special character') ,


    body("confirmPassword")
        .trim()
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error("Passwords do not match");
            }
            return true;
        }),

    body("gender")
        .notEmpty().withMessage("Please select a gender").bail()
        .isIn(['male', 'female'])
        .withMessage("Invalid gender choice"),


    body("terms")
        .custom((value, { req }) => {
            if (value !== "on") {
                throw new Error("Please accept the terms and conditions");
            }
            return true;
        })

]





exports.checkUserExists = async  (email) => {
    
   try {
    const [existingUser]= await  User.findUserByEmail(email) ;
    if  (existingUser && existingUser.length>0) {
       return existingUser[0] ;
        }
    return null ;
   }
   catch (error) {
        throw error;
        
    }
}


exports.validateUserLogin = [
    body('email')
        .notEmpty().withMessage("Email is required").bail()
        .trim()
        .normalizeEmail()
        .isEmail()
        .withMessage('Please enter a valid email address'),
    body('password')
        .notEmpty().withMessage("Password is required").bail()
        .trim() 
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
        .matches(/[A-Z]/)
        .withMessage('Password must contain at least one uppercase letter')
        .matches(/[a-z]/)
        .withMessage('Password must contain at least one lowercase letter')
        .matches(/[0-9]/)
        .withMessage('Password must contain at least one number')
        .matches(/[!@#$%^&*]/)
        .withMessage('Password must contain at least one special character')
]





