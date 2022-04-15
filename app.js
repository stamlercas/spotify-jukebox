/**
 * Does application setup stuff. Like setting up socket.io, setting up routes, etc.
 */

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cron = require('node-cron');
var spotifyPlayerMap = new Map();
var SpotifyPlayer = require('./player/SpotifyPlayer.js');
var WordUtils = require('./util/word-utils.js');

require('dotenv').config();

// continue with app setup stuff
var app = express();

var apiRouter = require('./routes/api');

app.set('spotifyPlayerMap', spotifyPlayerMap);

// set up task for refreshing access token every hour. Note this task needs to be started before it will do anything. This will happen whenever an access token is received
var cronTask = cron.schedule('0 * * * *', () => spotifyPlayerMap.forEach((v, k) => {
  if (v.isExpired()) {
    console.log(`Spotify instance ${k} has expired...`);
    spotifyPlayerMap.delete(k);
  } else {
    v.getSpotifyApi(false).refreshAccessToken().then(
      (data) => {
        console.log(`The access token has been refreshed for ${k}!`);
        // Save the access token so that it's used in future calls
        v.getSpotifyApi(false).setAccessToken(data.body['access_token']);
      },
      (err) => console.log('Could not refresh access token', err)
    )
  }
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('short'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', apiRouter);

app.get('/', function(req, res, next) {
  res.render('index');
});

/**
 * Create new spotify instance, and redirect user.
 */
app.get('/create', function(req, res, next) {
  let playerId = WordUtils.generateRandomWords(3);
  spotifyPlayerMap.set(playerId, new SpotifyPlayer());
  console.log(`New spotify instance created: ${playerId}`);
  res.redirect(`${req.protocol}://${req.get('host')}/app/#${playerId}`);
});

/**
 * Retrieve info on active instances. Protected by a key stored in environment variable
 */
app.get('/info', function(req, res, next) {
  if (req.headers["admin-key"] === process.env.ADMIN_KEY) {
    let instances = [];
    spotifyPlayerMap.forEach((v, k) => instances.push({id: k, expires: new Date(v._expiration)}));
    res.send(instances);
  } else {
    next(createError(404));
  }
});

/**
 * For opening up react app
 */
 app.get(['/app', '/app/*'], function(req, res) {
  res.sendFile(path.join(__dirname, 'public', 'app.html'));
 });

// app.use(function(req, res, next) {
//   res.sendFile(path.join(__dirname, 'public', 'app.html'));
//  });

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
