const dateFormat = require('dateformat');
const Activity = require('../models/activity');

// Change empty values to 0:
const emptyTo0 = value => !value ? 0 : value;

const convertMinutes = (minutes) => {
	if (minutes === 0) {
		return (""); // If no time is given, don't show any text
	} else {
		let mins = minutes%60;
		let hours = (minutes - mins) / 60;
		if (mins < 10) {
			mins = "0" + mins.toString();
		}
		return ("Time: " + hours + ":" + mins);
	}
}

const convertMeters = (meters) => {
	if (meters > 999) {
		let m = meters%1000;
		let km = (meters - m) / 1000;
		return (km + " km, " + m + " m");
	}
	else if (meters > 0) { 
		return (meters + " m");
	} else {
		return (""); // If no distance is given, don't show any text
	}
}

const generateActivity = (data) => { 
	const { sportname, date, hours, minutes, kilometers, meters, notes } = data; 
	const time = parseInt(emptyTo0(hours))*60 + parseInt(emptyTo0(minutes));
	const distance = parseInt(emptyTo0(kilometers))*1000 + parseInt(emptyTo0(meters));
	const newActivity = new Activity ({
		name: sportname,
		date: date,
		time: time,
		distance: distance,  
		notes: notes,     
	});
	return newActivity;
}

const generateChartData = (amountOfColumns, activitiesData) => {
	// First step: generate an array of the last X dates (X = amount of columns in our chart).
	// Format the dates to match the format that our activies list is using.
	const dateNow = Date.now();
	const datesArray = new Array(amountOfColumns);
	const lastIndex = datesArray.length -1;
	// Fill the last slot of the array with today's date:
	datesArray[lastIndex] = dateFormat(new Date(), "ddd, dd.mm.yyyy");  
	// Fill the other slots of the array:
	let j = lastIndex;
	for (let i = (lastIndex - 1); i >= 0 ; i--) {
	   let dateUnformatted = new Date(dateNow - (amountOfColumns-j) * 24 * 60 * 60 * 1000);
	   datesArray[i] = dateFormat(dateUnformatted, "ddd, dd.mm.yyyy");
	   j--;
	}
 
	// Second step: generate an array that contains the user's daily (of last x days) 
	// activity in minutes. All daily activity minutes are added together (if user has had
	// several activites in one day).
	const dailyActivityMinutes = new Array(amountOfColumns).fill(0); // 0 minutes per day by default
 
	const data = [...activitiesData];
	// We only need the activities with the dates matching our datesArray:
	const newestActivities = data.filter(activity => datesArray.includes(activity.date));
 
	// Fill the array with the activity minutes:
	for (let i = 0; i < newestActivities.length; i++) {
	   let index = datesArray.findIndex(date => date === newestActivities[i].date);
	   dailyActivityMinutes[index] += newestActivities[i].time;
	}
 
	// Third step: generate labels (= weekdays) for our chart's x-axis:
	const weekdays = datesArray.map(date => date.substring(0, 3));
 
	// Final step: wrap our chartData and return it:
	const chartData = {
	   dailyMinutes: dailyActivityMinutes,
	   weekdays: weekdays,
	}

	return chartData;
 }
 
module.exports.generateChartData = generateChartData;
module.exports.generateActivity = generateActivity;
module.exports.convertMinutes = convertMinutes;
module.exports.convertMeters = convertMeters;
