/**
 * Keeps track of spotify related stuff
 */

var SpotifyPlayer = function(spotifyRecord, spotifyApi) {
    this._spotifyRecord = spotifyRecord;
    this._spotifyApi = spotifyApi;
}

SpotifyPlayer.prototype = {
    getSpotifyRecord: function() { 
        return this._spotifyRecord;
    },
    getSpotifyApi: function() { 
        return this._spotifyApi; 
    }
};

// should check to see if this actually works
SpotifyPlayer._addMethods = function(methods) {
    for (var i in methods) {
        if (methods.hasOwnProperty(i)) {
        this.prototype[i] = methods[i];
        }
    }
};

module.exports = SpotifyPlayer;