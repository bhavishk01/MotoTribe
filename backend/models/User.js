const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  vehicle: { type: String, required: true } // e.g., "2018 Honda Civic"
});

module.exports = mongoose.model('User', userSchema);