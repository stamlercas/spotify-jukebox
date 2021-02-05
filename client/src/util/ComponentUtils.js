/**
 * File for utility methods that are designed to be consumed by components.
 */


/**
 * Take a list of artists and return a comma separated string of the artist names
 * @param {Array} artists 
 */
export function formatArtists(artists) {
    return artists.map(artist => artist.name).join(", ")
}