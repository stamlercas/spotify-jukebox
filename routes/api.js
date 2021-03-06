var express = require('express');
var router = express.Router();

/**
 * Router level middleware to detect that authorization has been made to use spotify
 */
router.use(function(req, res, next) {
  if (req.app.get('spotifyPlayer').getSpotifyApi().getAccessToken() == undefined && !req.query.code) {
    let message = 'No access token found. Redirect to authorization url.';
    console.log(message);
    req.app.get('spotifyPlayer').getSpotifyApi().setRedirectURI(req.protocol + '://' + req.get('host') + '/api/setAccessToken');
    // don't redirect, but instruct the client to redirect.  This is an asynchronous call and will only redirect this call not the browser, which is what we want to redirect
    res.json({
      message: message,
      redirectUrl: req.app.get('spotifyPlayer').getSpotifyApi().createAuthorizeURL(req.app.get('spotifyPlayer').getScopes(), 'setup')
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
  req.app.get('spotifyPlayer').getSpotifyApi().getMyCurrentPlayingTrack()
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

  req.app.get('spotifyPlayer').getSpotifyApi().searchArtists(query, {limit: 5})
    .then(result => response.artists = result.body.artists)
    .then(() => req.app.get('spotifyPlayer').getSpotifyApi().searchTracks(query, {limit: 10}))
    .then(result => response.tracks = result.body.tracks)
    .then(() => req.app.get('spotifyPlayer').getSpotifyApi().searchAlbums(query,{limit: 5}))
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
  req.app.get('spotifyPlayer').getSpotifyApi().getArtist(id)
    .then(result => response.artist = result.body)
    .then(() => req.app.get('spotifyPlayer').getSpotifyApi().getArtistTopTracks(id, 'US'))
    .then(result => response.top_tracks = result.body.tracks)
    .then(() => req.app.get('spotifyPlayer').getSpotifyApi().getArtistAlbums(id, {market: 'US', limit: 50}))  // 50 is max limit
    .then(result => response.albums = result.body)
    .then(() => res.send.bind(res.send(response)))
    .catch(error => next(error));
});

/**
 * Get an album from the id.
 */
router.get('/album/:id', function(req, res, next) {
  let id = req.params.id;
  req.app.get('spotifyPlayer').getSpotifyApi().getAlbum(id)
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
  req.app.get('spotifyPlayer').getSpotifyApi().addToQueue(uri, { device_id: req.app.get('spotifyPlayer').getDeviceId() })
    .then(result => {
      if (req.app.get('spotifyPlayer').getIsFirstSongQueued()) { // do some more setup, skip to next (which is the one just queued) and play from selected available device
        req.app.get('spotifyPlayer').getSpotifyApi().skipToNext(); // this should automatically start playing
        req.app.get('spotifyPlayer').setIsFirstSongQueued(false);
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
  req.app.get('spotifyPlayer').getSpotifyApi().getMyDevices()
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
  req.app.get('spotifyPlayer').setDeviceId(deviceId);
  req.app.get('spotifyPlayer').getSpotifyApi().transferMyPlayback([deviceId]).then(res => console.log('Set device: ' + deviceId));

  res.statusCode = 204;
  res.end();
});

/**
 * Take the code sent from Spotify and grant an access token and save it.
 * Once done, redirect back to home page.
 */
router.get('/setAccessToken', function(req, res) {
  req.app.get('spotifyPlayer').getSpotifyApi().authorizationCodeGrant(req.query.code).then(
    function(data) {
      // hide token values
      let maskString = string => string.substring(0, 32) + 
          string.substring(32, string.length).replace().replace(/./gi,"*");

      console.log('The token expires in ' + data.body['expires_in']);
      console.log('The access token is ' + maskString(data.body['access_token']));
      console.log('The refresh token is ' + maskString(data.body['refresh_token']));
  
      // Set the access token on the API object to use it in later calls
      req.app.get('spotifyPlayer').getSpotifyApi().setAccessToken(data.body['access_token']);
      req.app.get('spotifyPlayer').getSpotifyApi().setRefreshToken(data.body['refresh_token']);

      // response does not depend on the next calls so can call them while response is redirected
      req.app.get('spotifyPlayer').getSpotifyApi().pause().catch(error => console.log(error));

      // start task here
      req.app.get('spotifyPlayerRefreshTask').start();

      res.redirect(req.protocol + '://' + req.get('host') + '/?activation_success=true');
    },
    function(err) {
      console.log('Something went wrong!', err);
    });
});


module.exports = router;