/**
 * Util functions for spotify player.
 */

module.exports = {
    /**
     * get spotify player instance from map in app
     * @param {*} req 
     * @param {*} playerId 
     * @returns SpotifyPlayer from map stored in app
     */
    getSpotifyPlayer: (req, playerId) => req.app.get('spotifyPlayerMap').get(playerId !== undefined ? playerId: req.headers['player-id']),
    getScopes: () => [
        'user-modify-playback-state',
        'user-read-playback-state'
    ],
    generateRedirectUri: req => req.protocol + '://' + req.get('host') + '/api/setAccessToken',
    TIME_TO_LIVE: 1000 * 60 * 60 * 6
}