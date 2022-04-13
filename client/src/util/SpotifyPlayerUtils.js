/**
 * Will return a json response for calls made to server
 */
 function SpotifyPlayerUtils() {}

/**
 * Returns player id for backend to identify correct spotify instance.
 * @param {*} obj 
 * @returns 
 */
SpotifyPlayerUtils.prototype.getPlayerId = () => window.location.hash.substring(1, window.location.hash.length);

module.exports = new SpotifyPlayerUtils();