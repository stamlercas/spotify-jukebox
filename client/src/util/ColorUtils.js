const { Swatch } = require("node-vibrant/lib/color");

/**
 * Will return a json response for calls made to server
 */
 function ColorUtils() {}

/**
 * Use a list of swatches and sort them by most contrast
 * @param {*} swatch swatch to compare against other swatches
 * @param {*} swatches list of swatches
 * @returns 
 */
ColorUtils.prototype.getMostContrast = (swatch, swatches) => {
    if (swatch.constructor === Array) { // can be list [r, g, b]
        swatch = new Swatch(swatch, 0);
    }

    let maxContrastSwatch;      // contains swatch with highest ratio
    let maxContrastSwatchRatio = 0; // contains actual ratio value for swatch
    swatches.forEach(s => {
        let ratio = calculateContrast(s, swatch);
        if (ratio > maxContrastSwatchRatio) {
            maxContrastSwatch = s;
            maxContrastSwatchRatio = ratio;
        }
    });
    // if contrast ratio is less than 4.5:1, pick either black or white depending on how bright the color is
    if (maxContrastSwatchRatio < 4.5) {
        maxContrastSwatch = calculateRelativeLuminance(maxContrastSwatch) > .5 ? blackSwatch : whiteSwatch;
    }
    return maxContrastSwatch;
};

/**
 * Calculate contrast ratio of two colors
 * @param {Swatch} swatch1 
 * @param {Swatch} swatch2 
 * @returns 
 */
var calculateContrast = function(swatch1, swatch2) {
    let l1 = calculateRelativeLuminance(swatch1.getRgb()[0], swatch1.getRgb()[1], swatch1.getRgb()[2]);
    let l2 = calculateRelativeLuminance(swatch2.getRgb()[0], swatch2.getRgb()[1], swatch2.getRgb()[2]);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
};

/**
 * Calculate relative luminence for each color
 * @param {*} r 
 * @param {*} g 
 * @param {*} b 
 * @returns 
 */
var calculateRelativeLuminance = function(r, g, b) {
    return (calculateLuminance(r) * 0.2126 + calculateLuminance(g) * 0.7152 + calculateLuminance(b) * 0.0722);
}

/**
 * Calculate luminence for each r, g, b value
 * @param {*} value 
 * @returns 
 */
var calculateLuminance = function(value) {
    value /= 255;
    return (value <= 0.03928) ? value / 12.92 : Math.pow(((value + 0.055) / 1.055), 2.4);
}

var whiteSwatch = new Swatch([255, 255, 255], 0);
var blackSwatch = new Swatch([0, 0, 0], 0);

module.exports = new ColorUtils();