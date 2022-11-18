const playerDao = require('../db/player-instances-dao');
const WordUtils = require('../util/word-utils.js');
var spotifyPlayerUtils = require('../util/spotify-player-utils.js');

var SpotifyWebApi = require('spotify-web-api-node');

/**
 * Layer responsible for talking to db and api
 */
class SpotifyManager {
    constructor(spotifyRecord, spotifyApi) {
        this._spotifyRecord = spotifyRecord;
        this._spotifyApi = spotifyApi;
    }

    setAuthorizationTokens(playerId, accessToken, refreshToken) {
        return playerDao.update(playerId, {accessToken: accessToken, refreshToken: refreshToken})
    }

    search(query) {
        let response = {};
        return this._spotifyApi.searchArtists(query, {limit: 5})
            .then(result => response.artists = result.body.artists)
            .then(() => this._spotifyApi.searchTracks(query, {limit: 10}))
            .then(result => response.tracks = result.body.tracks)
            .then(() => this._spotifyApi.searchAlbums(query,{limit: 5}))
            .then(result => response.albums = result.body.albums)
            .then(() => response);
    }

    /**
     * Retrieve artist info
     * @param {} id
     */
    getArtist(id) {
        let response = {};
        return this._spotifyApi.getArtist(id)
            .then(result => response.artist = result.body)
            .then(() => this._spotifyApi.getArtistTopTracks(id, 'US'))
            .then(result => response.top_tracks = result.body.tracks)
            .then(() => this._spotifyApi.getArtistAlbums(id, {market: 'US', limit: 50, include_groups: "album,single,compilation"}))  // 50 is max limit
            .then(result => response.albums = result.body)
            .then(() => response);
    }

    getAlbum(id) {
        return this._spotifyApi.getAlbum(id);
    }

    getSpotifyRecord() {
        return this._spotifyRecord;
    }
    
    addToQueue(userId, uri) {
        this._spotifyApi.addToQueue(uri).then(result => {
            if (this._spotifyRecord.tracks.length == 0) { // do some more setup, skip to next (which is the one just queued) and play from selected available device
                this._spotifyApi.skipToNext(); // this should automatically start playing
            }
            // add track to collection
            this._spotifyApi.getTrack(uri.split(":")[2]).then(result => playerDao.addTrack(this._spotifyRecord.playerId, userId, result.body));
        });
    }

    addUser(userId) {
        playerDao.addUser(this._spotifyRecord.playerId, userId);
    }

    getMyCurrentPlayingTrack() {
        return this._spotifyApi.getMyCurrentPlayingTrack();
    }

    getDevices() {
        return this._spotifyApi.getMyDevices().then(result => (result.body.devices));
    }

    setPlaybackDevice() {
        return this._spotifyApi.transferMyPlayback([deviceId]);
    }

    getAudioAnalysisForTrack(track) {
        return this._spotifyApi.getAudioAnalysisForTrack(track).then(result => result.body);
    }

    getAudioFeaturesForTrack(track) {
        return this._spotifyApi.getAudioFeaturesForTrack(track).then(result => result.body);
    }

    authorizationCodeGrant(code, redirectUri) {
        this._spotifyApi.setRedirectURI(redirectUri);  // need to set redirect uri, before authorization
        return this._spotifyApi.authorizationCodeGrant(code).then(data => {
            // Set the access token on the API object to use it in later calls
            playerDao.update(this._spotifyRecord.playerId, {accessToken: data.body.access_token, refreshToken: data.body.refresh_token})
            rebuild(this);
            // response does not depend on the next calls so can call them while response is redirected
            this._spotifyApi.pause().catch(error => console.log(error));
            return data;
        })
    }

    refreshAccessToken() {
        return this._spotifyApi.refreshAccessToken().then(data => {
            console.log(`The access token has been refreshed for ${this.getPlayerId()}!`);
            // Save the access token
            playerDao.update(this._spotifyRecord.playerId, {accessToken: data.body.access_token}).then(() => rebuild(this));
        });
    }

    delete() {
        console.log(`Spotify instance ${this.getPlayerId()} has expired...`);
        playerDao.delete(this.getPlayerId());
    }

    /**
     * Return whether or not the expiration has passed (meaning the api hasn't been accessed in a substantial amount of time).
     * @returns boolean
     */
    isExpired() {
        return Date.now() > this._spotifyRecord.expiration;
    }

    getPlayerId() {
        return this._spotifyRecord.playerId;
    }

    getAccessToken() {
        return this._spotifyRecord.accessToken;
    }

    setRedirectURI(uri) {
        this._spotifyApi.setRedirectURI(uri);
    }

    createAuthorizeURL() {
        return this._spotifyApi.createAuthorizeURL(spotifyPlayerUtils.getScopes(), this.getPlayerId());
    }

}

/**
 * Factory methods for building instance
 */
module.exports = {
    createNewSpotifyPlayer: function (creatorId) {
        let playerId = WordUtils.generateRandomWords(3);
        playerDao.insert(playerId, creatorId);

        console.log(`New spotify instance created: ${playerId}`);
        return playerId;
    },
    getSpotifyPlayer: (playerId) => {
        return playerDao.find(playerId).then(spotifyRecord => {
            if (!spotifyRecord) {
                return null;
            }
            return init(spotifyRecord);
        });
    },
    getAllSpotifyPlayers: () => playerDao.findAll().map(record => init(record)).toArray()
};

function init(spotifyRecord) {
    return new SpotifyManager(spotifyRecord, buildSpotifyWebApi(spotifyRecord));
}

function buildSpotifyWebApi(spotifyRecord) {
    return new SpotifyWebApi({
        clientId: process.env.SPOTIFY_CLIENT_ID,
        clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
        accessToken: spotifyRecord.accessToken,
        refreshToken: spotifyRecord.refreshToken,
        redirectUri: ''
    });
}

/**
 * Set new data members
 */
function rebuild(self) {
    self._spotifyApi = playerDao.find(self.getPlayerId()).then(spotifyRecord => self._spotifyApi = buildSpotifyWebApi(spotifyRecord));
}