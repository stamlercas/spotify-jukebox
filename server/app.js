/**
 * Does application setup stuff. Like setting up socket.io, setting up routes, etc.
 */

var createError = require('http-errors');
var express = require('express');
var session = require('express-session')
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cron = require('node-cron');
var spotifyManager = require('./manager/spotify-manager.js');
var MongoStore = require('connect-mongo');
var appVersion = require('../package.json').version;

require('dotenv').config();

// continue with app setup stuff
var app = express();

/**
 * Database connection
 */
const dbo = require('./db/conn');
// do an initial check of spotify instances. This app could theoretically be down for a long time and an instance could lapse
dbo.connectToServer().then(() => checkSpotifyPlayerExpiration()); 
var apiRouter = require('./routes/api');

// set up task for refreshing access token every hour. Note this task needs to be started before it will do anything. This will happen whenever an access token is received
var cronTask = cron.schedule('0 * * * *', () => checkSpotifyPlayerExpiration());

function checkSpotifyPlayerExpiration() {
  spotifyManager.getAllSpotifyPlayers().then(list => list.forEach(spotifyPlayer => {
    if (spotifyPlayer.isExpired()) {
      spotifyPlayer.delete();
    } else {
      if (spotifyPlayer.getAccessToken() != null) {
        spotifyPlayer.refreshAccessToken();
      }
    }
  }));
}

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

app.use(session({
  store: MongoStore.create({ mongoUrl: process.env.MONGO_STORE_CONNECTION_STRING }),
  resave: false, 
  secret: process.env.SECRET,
  cookie: { maxAge: 12096000000 }  // 20 weeks
}))

app.use(logger('short'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', apiRouter);

app.get('/', function(req, res, next) {
  res.render('index', {version: appVersion});
});

app.get('/about', function(req, res, next) {
  res.render('about', {version: appVersion});
});

/**
 * Create new spotify instance, and redirect user.
 */
app.get('/create', function(req, res, next) {
  let playerId = spotifyManager.createNewSpotifyPlayer(req.session.id);
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
