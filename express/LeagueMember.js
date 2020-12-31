const mongoose = require('mongoose');

const LeagueMemberSchema = new mongoose.Schema({
  playerid: mongoose.Schema.Types.ObjectId,
  leagueid: mongoose.Schema.Types.ObjectId,
  pickorder: Number,
  iscommish: Boolean,
});

mongoose.model('LeagueMember', LeagueMemberSchema);
