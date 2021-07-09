/**
 * Will return a json response for calls made to server
 */
 function ColorUtils() {}

/**
 * Use a list of swatches and sort them by most contrast
 * @param {Swatch} swatch swatch to compare against other swatches
 * @param {*} swatches list of swatches
 * @returns 
 */
ColorUtils.prototype.getSwatchWithMostContrast = (swatch, swatches) => {
    let maxContrastSwatch;      // contains swatch with highest ratio
    let maxContrastSwatchRatio = 0; // contains actual ratio value for swatch
    swatches.forEach(s => {
        let ratio = calculateContrast(s, swatch);
        if (ratio > maxContrastSwatchRatio) {
            maxContrastSwatch = s;
            maxContrastSwatchRatio = ratio;
        }
    });
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
    return (r * 0.2126 + g * 0.7152 + b * 0.0722);
}

/**
 * Calculate luminence for each r, g, b value
 * @param {*} value 
 * @returns 
 */
var calculateLuminance = function(value) {
    return (value <= 0.03928) ? value / 12.92 : Math.pow(((value + 0.055) / 1.055), 2.4);
}

module.exports = new ColorUtils();