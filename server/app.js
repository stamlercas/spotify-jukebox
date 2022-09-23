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
var session = require('express-session');

require('dotenv').config();

// continue with app setup stuff
var app = express();

var apiRouter = require('./routes/api');

app.set('spotifyPlayerMap', spotifyPlayerMap);

// set up task for refreshing access token every hour
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

/**
 * redirect any page from http to https
 */
 app.use((req, res, next) => {
  if (req.app.get('env') !== 'development' && req.app.get('env') !== 'test' && !isSecure(req)) {
    res.redirect(301, `https://${req.headers.host}${req.url}`);
  } else {
    next();
  }
});

app.use(logger('short'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  resave: false, 
  secret: process.env.SECRET,
  cookie: { maxAge: 1209600000 }  // 2 weeks
}));

app.use('/api', apiRouter);

app.get('/', function(req, res, next) {
  res.render('index');
});

/**
 * Create new spotify instance, and redirect user.
 */
app.get('/create', function(req, res, next) {
  let playerId = WordUtils.generateRandomWords(3);

  let spotifyPlayer = new SpotifyPlayer();
  spotifyPlayer.setCreator(req.session.id);

  spotifyPlayerMap.set(playerId, spotifyPlayer);
  console.log(`New spotify instance created: ${playerId} by ${req.session.id}`);
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

/**
 * req.secure will return always false if there is a load balancer that redirects internally through HTTP
 * @param req express http request
 * @returns true if the http request is secure (comes form https)
 */
 function isSecure(req) {
  if (req.headers['x-forwarded-proto']) {
    return req.headers['x-forwarded-proto'] === 'https';
  }
  return req.secure;
};

module.exports = app;
