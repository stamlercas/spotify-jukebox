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

/**
 * Join list of artists
 * @param {*} artists 
 * @returns 
 */
SpotifyPlayerUtils.prototype.getArtists = (artists) => artists.map(artist => artist.name).join(", ");

module.exports = new SpotifyPlayerUtils();