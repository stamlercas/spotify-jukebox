var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var http = require('http');
var SpotifyPlayer = require('./player/SpotifyPlayer.js');
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

// this should be really defined in the app not here..
io.on("connection", (socket) => {
  let interval;
  console.log("New client connected");
  interval = setInterval(() => getNowPlayingAndEmit(socket), 1000);
  socket.on("disconnect", () => {
    console.log("Client disconnected");
    clearInterval(interval);
  });
});

const getNowPlayingAndEmit = socket => {
  if (spotifyPlayer.getSpotifyApi().getAccessToken() != undefined) {
  spotifyPlayer.getSpotifyApi().getMyCurrentPlayingTrack()
    .then(result => socket.emit("NowPlaying", JSON.stringify(result)))
  }
};

// continue with app setup stuff
var app = express();

var apiRouter = require('./routes/api');

app.set('spotifyPlayer', spotifyPlayer);

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
