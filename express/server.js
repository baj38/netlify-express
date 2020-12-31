'use strict';
const express = require('express');
/*
const path = require('path');
const serverless = require('serverless-http');
const app = express();
const bodyParser = require('body-parser');
*/
var co = require('co');
var bcrypt = require('bcrypt-nodejs');

const mongoose = require('mongoose');

let conn = null;

/*
require('./Team');
require('./League');
require('./Pick');
require('./Player');
require('./LeagueMember');
*/

const mongoUri =
  'mongodb+srv://b3llamy:10onmySHH@realmcluster.f68jh.mongodb.net/UFLDraft?retryWrites=true&w=majority';

/*
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: false,
});
*/
exports.handler = function(event, context, callback) {
  var requestbody = JSON.parse(JSON.parse(JSON.stringify(event)).body);
  context.callbackWaitsForEmptyEventLoop = false;

  run(requestbody).
    then(res => {
      callback(null,res);
    }).
      catch(error => callback(error))
};

function run(reqbody) {
  return co(function*() {
    if (conn == null) {
      conn = yield mongoose.createConnection(mongoUri, {
        bufferCommands: false,
        bufferMaxEntries: 0
      });
      conn.model('Team', new mongoose.Schema({
        name: String,
        projected: Number,
        sport: String,
        points: Number,
      }));
      
      conn.model('League', new mongoose.Schema({
        name: String,
        size: Number,
        season: Number,
        sports: {type: Array, default: []},
        players: {type: Array, default: []},
      }));

      conn.model('Pick', new mongoose.Schema({
        teamid: String,
        teamname: String,
        leagueid: String,
        player: String,
        picknumber: Number,
        sport: String,
      }));

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
      
      conn.model('Player', PlayerSchema);

    }

    var route = reqbody.route;
    var doc = '';
    if (route == 'picks')
    {
      const M = conn.model('Pick');
      doc = yield M.find({leagueid: reqbody.leagueid})
        .sort({picknumber: 1})
        .catch((err) => {
          console.log(err);
      });
    }

    if (route == 'leagues')
    {
      const M = conn.model('League');
      doc = yield M.find({})
        .catch((err) => {
          console.log(err);
      });
    }

    if (route == 'players')
    {
      const M = conn.model('Player');
      doc = yield M.find({})
        .catch((err) => {
          console.log(err);
      });
    }

    if (route == 'teams')
    {
      const M = conn.model('Team');
      doc = yield M.find({})
        .sort({projected: -1})
        .catch((err) => {
          console.log(err);
      });
    }

    if (route == 'login')
    {
      const M = conn.model('Player');
      yield M.findOne({username: reqbody.username}, (_err, player) => {
        doc = player.validPassword(reqbody.password);
      });
    }

    if (route == 'register')
    {
      const M = conn.model('Player');
      yield M.findOne({username: reqbody.username}, function (_err, founduser) {
        if (founduser === null) {
          const new_user = conn.model('Player')({
            username: reqbody.username,
            email: reqbody.email,
            avatar: reqbody.avatar,
            sms: reqbody.sms,
            leagues: reqbody.leagues,
          });
          new_user.password = new_user.generateHash(reqbody.password);
          new_user
            .save()
            .then((data) => {
              doc = data;
            })
            .catch((err) => {
              console.log(err);
            });
        } else {
          doc = 'username not unique';
        }
      });
    }

    if (route == 'sendpick')
    {
      const pick = conn.model('Pick')({
        teamid: reqbody.teamid,
        leagueid: reqbody.leagueid,
        player: reqbody.player,
        picknumber: reqbody.picknumber,
        sport: reqbody.sport,
        teamname: reqbody.teamname,
      });
      pick
        .save()
        .then((data) => {
          doc = data;
        })
        .catch((err) => {
          console.log(err);
        });
    }

    if (route == 'createleague')
    {
      const league = conn.model('League')({
        name: reqbody.name,
        size: reqbody.size,
        players: reqbody.players,
        sports: reqbody.sports,
        season: reqbody.season,
      });
      league
        .save()
        .then((data) => {
          doc = data;
        })
        .catch((err) => {
          console.log(err);
        });
    }

    if (route == 'updateleague')
    {
      const M = conn.model('League');

      doc = yield M.findByIdAndUpdate(reqbody.id, {
        name: reqbody.name,
        size: reqbody.size,
        season: reqbody.season,
        sports: reqbody.sports,
        players: reqbody.players,
      })
        .catch((err) => {
          console.log(err);
        });
    }

    if (route == 'updateplayer')
    {
      const M = conn.model('Player');

      doc = yield M.findByIdAndUpdate(reqbody.id, {
        username: reqbody.username,
        password: reqbody.password,
        email: reqbody.email,
        sms: reqbody.sms,
        avatar: reqbody.avatar,
        leagues: reqbody.leagues,
      })
        .catch((err) => {
          console.log(err);
        });
    }

    const response = {
      statusCode: 200,
      body: JSON.stringify(doc)
    };
    return response;
  });
}
