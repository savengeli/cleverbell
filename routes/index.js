const express = require("express");
const router = express.Router();
const { check, validationResult } = require('express-validator/check')
const bcrypt = require("bcrypt");
const User = require('../models/user');
const { redirectHome } = require('../functions/redirects');

router.get("/", redirectHome, (req, resp) => {
    resp.render('index', {
        warning1: "",
        warning2: "",
        successMsg: "",
    });
});

///////////////// Register user: /////////////////
router.post("/register", redirectHome, [
    check('username')
        .isAlphanumeric().withMessage("Username: only letters and numbers allowed.")
        .isLength({ min: 3, max: 20 })
        .withMessage('Username must be 3 - 20 characters long.')
        .trim(),
    check('email')
        .isEmail().withMessage('Invalid email address.'),
    check('password')
        .isLength({ min: 5, max: 20 })
        .withMessage('Password must be 5 - 20 characters long.')
        .trim(),
], (req, resp) => {
    const { username, password, email } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const validationErrors = errors.array();
        const errorMessages = new Array();
        validationErrors.forEach((error) => {
            errorMessages.push(error.msg);
        })
        if (!username || !password || !email) {
            errorsStr = "Please fill in all fields."
        } else {
            errorsStr = errorMessages.join(' ');
        }
        resp.render('index', {
            warning1: "",
            warning2: errorsStr,
            successMsg: "",
        });
    } else {
        User.findOne({ username: username }, (err, user) => {
            if (user) {
                resp.render('index', {
                    warning1: "",
                    warning2: "Cannot be registered. Username is already in use.",
                    successMsg: "",
                });
            } else {
                User.findOne({ email: email }, (err, user) => {
                    if (user) {
                        resp.render('index', {
                            warning1: "",
                            warning2: "Cannot be registered. E-mail is already in use.",
                            successMsg: "",
                        });
                    } else {
                        bcrypt.hash(password, 12, (err, hash) => {
                            const newUser = new User({
                                username: username,
                                password: hash,
                                email: email,
                            });
                            newUser.save((err, newUser) => {
                                if (err) {
                                    console.error(err.errors);
                                    resp.redirect("/");
                                } else {
                                    resp.render('index', {
                                        warning1: "",
                                        warning2: "",
                                        successMsg: "Your account has been registered. You can now log in.",
                                    });
                                }
                            });

                        });
                    }
                });
            }
        });
    }

});


///////////////// Login user: /////////////////
router.post("/login", redirectHome, (req, resp) => {
    const { username, password } = req.body;
    User.find({ username: username })
        .then(doc => {
            const user = doc[0];
            if (user) {
                bcrypt.compare(password, user.password, (err, result) => {
                    if (result) {
                        req.session.userId = user._id;
                        req.session.username = user.username;
                        resp.redirect("/home");
                    } else {
                        resp.render('index', {
                            warning1: "Incorrect password!",
                            warning2: "",
                            successMsg: "",
                        });
                    }
                });
            } else {
                resp.render('index', {
                    warning1: "User doesn't exist!",
                    warning2: "",
                    successMsg: "",
                });
            }
        })
        .catch(err => console.log(err));
});


module.exports = router;