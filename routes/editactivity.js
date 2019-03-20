const express = require("express");
const mongoose = require('mongoose');
const router = express.Router();
const { check, validationResult } = require('express-validator/check')
const { isUserLoggedIn } = require('../functions/redirects');
const { generateActivity } = require('../functions/sportDataFunctions');
const { sports } = require('../data/sportslist');
const User = require('../models/user');
const bodyParser = require("body-parser");
const dateFormat = require('dateformat');


router.use(bodyParser.urlencoded({ extended: true }));

// Use this function to convert time (minutes) to hours and minutes
// or dinstance (meters) to kilometers and meters
const convert = (num, divider) => {
    const smallParts = num % divider;
    const bigParts = (num - smallParts) / divider;
    const result = {
        bigParts: bigParts,
        smallParts: smallParts,
    }
    return result;
}

router.post("/", isUserLoggedIn, (req, resp) => {
    User.findById(req.session.userId, 'activities', (err, docs) => {
        if (err) {
            console.log(err);
        }
        else {
            const activitiesList = [...docs.activities];
            let selectedActivity;
            for (let i = 0; i < activitiesList.length; i++) {
                if (activitiesList[i]._id == req.body.activityId) {
                    selectedActivity = activitiesList[i];
                    break;
                }
            }
            const { _id, name, date, time, distance, notes } = selectedActivity;
            const convertedTime = convert(time, 60);
            const convertedDinstance = convert(distance, 1000);
            const formattedDate = dateFormat(date, "yyyy-mm-dd");
            const sportIndex = sports.findIndex(sport => sport.name === name);
            const icon = sports[sportIndex].icon;
            resp.render('editactivity', {
                id: _id,
                sportname: name,
                date: formattedDate,
                hours: convertedTime.bigParts,
                minutes: convertedTime.smallParts,
                kilometers: convertedDinstance.bigParts,
                meters: convertedDinstance.smallParts,
                notes: notes,
                icon: icon,
            });

        }
    });
});

router.post("/edited", isUserLoggedIn, [
    check('hours')
        .optional({ checkFalsy: true }) // empty field is OK
        .trim()
        .isInt({ min: 0, max: 24 })
        .withMessage('num'),
    check('minutes')
        .optional({ checkFalsy: true })
        .trim()
        .isInt({ min: 0, max: 1440 })
        .withMessage('num'),
    check('kilometers')
        .optional({ checkFalsy: true })
        .trim()
        .isInt({ min: 0, max: 500 })
        .withMessage('num'),
    check('meters')
        .optional({ checkFalsy: true })
        .trim()
        .isInt({ min: 0, max: 500000 })
        .withMessage('num'),
    check('notes')
        .optional({ checkFalsy: true })
        .trim()
        .escape() // replace <, >, &, ', " and / with HTML entities.
        .isLength({ min: 0, max: 120 })
], (req, resp) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // TODO: some error messages should be given to user when validation errors occur.
        // Now user will only be redirected to home and activity is not edited.
        console.log("validation error occured");
        resp.redirect("/home");
    } else {
        const data = req.body;
        const newActivity = generateActivity(data);
        User.findById(req.session.userId, (err, userData) => {
            if (err) {
                console.log(err);
            } else {
                let activityIndex = (userData.activities).findIndex(activity => activity._id == data.activityId);
                userData.activities.set(activityIndex, newActivity); // replaces old activity with modified one
                userData.save();
            }
        })
        resp.redirect("/home");
    }
})

router.post("/deleted", isUserLoggedIn, (req, resp) => {
    const id = mongoose.mongo.ObjectId(req.body.activityId); // id string converted to mongoose objectid data type

    User.findByIdAndUpdate(req.session.userId, {
        $pull: { activities: { _id: id } },
    }, (err) => {
        if (err) {
            console.log(err);
        } else {
            console.log("Activity removed from the database");
        }
    });
    resp.redirect("/home");
})

module.exports = router;