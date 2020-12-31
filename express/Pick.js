const mongoose = require('mongoose');

//mongoose.Schema.Types.ObjectId
const PickSchema = new mongoose.Schema({
  teamid: String,
  teamname: String,
  leagueid: String,
  player: String,
  picknumber: Number,
  sport: String,
});

mongoose.model('Pick', PickSchema);
