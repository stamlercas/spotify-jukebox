/**
 * Util for url locations
 */
function LocationUtils() {
    this.BASENAME = 'app';
}

/**
 * Returns whether location is on landing page
 * @returns 
 */
LocationUtils.prototype.isOnHomePage = function() {
    return window.location.pathname === `/${this.BASENAME}/` || window.location.pathname === `/${this.BASENAME}`;
};

module.exports = new LocationUtils();