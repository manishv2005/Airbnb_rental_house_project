const { Host } = require("../models/host");
const { check, validationResult } = require("express-validator");
const { checkHostExists } = require("../validator/host-auth-validator");
const bcrypt = require('bcryptjs');



exports.getHostSignup = (req, res) => {
    if (!req.session.user) {
        return res.redirect('/auth/user/login');
    }
    return res.render('./auth/Host/signup', { errors: null, oldInput: null });
}



exports.getHostLogin = async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/auth/user/login');
    }
    if (req.session.host) {
        return res.redirect('/host');
    }
    try {
        const [hostexists] = await Host.findByUserId(req.session.user.UserId);
        if (hostexists && hostexists.length > 0) {
            return res.render('./auth/Host/login', { errors: null, oldInput: null });
        }
        else {
            return res.redirect('/auth/Host/signup');
        }
    }
    catch (err) {
        console.error("critical error in getHostLogin controller", err)
        res.redirect(`/user?errors=${encodeURIComponent("Critical error in host login")}`);
    }
}



exports.postHostSignup = async (req, res) => {
    // the post request always can make by a user
    if (!req.session.user) {
        return res.redirect('/auth/user/login');
    }
    try {
        const hostExists = await checkHostExists(req);

        if (hostExists) {
            return res.render('./auth/Host/signup', {
                errors: ["Phone number or Tax ID already exists"],
                oldInput: {
                    taxid: req.body.taxid,
                    phonenumber: req.body.phonenumber,
                    password: '',
                    terms: req.body.terms,
                }
            });
        }

        const { phonenumber, taxid, password } = req.body;
        const hashpassword = await bcrypt.hash(password, 12);
        const host = new Host(req.session.user.UserId, taxid, phonenumber, hashpassword);
        await host.save();
        return res.redirect('/auth/Host/login');

    } catch (error) {
        return res.render('./auth/Host/signup', {
            errors: ["critical server error .please try again "],
            oldInput: {
                taxid: req.body.taxid,
                phonenumber: req.body.phonenumber,
                password: '',
                terms: req.body.terms,
            }
        })
    }

};





exports.postHostLogin = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect('/auth/user/login');
        }

        const { password } = req.body;

        const [host] = await Host.findByUserId(req.session.user.UserId);

        if (host.length > 0) {
            const isMatch = await bcrypt.compare(password, host[0].password);
            if (!isMatch) {
                console.log("error : password doesn't match")
                return res.render('./auth/Host/login', {
                    errors: ["Invalid credentials"],
                    oldInput: { password: '' }
                })
            }
            req.session.host = {
                hostId: host[0].hostId,
                TaxId: host[0].TaxId,
                UserId:host[0].UserId,
                PhoneNumber: host[0].PhoneNumber,
            }

            await new Promise((resolve, reject) => {
                req.session.save(err => {
                    if (err) {
                        return reject(err)
                    }
                    return resolve();
                })
            });

            return res.redirect('/host');

        } else {
            console.log("error : host not found")
            return res.render('./auth/Host/login', {
                errors: ["invalid credetials "],
                oldInput: { password: '' }
            })
        }

    } catch (error) {
        console.error("critical error in postHostLogin controller", error)
        return res.render('./auth/Host/login', {
            errors: ["error critical server error. please try again "],
            oldInput: { password: '' }
        })
    }

};

exports.postHostLogout = (req, res) => {
    if (!req.session) {
        return res.redirect('/');
    }

    //  Delete only the host session data (keep the user logged in)
    delete req.session.host;

    //  Save the session to apply the changes
    req.session.save(err => {
        if (err) {
            console.error('Error saving session after host logout:', err);
            return res.redirect('/host');
        }
        res.redirect('/user');
    });




}



