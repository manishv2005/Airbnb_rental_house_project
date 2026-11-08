const { check, validationResult } = require("express-validator");
const { User } = require("../models/user");
const bcrypt = require('bcryptjs');

const { checkUserExists } = require("../validator/user-auth-validator");





///  this handle user sign up get requwest
exports.getUserSignup = (req, res) => {
    res.render('./auth/user/signup', { errors: [], oldInput: { firstname: '', lastname: '', email: '', gender: '' } });
}

exports.postUserSignup = async (req, res) => {

    const { firstname, lastname, email, password, gender } = req.body;
    const errors = validationResult(req);
    const formattedErrors = errors.array().map(err => err.msg);

    if (!errors.isEmpty()) {
        return res.status(422).render('./auth/user/signup', {
            errors: formattedErrors,
            oldInput: { firstname, lastname, email, gender }
        });
    }

    try {

        const userexists = await checkUserExists(email);
        if (userexists) {
            return res.status(422).render('./auth/user/signup', {
                errors: ["User already exists with this email"],
                oldInput: { firstname, lastname, email, gender }
            });
        }
        const hashedPassword = await bcrypt.hash(password, 12);

        const user = new User(firstname, lastname, email, hashedPassword, gender);
        await user.save();
        res.redirect('/auth/user/login');
    }
    catch (error) {
        console.log("Critical server failure", error, error.message)
        res.status(500).render('./auth/user/signup', {
            errors: ["An internal server error occurred. Please try again later."],
            oldInput: { firstname, lastname, email, gender }
        });
    }

}




// this only handle the user login 
exports.getUserLogin = (req, res) => {
    if (req.session.user) {
        console.log("user is already logged in");
        console.log("user data from session", req.session.user);
        return res.redirect('/user');
    }
    res.render('./auth/user/login', { errors: null, oldInput: { email: '' } });
}

exports.postUserLogin = async (req, res) => {
    const { email, password } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).render('./auth/user/login', {
            errors: errors.array().map(err => err.msg),
            oldInput: { email }
        });
    }

    try {
        const user = await checkUserExists(email);
        console.log("i am in userauth and in postlogin");

        if (!user) {
            console.log("User does not exist");
            return res.status(422).render('./auth/user/login', {
                errors: ['Invalid credentials'],
                oldInput: { email }
            });
        }
        console.log(password);
        const isMatch = await bcrypt.compare(password, user.Password);
        if (!isMatch) {
            console.log("password doesn't match");
            return res.status(422).render('./auth/user/login', {
                errors: ['Invalid credentials'],
                oldInput: { email }
            });
        }



        req.session.user = {
            UserId: user.UserId,
            FirstName: user.FirstName,
            LastName: user.LastName,
            Email: user.Email,
            Gender: user.Gender
        };

        // ✅ FIX: req.session.save()  crash karega kyonki ye prpmise return nhi karata req.user undefined hai.
        // Session ko save karne ka correct industry-standard async/await tarika yeh hai:
        await new Promise((resolve, reject) => {
            req.session.save((err) => {
                if (err) return reject(err);
                resolve();
            });
        });

        console.log("user saved successfully in the session");
        res.redirect('/user');

    } catch (error) {
        console.log("Critical server failure", error, error.message);
        res.status(500).render('./auth/user/login', {
            errors: ["An internal server error occurred. Please try again later."],
            oldInput: { email }
        });
    }
};

exports.postUserLogout = (req, res) => {
    if (!req.session) {
        console.log("User is not logged in");
        return res.redirect('/');
    }
    req.session.destroy((err) => {
        if (err) {
            console.error('Error saving session after user logout:', err);
            return res.redirect('/user');
        }
        return res.redirect('/');
    });
}











