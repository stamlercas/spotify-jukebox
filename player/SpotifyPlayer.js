/**
 * Keeps track of spotify related stuff
 */
var SpotifyWebApi = require('spotify-web-api-node');

var SpotifyPlayer = function() {
    init(this);
}

SpotifyPlayer.prototype = {
    getSpotifyApi: function() {
        this._expiration = Date.now() + TIME_TO_LIVE;   // every time api is accessed, set expiration to 6 hours from now
        return this._spotifyApi;
    },

    getScopes: function() {
        return this._scopes;
    },

    getIsFirstSongQueued: function() {
        return this._isFirstSongQueued;
    },

    setIsFirstSongQueued: function(isFirstSongQueued) {
        this._isFirstSongQueued = isFirstSongQueued;
    },

    getDeviceId: function() {
        return this._deviceId;
    },

    setDeviceId: function(deviceId) {
        this._deviceId = deviceId;
    },

    /**
     * Return whether or not the expiration has passed (meaning the api hasn't been accessed in a substantial amount of time).
     * @returns boolean
     */
    isExpired: function() {
        return Date.now() > this._expiration;
    },

    reset: function () {
        init(this);
    }
};

var init = function(self) {
    self._isFirstSongQueued = true;
    self._deviceId = null;
    self._spotifyApi = new SpotifyWebApi({
        clientId: process.env.SPOTIFY_CLIENT_ID,
        clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
        redirectUri: ''
    });
    self._scopes = [
        'user-modify-playback-state',
        'user-read-playback-state'
    ];
    self._expiration = Date.now() + TIME_TO_LIVE;
}

// TODO: move to properties file
const TIME_TO_LIVE = (1000 * 60 * 60 * 6);

// should check to see if this actually works
SpotifyPlayer._addMethods = function(methods) {
    for (var i in methods) {
        if (methods.hasOwnProperty(i)) {
        this.prototype[i] = methods[i];
        }
    }
};

module.exports = SpotifyPlayer;