var express = require('express');
const createError = require('http-errors');
var router = express.Router();
var spotifyPlayerUtils = require('../util/spotify-player-utils.js');

var spotifyManager = require('../manager/spotify-manager.js');

var buildError = (code, message) => {
  return {
    error: {
      code: code, 
      message: message
    }
  }
};

/**
 * Router level middleware to detect that authorization has been made to use spotify
 */
router.use(function(req, res, next) {
  // when request has code this means we are setting the access token and we shouldn't be checking the header
  if (req.query.code) {
    next();
    return;
  }

  spotifyManager.getSpotifyPlayer(req.headers['player-id']).then(spotifyPlayer => {
    // if falsy, send back 404
    if (!spotifyPlayer) {
      res.statusCode = 404;
      next({ message: `Player ${req.headers['player-id']} not found` });
      return;
    }

    res.locals.spotifyPlayer = spotifyPlayer;

    if (spotifyPlayer.getAccessToken() == undefined) {
      let message = 'No access token found. Redirect to authorization url.';
      console.log(message);

      spotifyPlayer.setRedirectURI(spotifyPlayerUtils.generateRedirectUri(req));
      // don't redirect, but instruct the client to redirect.  This is an asynchronous call and will only redirect this call not the browser, which is what we want to redirect
      res.json({
        message: message,
        redirectUrl: spotifyPlayer.createAuthorizeURL()
      });
    } else {
      if (!spotifyPlayer.getSpotifyRecord().users.includes(req.session.id)) {
        spotifyPlayer.addUser(req.session.id);
      }
      next();
    }
  })
});

 /**
  * Get currently playing track
  */
router.get('/nowplaying', function(req, res, next) {
  res.locals.spotifyPlayer.getMyCurrentPlayingTrack()
    .then(result => res.send.bind(res.send(result)))
    .catch(error => next(error));
});

/**
 * Search for relevant artists and tracks
 */
router.get('/search', function(req, res, next) {
  // server side validation for query
  if (!req.query.q || req.query.q == '') {
    res.statusCode = 406;
    res.json({ message: "No query found." });
    return;
  }

  let spotifyPlayer = res.locals.spotifyPlayer;
  let query = req.query.q;

  spotifyPlayer.search(query)
    .then((result) => res.send.bind(res.send(result)))
    .catch(error => next(error));
});

/**
 * Get an artist's info, top tracks, and albums.
 */
router.get('/artist/:id', function(req, res, next) {
  let spotifyPlayer = res.locals.spotifyPlayer;
  let id = req.params.id;
  
  spotifyPlayer.getArtist(id)
    .then(response => res.send.bind(res.send(response)))
    .catch(error => next(error));
});

/**
 * Get an album from the id.
 */
router.get('/album/:id', function(req, res, next) {
  let id = req.params.id;
  res.locals.spotifyPlayer.getAlbum(id)
    .then(result => res.send.bind(res.send(result.body)))
    .catch(error => next(error));
});

/**
 * Adds a track to the queue.
 * Post body must have uri with link to track.
 */
router.post('/queue', function(req, res, next) {
  if (!req.body.track || req.body.track == '') {
    res.statusCode = 406;
    res.json({ message: "No query found." });
    return;
  }

  let uri = req.body.track.uri;

  let spotifyPlayer = res.locals.spotifyPlayer;
  spotifyPlayer.addToQueue(req.session.id, uri).then(result => {
    // log the song queued
    let ip = (req.headers['x-forwarded-for'] || req.connection.remoteAddress).split(':').pop();
    console.log(req.body.track.name + ' - ' + req.body.track.artists.map(artist => artist.name).join(', ') 
      + ' queued by ' + ip);
  })
  .then(result => {  // success send back 204 because no content needs to be sent
    res.statusCode = 204;
    res.end();
  }).catch(error => {
    switch(error.body.error.status) {
      case 404:
        console.log('No active device found.');
        break;
    }
    res.statusCode = 500;
    next(buildError(error.body.error.reason, error.body.error.message));
  });  
});

/**
 * Get available devices.
 */
router.get('/devices', function(req, res, next) {
  res.locals.spotifyPlayer.getDevices()
    .then(result => res.send.bind(res.send(result)))
    .catch(error => next(error));
});

/**
 * Set playback device.
 */
router.post('/setup', function(req, res, next) {
  if (!req.body.deviceId || req.body.deviceId == '') {
    res.statusCode = 406;
    res.json({ message: "No playback device found." });
    return;
  }
  let deviceId = req.body.deviceId;
  let skipToNext = req.body.skipToNext;

  res.locals.spotifyPlayer.setPlaybackDevice(deviceId).then(res => console.log('Set device: ' + deviceId));
  res.locals.spotifyPlayer.setSkipToNext(skipToNext);  // default to false

  res.sendStatus(204);
});

router.post('/reset', function(req, res, next) {
  // spotifyPlayer.reset(); TODO: reimplement.. maybe

  res.statusCode = 204;
  res.end();
});

router.delete('/', function(req, res) {
  res.locals.spotifyPlayer.delete().then(() => {
    res.statusCode = 204;
    res.send.bind(res.send());
  });
});

router.get('/audio-analysis/:id', function(req, res, next) {
  let id = req.params.id;
  res.locals.spotifyPlayer.getAudioAnalysisForTrack(id)
    .then(result => res.send.bind(res.send(result)))
    .catch(error => next(error));
});

router.get('/track-features/:id', function(req, res, next) {
  let id = req.params.id;
  res.locals.spotifyPlayer.getAudioFeaturesForTrack(id)
    .then(result => res.send.bind(res.send(result)))
    .catch(error => next(error));
});

/**
 * Returns a user's queue.
 */
router.get('/queue', function(req, res, next) {
  res.locals.spotifyPlayer.getMyQueue()
    .then(result => res.send.bind(res.send(result.body)))
    .catch(error => next(error));
});

/**
 * Take the code sent from Spotify and grant an access token and save it.
 * Once done, redirect back to home page.
 */
router.get('/setAccessToken', function(req, res) {
  let playerId = req.query.state;
  spotifyManager.getSpotifyPlayer(playerId).then(spotifyPlayer => {
    spotifyPlayer.authorizationCodeGrant(req.query.code, spotifyPlayerUtils.generateRedirectUri(req)).then(
      function(data) {
        // hide token values
        let maskString = string => string.substring(0, 32) + 
            string.substring(32, string.length).replace().replace(/./gi,"*");
  
        console.log('The token expires in ' + data.body['expires_in']);
        console.log('The access token is ' + maskString(data.body['access_token']));
        console.log('The refresh token is ' + maskString(data.body['refresh_token']));
  
        res.redirect(`/app/?activation_success=true#${playerId}`);
      },
      function(err) {
        console.log('Something went wrong!', err);
      });
  })
});

// error handler
router.use(function(err, req, res, next) {
  res.status(res.statusCode || 500);
  res.json(err);
});


module.exports = router;