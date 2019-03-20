const express = require("express");
const router = express.Router();
const dateFormat = require('dateformat');
const { isUserLoggedIn } = require('../functions/redirects');
const { generateChartData, convertMinutes, convertMeters } = require('../functions/sportDataFunctions');
const { sports } = require('../data/sportslist');
const User = require('../models/user');
const co = require('co');
const generate = require('node-chartist');

router.get("/", isUserLoggedIn, (req, resp) => {
    let amountOfColumns = 7;
    let usersActivities;
    let barChart;

    // Find user's activites from the database:
    User.findById(req.session.userId, 'activities', (err, docs) => {

        if (err) {
            console.log(err);
        } 
        else {
            // Sort the activities by date:
            let activityList = (docs.activities).sort((a, b) => {
                return new Date(b.date) - new Date(a.date)
            });        
            usersActivities = [...activityList];
            // Add data to "Your latest activites" list: 
            usersActivities.forEach((activity) => {
                let sportDetails = sports.find(sport => sport.name === activity.name);
                activity.icon = sportDetails.icon;
                activity.date = dateFormat((activity.date), "ddd, dd.mm.yyyy");
                activity.hoursMinutes = convertMinutes(activity.time);
                activity.kilometersMeters = convertMeters(activity.distance);
            })
            // TODO: it may be a good idea to shorten the activity list
            // and show only the X (for example 20) amount of the latest activities.
        }
        // Bar chart:
        co(function* () {
            const options = { 
                width: 300, 
                height: 200, 
                axisY: { 
                    title: 'minutes', 
                    // TODO: minutes label should be repositioned. It is now
                    // stacked awkwardly with the numbers.
                    onlyInteger: true,
                } 
            };
            const chartData = generateChartData(amountOfColumns, usersActivities); 
            const data = {
                labels: chartData.weekdays,
                series: [chartData.dailyMinutes],
            };
            const bar = yield generate('bar', options, data); //=> chart HTML
            barChart = bar;
            resp.render('home', {
                amountOfColumns: amountOfColumns,
                activities: usersActivities,
                chartHtml: barChart,
            });
        });
    });
});

router.get("/logout", (req, resp) => {
    req.session.destroy(err => {
        if (err) {
            resp.redirect("/home");
        } else {
            resp.clearCookie("cookie");
            resp.redirect("/");
        }
    })
});

router.get("/deleteAccount", (req, resp) => {
    User.deleteOne({_id: req.session.userId}, (err) => {
        if (err) {
            resp.redirect("/home");
        } else {
            req.session.destroy(err => {
                if (err) {
                    console.log(err);
                    resp.redirect("/");
                } else {
                    resp.clearCookie("cookie");
                    resp.redirect("/");
                }
            })
        }
    })
});

module.exports = router;