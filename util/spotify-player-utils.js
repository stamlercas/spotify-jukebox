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
    getSpotifyPlayer: (req, playerId) => req.app.get('spotifyPlayerMap').get(playerId)
}