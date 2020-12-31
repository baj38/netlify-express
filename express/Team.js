const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema({
  name: String,
  projected: Number,
  sport: String,
  points: Number,
});

mongoose.model('Team', TeamSchema);
