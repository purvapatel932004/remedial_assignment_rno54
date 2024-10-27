const mongoose = require('mongoose');

const developerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  registrationCode: { type: String, required: true, unique: true },
  dob: { type: Date, required: true },
  city: { type: String, required: true },
  degree: { type: String, required: true },  
  files: { type: [String] },                   
  password: { type: String, required: true }
});

module.exports = mongoose.model('Developer', developerSchema);
