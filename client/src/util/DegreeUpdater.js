import { properties } from '../properties.js';

/**
 * Tracks a degree on a interval to create a swaying effect.
 */
export class DegreeUpdater {
    constructor() {
        this._degree = properties.degreeUpdater.degree;
        this._maxDegree = properties.degreeUpdater.maxDegree;
        this._minDegree = properties.degreeUpdater.minDegree;
        this._direction = properties.degreeUpdater.direction;
        this._increment = properties.degreeUpdater.increment;
        this._degreeUpdater = setInterval(() => {
            this._degree += (this._increment * this._direction);
            if (this._direction == 1 && this._degree >= 360) {
                this._degree = 0;
            } else if (this._direction == -1 && this._degree == 0) {
                this._degree = 360;
            }
            // if we have reached the max, switch directions
            if (this._degree == this._maxDegree || this._degree == this._minDegree) {
                this._direction *= -1;
            }
        }, 750);
    }

    stop() {
        clearInterval(this._degreeUpdater);
    }

    getDegree() {
        return this._degree;
    }
}

export default DegreeUpdater;