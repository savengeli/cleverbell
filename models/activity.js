const mongoose = require('mongoose');

let ActivitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  time: {
    type: Number,
    required: false,
  },
  distance: {
    type: Number,
    required: false,
  },
  notes: {
    type: String,
    required: false,
  },
});

let Activity = mongoose.model('Activity', ActivitySchema);

module.exports = Activity;
