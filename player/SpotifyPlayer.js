/**
 * Keeps track of spotify related stuff
 */
var SpotifyWebApi = require('spotify-web-api-node');

var SpotifyPlayer = function() {
    init(this);
}

SpotifyPlayer.prototype = {
    getSpotifyApi: function() {
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

    reset: function () {
        init(this);
    }
};

var init = function(self) {
    self._isFirstSongQueued = true;
    self._deviceId = null;
    self._spotifyApi = new SpotifyWebApi({
        clientId: 'd143076b396b41d5a9b0b8cc10f7ea7c',
        clientSecret: 'bc3f6d91473f46ada5d6749d3be495a3',
        redirectUri: ''
    });
    self._scopes = [
        'user-modify-playback-state',
        'user-read-playback-state'
    ];
}

// should check to see if this actually works
SpotifyPlayer._addMethods = function(methods) {
    for (var i in methods) {
        if (methods.hasOwnProperty(i)) {
        this.prototype[i] = methods[i];
        }
    }
};

module.exports = SpotifyPlayer