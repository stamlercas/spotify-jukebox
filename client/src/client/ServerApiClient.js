/**
 * Will return a json response for calls made to server
 */
function ServerApiClient() {}

/**
 * Get current playing track.
 * Will return empty body with response code 204 if nothing is currently playing.
 */
ServerApiClient.prototype.getNowPlaying = () => fetchData("/api/nowplaying");

/**
 * Get available devices.
 */
ServerApiClient.prototype.getAvailableDevices = () => fetchData('/api/devices');

/**
 * Get artist from id.
 * @param {string} id 
 */
ServerApiClient.prototype.getArtist = (id) => fetchData('/api/artist/' + id);

/**
 * Get album from id.
 * @param {string} id 
 */
ServerApiClient.prototype.getAlbum = (id) => fetchData('/api/album/' + id);

/**
 * Search for artists and tracks using the given query.
 * @param {string} query 
 */
ServerApiClient.prototype.search = (query) => fetchData("/api/search/?q=" + query);

/**
 * Add track to queue using uri.
 * @param {string} uri 
 */
ServerApiClient.prototype.addToQueue = (uri) =>
    fetchData('/api/queue', 'POST', {
        uri: uri
    });

/**
 * Set device to be played from.
 * @param {string} deviceId 
 */
ServerApiClient.prototype.setAvailableDevice = (deviceId) =>
    fetchData('/api/devices', 'POST', {
        deviceId: deviceId
    });

/**
 * Intended to intercept the response of an api call to look for a redirect url. If 
 * a redirect url is found, then we want to redirect the window to the given url. This
 * is useful when the access token on the server has either not been generated or has expired.
 * @param {string} url 
 */
var fetchData = function(url, method = 'GET', body = {}) {
    return composeFetch(url, method, body).then(res => {
        if (res.status == 204) {
            return Promise.resolve('No content returned.');
        }
        return res.json();
    })
    .then(res => {
        if (res.hasOwnProperty('redirectUrl')) {
            window.location.href = res.redirectUrl;
            throw new Error(res.message);
        }
        return res;
    });
}

var composeFetch = function(url, method, body) {
    if (method === 'GET') {
        return fetch(url);
    } else {
        return fetch(url, 
            { 
                method: method,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });
    }
}


module.exports = new ServerApiClient();