var express = require('express');
var router = express.Router();
var SpotifyPlayer = require('../player/SpotifyPlayer.js');
var spotifyPlayerUtils = require('../util/spotify-player-utils.js');

/**
 * Router level middleware to detect that authorization has been made to use spotify
 */
router.use(function(req, res, next) {
  if ((spotifyPlayerUtils.getSpotifyPlayer(req, 'test') == undefined || spotifyPlayerUtils.getSpotifyPlayer(req, 'test').getSpotifyApi().getAccessToken() == undefined)
      && !req.query.code) {
    let message = 'No access token found. Redirect to authorization url.';
    console.log(message);
    req.app.get('spotifyPlayerMap').set('test', new SpotifyPlayer());
    spotifyPlayerUtils.getSpotifyPlayer(req, 'test').getSpotifyApi().setRedirectURI(req.protocol + '://' + req.get('host') + '/api/setAccessToken');
    // don't redirect, but instruct the client to redirect.  This is an asynchronous call and will only redirect this call not the browser, which is what we want to redirect
    res.json({
      message: message,
      redirectUrl: spotifyPlayerUtils.getSpotifyPlayer(req, 'test').getSpotifyApi().createAuthorizeURL(spotifyPlayerUtils.getSpotifyPlayer(req, 'test').getScopes(), 'setup')
    });
  } else {
    next();
  }
});

/**
 * For opening up react app
 */
router.get(['/app', '/app/*'], function(req, res) {
  res.sendFile(path.join(__dirname, '../public', 'app.html'));
 });

 /**
  * Get currently playing track
  */
router.get('/nowplaying', function(req, res, next) {
  spotifyPlayerUtils.getSpotifyPlayer(req, 'test').getSpotifyApi().getMyCurrentPlayingTrack()
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

  let query = req.query.q;
  let response = {};

  spotifyPlayerUtils.getSpotifyPlayer(req, 'test').getSpotifyApi().searchArtists(query, {limit: 5})
    .then(result => response.artists = result.body.artists)
    .then(() => spotifyPlayerUtils.getSpotifyPlayer(req, 'test').getSpotifyApi().searchTracks(query, {limit: 10}))
    .then(result => response.tracks = result.body.tracks)
    .then(() => spotifyPlayerUtils.getSpotifyPlayer(req, 'test').getSpotifyApi().searchAlbums(query,{limit: 5}))
    .then(result => response.albums = result.body.albums)
    .then(() => res.send.bind(res.send(response)))
    .catch(error => next(error));
});

/**
 * Get an artist's info, top tracks, and albums.
 */
router.get('/artist/:id', function(req, res, next) {
  let id = req.params.id;
  let response = {};
  spotifyPlayerUtils.getSpotifyPlayer(req, 'test').getSpotifyApi().getArtist(id)
    .then(result => response.artist = result.body)
    .then(() => spotifyPlayerUtils.getSpotifyPlayer(req, 'test').getSpotifyApi().getArtistTopTracks(id, 'US'))
    .then(result => response.top_tracks = result.body.tracks)
    .then(() => spotifyPlayerUtils.getSpotifyPlayer(req, 'test').getSpotifyApi().getArtistAlbums(id, {market: 'US', limit: 50}))  // 50 is max limit
    .then(result => response.albums = result.body)
    .then(() => res.send.bind(res.send(response)))
    .catch(error => next(error));
});

/**
 * Get an album from the id.
 */
router.get('/album/:id', function(req, res, next) {
  let id = req.params.id;
  spotifyPlayerUtils.getSpotifyPlayer(req, 'test').getSpotifyApi().getAlbum(id)
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
  spotifyPlayerUtils.getSpotifyPlayer(req, 'test').getSpotifyApi().addToQueue(uri, { device_id: spotifyPlayerUtils.getSpotifyPlayer(req, 'test').getDeviceId() })
    .then(result => {
      if (spotifyPlayerUtils.getSpotifyPlayer(req, 'test').getIsFirstSongQueued()) { // do some more setup, skip to next (which is the one just queued) and play from selected available device
        spotifyPlayerUtils.getSpotifyPlayer(req, 'test').getSpotifyApi().skipToNext(); // this should automatically start playing
        spotifyPlayerUtils.getSpotifyPlayer(req, 'test').setIsFirstSongQueued(false);
      }

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
      next(error);
    });  
});

/**
 * Get available devices.
 */
router.get('/devices', function(req, res, next) {
  spotifyPlayerUtils.getSpotifyPlayer(req, 'test').getSpotifyApi().getMyDevices()
    .then(result => res.send.bind(res.send(result.body.devices)))
    .catch(error => next(error));
});

/**
 * Set available device.
 */
router.post('/devices', function(req, res, next) {
  if (!req.body.deviceId || req.body.deviceId == '') {
    res.statusCode = 406;
    res.json({ message: "No query found." });
    return;
  }
  let deviceId = req.body.deviceId;
  spotifyPlayerUtils.getSpotifyPlayer(req, 'test').setDeviceId(deviceId);
  spotifyPlayerUtils.getSpotifyPlayer(req, 'test').getSpotifyApi().transferMyPlayback([deviceId]).then(res => console.log('Set device: ' + deviceId));

  res.statusCode = 204;
  res.end();
});

router.post('/reset', function(req, res, next) {
  spotifyPlayerUtils.getSpotifyPlayer(req, 'test').reset();

  res.statusCode = 204;
  res.end();
});

router.get('/audio-analysis/:id', function(req, res, next) {
  let id = req.params.id;
  spotifyPlayerUtils.getSpotifyPlayer(req, 'test').getSpotifyApi().getAudioAnalysisForTrack(id)
    .then(result => res.send.bind(res.send(result.body)))
    .catch(error => next(error));
});

router.get('/track-features/:id', function(req, res, next) {
  let id = req.params.id;
  spotifyPlayerUtils.getSpotifyPlayer(req, 'test').getSpotifyApi().getAudioFeaturesForTrack(id)
    .then(result => res.send.bind(res.send(result.body)))
    .catch(error => next(error));
});

/**
 * Take the code sent from Spotify and grant an access token and save it.
 * Once done, redirect back to home page.
 */
router.get('/setAccessToken', function(req, res) {
  spotifyPlayerUtils.getSpotifyPlayer(req, 'test').getSpotifyApi().authorizationCodeGrant(req.query.code).then(
    function(data) {
      // hide token values
      let maskString = string => string.substring(0, 32) + 
          string.substring(32, string.length).replace().replace(/./gi,"*");

      console.log('The token expires in ' + data.body['expires_in']);
      console.log('The access token is ' + maskString(data.body['access_token']));
      console.log('The refresh token is ' + maskString(data.body['refresh_token']));
  
      // Set the access token on the API object to use it in later calls
      spotifyPlayerUtils.getSpotifyPlayer(req, 'test').getSpotifyApi().setAccessToken(data.body['access_token']);
      spotifyPlayerUtils.getSpotifyPlayer(req, 'test').getSpotifyApi().setRefreshToken(data.body['refresh_token']);

      // response does not depend on the next calls so can call them while response is redirected
      spotifyPlayerUtils.getSpotifyPlayer(req, 'test').getSpotifyApi().pause().catch(error => console.log(error));

      res.redirect(req.protocol + '://' + req.get('host') + '/?activation_success=true');
    },
    function(err) {
      console.log('Something went wrong!', err);
    });
});


module.exports = router;