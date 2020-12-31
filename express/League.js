const mongoose = require('mongoose');

const LeagueSchema = new mongoose.Schema({
  name: String,
  size: Number,
  season: Number,
  sports: {type: Array, default: []},
  players: {type: Array, default: []},
});

mongoose.model('League', LeagueSchema);
