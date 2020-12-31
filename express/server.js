'use strict';
const express = require('express');
const path = require('path');
const serverless = require('serverless-http');
const app = express();
const bodyParser = require('body-parser');
var co = require('co');

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
  console.log('JSON.stringify(event): ' + JSON.stringify(event));
  console.log('JSON.parse(JSON.stringify(event)): ' + JSON.parse(JSON.stringify(event)));
  console.log('JSON.stringify(event).body: ' + JSON.stringify(event).body);
  console.log('JSON.parse(JSON.stringify(event)).body: ' + JSON.parse(JSON.stringify(event)).body);

  context.callbackWaitsForEmptyEventLoop = false;

  run().
    then(res => {
      callback(null,res);
    }).
      catch(error => callback(error))
};

function run() {
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

    const M = conn.model('Pick');

    const doc = yield M.find();
    const response = {
      statusCode: 200,
      body: JSON.stringify(doc)
    };
    return response;
  });
}

/*
mongoose.connection.on('connected', () => {
  console.log('connected to mongo');
});
mongoose.connection.on('error', (err) => {
  console.log('error', err);
});

const router = express.Router();
router.get('/', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.write('<h1>Hello from Express.js!</h1>');
  res.end();
});

router.post('/register', (req, res) => {
  Player.findOne({username: req.body.username}, function (_err, founduser) {
    if (founduser === null) {
      const new_user = new Player({
        username: req.body.username,
        email: req.body.email,
        avatar: req.body.avatar,
        sms: req.body.sms,
        leagues: req.body.leagues,
      });
      new_user.password = new_user.generateHash(req.body.password);
      new_user
        .save()
        .then((data) => {
          console.log(data);
          res.send(data);
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      res.send('username not unique');
    }
  });
});

router.post('/login', (req, res) => {
  Player.findOne({username: req.body.username}, (_err, player) => {
    res.send(player.validPassword(req.body.password));
  });
});

router.post('/sendpick', (req, res) => {
  const pick = new Pick({
    teamid: req.body.teamid,
    leagueid: req.body.leagueid,
    player: req.body.player,
    picknumber: req.body.picknumber,
    sport: req.body.sport,
    teamname: req.body.teamname,
  });
  pick
    .save()
    .then((data) => {
      console.log(data);
      res.send(data);
    })
    .catch((err) => {
      console.log(err);
    });
});

//todo: assign pickorder randomly
router.post('/join', (req, res) => {
  const member = new LeagueMember({
    leagueid: req.body.leagueid,
    playerid: req.body.playerid,
    iscommish: req.body.iscommish,
    pickorder: req.body.pickorder,
  });
  member
    .save()
    .then((data) => {
      console.log(data);
      res.send(data);
    })
    .catch((err) => {
      console.log(err);
    });
});

router.post('/createleague', (req, res) => {
  const league = new League({
    name: req.body.name,
    size: req.body.size,
    season: req.body.season,
    players: req.body.players,
    sports: req.body.sports,
  });
  league
    .save()
    .then((data) => {
      console.log(data);
      res.send(data);
    })
    .catch((err) => {
      console.log(err);
    });
});

router.post('/createplayer', (req, res) => {
  const player = new Player({
    username: req.body.username,
    password: req.body.password,
    email: req.body.email,
    sms: req.body.sms,
    avatar: req.body.avatar,
  });
  player
    .save()
    .then((data) => {
      console.log(data);
      res.send(data);
    })
    .catch((err) => {
      console.log(err);
    });
});

router.post('/deletepick', (req, res) => {
  Pick.findByIdAndRemove(req.body.id)
    .then((data) => {
      console.log(data);
      res.send(data);
    })
    .catch((err) => {
      console.log(err);
    });
});

router.post('/updateleague', (req, res) => {
  League.findByIdAndUpdate(req.body.id, {
    name: req.body.name,
    size: req.body.size,
    season: req.body.season,
    sports: req.body.sports,
  })
    .then((data) => {
      console.log(data);
      res.send(data);
    })
    .catch((err) => {
      console.log(err);
    });
});

router.post('/updateplayer', (req, res) => {
  Player.findByIdAndUpdate(req.body.id, {
    username: req.body.username,
    password: req.body.password,
    email: req.body.email,
    sms: req.body.sms,
    avatar: req.body.avatar,
  })
    .then((data) => {
      console.log(data);
      res.send(data);
    })
    .catch((err) => {
      console.log(err);
    });
});

router.get('/teams', (req, res) => {
  Team.find({})
    .sort({projected: -1})
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      console.log(err);
    });
});

router.get('/leagues', (req, res) => {
  League.find({})
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      console.log(err);
    });
});

router.get('/players', (req, res) => {
  Player.find({})
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      console.log(err);
    });
});

router.post('/picks', (req, res) => {
  Pick.find({leagueid: req.body.leagueid})
    .sort({picknumber: 1})
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      console.log(err);
    });
});


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use('/.netlify/functions/server', router);  // path must route to lambda
app.use('/', (req, res) => res.sendFile(path.join(__dirname, '../index.html')));

module.exports = app;
module.exports.handler = serverless(app);
*/