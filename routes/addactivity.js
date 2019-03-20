const express = require("express");
const router = express.Router();
const { check, validationResult } = require('express-validator/check')
const { isUserLoggedIn } = require('../functions/redirects');
const { generateActivity } = require('../functions/sportDataFunctions');
const { sports } = require('../data/sportslist');
const User = require('../models/user');
const dateFormat = require('dateformat');

const dateToday = dateFormat(new Date(), "yyyy-mm-dd");

router.get("/", isUserLoggedIn, (req, resp) => {
    resp.render('addactivity', {
        sports: sports,
        date: dateToday,
        warning: "",
        warning2: "",
    });
});

router.post("/", isUserLoggedIn, [
    check('hours')
        .optional({checkFalsy: true}) // empty field is OK
        .trim()
        .isInt({ min: 0, max: 24 })
        .withMessage('num'),
    check('minutes')
        .optional({checkFalsy: true})
        .trim()
        .isInt({ min: 0, max: 1440 })
        .withMessage('num'),
    check('kilometers')
        .optional({checkFalsy: true})
        .trim()
        .isInt({ min: 0, max: 500 })
        .withMessage('num'),
    check('meters')
        .optional({checkFalsy: true})
        .trim()
        .isInt({ min: 0, max: 500000 })
        .withMessage('num'),
    check('notes')
        .optional({checkFalsy: true})
        .trim()
        .escape() // replace <, >, &, ', " and / with HTML entities.
        .isLength({ min: 0, max: 120 })
], (req, resp) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorArray = errors.array();
        const numError = errorArray.find((error) => error.msg === 'num'); // find out if there is an error in num values
        if (numError) {
        resp.render('addactivity', {
            sports: sports,
            date: dateToday,
            warning: "", 
            warning2: "Only integers (of reasonable size) are allowed in Time and Distance fields.",
        });
        } else {
            resp.render('addactivity', {
                sports: sports,
                date: dateToday,
                warning: "", 
                warning2: 'Notes can be max 120 characters long.',
            });
        }
    } else {
        const data = req.body;
        if (!data.sportname) {  // Sport must be picked
            // resp.redirect("/addactivity");
            resp.render('addactivity', {
                sports: sports,
                date: dateToday,
                warning: "Please select excercise type",
                warning2: "", 
            });
        } else {
            const newActivity = generateActivity(data);

            User.findByIdAndUpdate(req.session.userId, {
                $push: { activities: newActivity },
            }, (err) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Activity added to database");
                }
            });
            resp.redirect("/home");
        }
    }
});


module.exports = router;