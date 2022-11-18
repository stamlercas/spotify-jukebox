/**
 * Util functions for spotify player.
 */

module.exports = {
    getScopes: () => [
        'user-modify-playback-state',
        'user-read-playback-state'
    ],
    generateRedirectUri: req => req.protocol + '://' + req.get('host') + '/api/setAccessToken',
    TIME_TO_LIVE: 1000 * 60 * 60 * 6
}