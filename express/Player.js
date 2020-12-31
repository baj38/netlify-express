const mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

const PlayerSchema = new mongoose.Schema({
  username: String,
  password: String,
  email: String,
  avatar: String,
  leagues: {type: Array, default: []},
});

PlayerSchema.methods.generateHash = function (password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

PlayerSchema.methods.validPassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

mongoose.model('Player', PlayerSchema);
