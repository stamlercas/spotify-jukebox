/**
 * Does application setup stuff. Like setting up socket.io, setting up routes, etc.
 */

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var http = require('http');
var SpotifyPlayer = require('./player/SpotifyPlayer.js');
var cron = require('node-cron');
var spotifyPlayer = new SpotifyPlayer();

// socket.io stuff
let port = 3001;
const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "*"
  }
});
server.listen(port, () => console.log(`Listening on port ${port}`));

io.on("connection", (socket) => {
  let interval;
  let ip = socket.handshake.address;
  console.log(`${ip} connected`);
  interval = setInterval(() => getNowPlayingAndEmit(socket), 1000);
  socket.on("disconnect", () => {
    console.log(`${ip} disconnected`);
    clearInterval(interval);
  });
});

const getNowPlayingAndEmit = socket => {
  // need to have set access token before making any spotify call
  if (spotifyPlayer.getSpotifyApi().getAccessToken() != undefined) {
  spotifyPlayer.getSpotifyApi().getMyCurrentPlayingTrack()
    .then(result => socket.emit("NowPlaying", JSON.stringify(result)))
    .catch(error => console.log('Error while retrieving now playing info in socket.io'))
  }
};

// continue with app setup stuff
var app = express();

var apiRouter = require('./routes/api');

app.set('spotifyPlayer', spotifyPlayer);

// set up task for refreshing access token every hour. Note this task needs to be started before it will do anything. This will happen whenever an access token is received
var cronTask = cron.schedule('0 * * * *', () => {
  spotifyPlayer.getSpotifyApi().refreshAccessToken().then(
    (data) => {
      console.log('The access token has been refreshed!');
      // Save the access token so that it's used in future calls
      spotifyPlayer.getSpotifyApi().setAccessToken(data.body['access_token']);
    },
    (err) => console.log('Could not refresh access token', err)
  )
}, {
  scheduled: false
});
app.set('spotifyPlayerRefreshTask', cronTask);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('short'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', apiRouter);

app.use(function(req, res, next) {
  res.sendFile(path.join(__dirname, 'public', 'app.html'));
 });

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
