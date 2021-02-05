/**
 * File for utility methods that are designed to be consumed by components.
 */

/**
 * Intended to intercept the response of an api call to look for a redirect url. If 
 * a redirect url is found, then we want to redirect the window to the given url. This
 * is useful when the access token on the server has either not been generated or has expired.
 * @param {*} url 
 */
export function fetchSpotifyData(url, method = 'GET', body = {}) {
    return composeFetch(url, method, body).then(res => res.json()).then(res => {
        if (res.hasOwnProperty('redirectUrl')) {
            window.location.href = res.redirectUrl;
            throw new Error(res.message);
        }
        return res;
    });
}

function composeFetch(url, method, body) {
    if (method === 'GET') {
        return fetch(url);
    } else {
        console.log(url);
        console.log(JSON.stringify(body, null, 3));
        return fetch(url, 
            { 
                method: method, 
                body: JSON.stringify(body)
            });
    }
}

/**
 * Take a list of artists and return a comma separated string of the artist names
 * @param {Array} artists 
 */
export function formatArtists(artists) {
    return artists.map(artist => artist.name).join(", ")
}