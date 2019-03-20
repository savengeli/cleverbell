const mongoose = require('mongoose');

let UserSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true,
    trim: true // removes white spaces
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true 
  },
  activities: [],
}, { collection: 'users' });

let User = mongoose.model('User', UserSchema);

module.exports = User;