var express = require('express');
var router = express.Router();

var SpotifyWebApi = require('spotify-web-api-node');

var scopes = [
  'user-modify-playback-state',
  'user-read-playback-state'
];

var spotifyApi = new SpotifyWebApi({
  clientId: 'd143076b396b41d5a9b0b8cc10f7ea7c',
  clientSecret: 'bc3f6d91473f46ada5d6749d3be495a3',
  redirectUri: ''
});

var firstSongQueued = true;

/**
 * Router level middleware to detect that authorization has been made to use spotify
 */
router.use(function(req, res, next) {
  if (spotifyApi.getAccessToken() == undefined && !req.query.code) {
    let message = 'No access token found. Redirect to authorization url.';
    console.log(message);
    spotifyApi.setRedirectURI(req.protocol + '://' + req.get('host') + '/api/setAccessToken');
    // don't redirect, but instruct the client to redirect.  This is an asynchronous call and will only redirect this call not the browser, which is what we want to redirect
    res.json({
      message: message,
      redirectUrl: spotifyApi.createAuthorizeURL(scopes, 'setup')
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
  spotifyApi.getMyCurrentPlayingTrack()
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

  spotifyApi.searchArtists(query, {limit: 5})
    .then(result => response.artists = result.body.artists)
    .then(() => spotifyApi.searchTracks(query, {limit: 10}))
    .then(result => response.tracks = result.body.tracks)
    .then(() => res.send.bind(res.send(response)))
    .catch(error => next(error));
});

/**
 * Adds a track to the queue.
 * Post body must have uri with link to track.
 */
router.post('/queue', function(req, res, next) {
  if (!req.body.uri || req.body.uri == '') {
    res.statusCode = 406;
    res.json({ message: "No query found." });
    return;
  }

  let uri = req.body.uri;
  spotifyApi.addToQueue(uri)
    .then(result => {
      if (firstSongQueued) { // do some more setup, skip to next (which is the one just queued) and play
        spotifyApi.skipToNext().then(() => spotifyApi.play());
        firstSongQueued = false;
      }
    })
    .then(result => {  // success send back 204 because no content needs to be sent
      res.statusCode = 204;
      res.end();
    }).catch(error => {
      console.log(error);
      switch(error.body.error.status) {
        case 404:
          console.log('No active device found.');
          break;
      }
      next(error);
    });

  
});

/**
 * Take the code sent from Spotify and grant an access token and save it.
 * Once done, redirect back to home page.
 */
router.get('/setAccessToken', function (req, res) {
  spotifyApi.authorizationCodeGrant(req.query.code).then(
    function(data) {
      // hide token values
      let maskString = string => string.substring(0, 32) + 
          string.substring(32, string.length).replace().replace(/./gi,"*");

      console.log('The token expires in ' + data.body['expires_in']);
      console.log('The access token is ' + maskString(data.body['access_token']));
      console.log('The refresh token is ' + maskString(data.body['refresh_token']));
  
      // Set the access token on the API object to use it in later calls
      spotifyApi.setAccessToken(data.body['access_token']);
      spotifyApi.setRefreshToken(data.body['refresh_token']);

      // response does not depend on the next calls so can call them while response is redirected
      spotifyApi.pause();

      res.redirect(req.protocol + '://' + req.get('host') + '/');
    },
    function(err) {
      console.log('Something went wrong!', err);
    });
});

module.exports = router;