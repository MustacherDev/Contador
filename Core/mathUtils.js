
class Vector {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    // ===== Static =====

    static fromAngle(angle, magnitude = 1) {
        return new Vector(
            Math.cos(angle) * magnitude,
            Math.sin(angle) * magnitude
        );
    }

    static zero() {
        return new Vector(0, 0);
    }

    // ===== Setters =====

    set(x, y) {
        this.x = x;
        this.y = y;
        return this;
    }

    setVec(vec) {
        this.x = vec.x;
        this.y = vec.y;
        return this;
    }

    clone() {
        return new Vector(this.x, this.y);
    }

    // ===== Immutable Operations =====

    add(vec) {
        return new Vector(
            this.x + vec.x,
            this.y + vec.y
        );
    }

    sub(vec) {
        return new Vector(
            this.x - vec.x,
            this.y - vec.y
        );
    }

    mult(value) {
        return new Vector(
            this.x * value,
            this.y * value
        );
    }

    div(value) {
        return new Vector(
            this.x / value,
            this.y / value
        );
    }

    normalized() {
        const mag = this.mag();

        if (mag === 0) {
            return new Vector(0, 0);
        }

        return new Vector(
            this.x / mag,
            this.y / mag
        );
    }

    normal() {
        return new Vector(
            -this.y,
            this.x
        );
    }

    rotated(angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);

        return new Vector(
            this.x * cos - this.y * sin,
            this.x * sin + this.y * cos
        );
    }

    lerp(vec, t) {
        return new Vector(
            this.x + (vec.x - this.x) * t,
            this.y + (vec.y - this.y) * t
        );
    }

    // ===== Mutable Operations =====

    addSelf(vec) {
        this.x += vec.x;
        this.y += vec.y;
        return this;
    }

    subSelf(vec) {
        this.x -= vec.x;
        this.y -= vec.y;
        return this;
    }

    multSelf(value) {
        this.x *= value;
        this.y *= value;
        return this;
    }

    divSelf(value) {
        this.x /= value;
        this.y /= value;
        return this;
    }

    normalize() {
        const mag = this.mag();

        if (mag !== 0) {
            this.x /= mag;
            this.y /= mag;
        }

        return this;
    }

    rotate(angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);

        const x = this.x * cos - this.y * sin;
        const y = this.x * sin + this.y * cos;

        this.x = x;
        this.y = y;

        return this;
    }

    setAngle(angle) {
        const magnitude = this.mag();

        this.x = Math.cos(angle) * magnitude;
        this.y = Math.sin(angle) * magnitude;

        return this;
    }

    // ===== Magnitudes =====

    magSq() {
        return this.x * this.x + this.y * this.y;
    }

    mag() {
        return Math.sqrt(this.magSq());
    }

    // ===== Distances =====

    distanceSqTo(vec) {
        const dx = this.x - vec.x;
        const dy = this.y - vec.y;

        return dx * dx + dy * dy;
    }

    distanceTo(vec) {
        return Math.sqrt(this.distanceSqTo(vec));
    }

    // ===== Products =====

    dot(vec) {
        return this.x * vec.x + this.y * vec.y;
    }

    cross(vec) {
        return this.x * vec.y - this.y * vec.x;
    }

    // ===== Angles =====

    angle() {
        return Math.atan2(this.y, this.x);
    }

    angleTo(vec) {
        return Math.atan2(
            vec.y - this.y,
            vec.x - this.x
        );
    }

    // ===== Utility =====

    equals(vec) {
        return this.x === vec.x && this.y === vec.y;
    }

    isZero() {
        return this.x === 0 && this.y === 0;
    }

    toString() {
        return `Vector(${this.x}, ${this.y})`;
    }
}


// Helper Functions
function clamp(val, min, max) {
    if (val < min) return min;
    else if (val > max) return max;
    return val;
}

function sign(val) {
    if (val > 0) return 1;
    else if (val < 0) return -1;
    return 0;
}

function mod(value, modulator) {
    if (value > 0) return value % modulator;
    return (modulator + ((value) % modulator)) % modulator;
}

function wrap2d(x, y, wid, hei){
    var xx = mod(x, wid);
    var yy = mod(y, hei);
    return {x:xx, y:yy};
}




/**
 * 
 * @param {integer} min Minimum
 * @param {integer} max Maximum
 * @returns {integer} A random integer between min and max (inclusive of min, exclusive of max)
 */
function randInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

/**
 * 
 * @param {number} min Minimum
 * @param {number} max Maximum
 * @returns {number} A random number between min and max
 */
function randRange(min, max) {
    return (Math.random() * (max - min)) + min;
}

/**
 * 
 * @param {number} amp Amplitude
 * @returns {number} A random number between -amp and amp
 */
function randAmp(amp) {
    return randRange(-amp, amp);
}

function distance(dx, dy) {
    return Math.sqrt((dx * dx) + (dy * dy));
}

function sqrDist(dx, dy) {
    return (dx * dx) + (dy * dy);
}

function manhattanDist(dx, dy) {
    return Math.abs(dx) + Math.abs(dy);
}

function chance(val) {
    return (Math.random() < val);
}

function choose(options) {
    var ind = randInt(0, options.length);
    return options[ind];
}



// TWEENS AND EASINGS
function tweenIn(percentage) {
    return percentage * percentage;
}

function tweenOut(percentage) {
    return 1 - (1 - percentage) * (1 - percentage);
}

function tweenInOut(percentage) {
    return -(Math.cos(Math.PI * percentage) - 1) / 2;
}

function easeOutBack(percentage) {
    var c1 = 1.70158;
    var c3 = c1 + 1;

    return 1 + c3 * Math.pow(percentage - 1, 3) + c1 * Math.pow(percentage - 1, 2);
}

function zigzag(percentage) {
    return (1 - Math.abs(percentage * 2 - 1));
}

function risefall(percentage, peakFraction) {
    return Math.min(percentage * (1 / peakFraction), 1) - Math.max((percentage - peakFraction) * (1 / (1 - peakFraction)), 0);
}

function risefallExt(percentage, peakFraction, startVal, peakVal, endVal) {
    if(percentage < peakFraction){
        return startVal + (peakVal-startVal)*(percentage/peakFraction);
    } else {
        return peakVal + (endVal-peakVal)*((percentage-peakFraction)/(1-peakFraction));
    }
}

function loop(percentage, loopCount) {
    return (percentage * loopCount) % 1;
}

function zloop(percentage, loopCount) {
    return zigzag(loop(percentage, loopCount));
}



function findHorizontalNeighbour(grid, x, y, dir) {
    const width = grid[0].length;

    for (var i = 1; i <= width; i++) {
        var xx = (x + dir * i + width) % width;

        if (grid[y][xx] != -1)
            return grid[y][xx];
    }

    return -1;
}

function findVerticalNeighbour(grid, x, y, dir) {
    var yy = y + dir;

    if (yy < 0 || yy >= grid.length)
        return -1;

    var width = grid[0].length;

    for (var d = 0; d < width; d++) {

        var left = x - d;
        if (left >= 0 && grid[yy][left] != -1)
            return grid[yy][left];

        if (d == 0)
            continue;

        var right = x + d;
        if (right < width && grid[yy][right] != -1)
            return grid[yy][right];
    }

    return -1;
}





/**
 * 
 * @param {number} start 
 * @param {number} end 
 * @param {number} percentage 
 * @returns {number} A number between start and end based on the percentage (0 = start, 1 = end)
 */
function lerp(start, end, percentage) {
    return start + (end - start) * percentage;
}

/** 
* It's a floor function, but you can keep some of the fraction
* Math.floor(Arg1 / Arg2)*Arg2;

* @param {number} number Number to be floored
* @param {number} factor Factor to mantain
* @returns {number} The floored number
* @
* Ex.: floorSnap(4.75, 0.1) = 4.7
* Ex.: floorSnap(3.62, 0.5) = 3.5
* Ex.: floorSnap(25  ,  10) = 20
*/
function floorSnap(number, factor) {
    return Math.floor(number / factor) * factor;
}


function pointInRect(x, y, x1, y1, x2, y2) {
    if (x > x1 && x < x2 && y > y1 && y < y2) {
        return true;
    }
    return false;
}

function rectCollision(x1, y1, wid1, hei1, x2, y2, wid2, hei2) {
    if (!(x2 + wid2 - x1 > 0 && x1 + wid1 - x2 > 0)) {
        return 0;
    }

    if (!(y2 + hei2 - y1 > 0 && y1 + hei1 - y2 > 0)) {
        return 0;
    }

    return 1;
}

// Convert radians to degrees
function rad2deg(radians) {
    return radians * (180 / Math.PI);
}

// Convert degrees to radians
function deg2rad(degrees) {
    return degrees * (Math.PI / 180);
}

function normalizeAngle(ang) {
    // Handle zero or negative angles
    var angle = ang;
    angle = angle % (2 * Math.PI); // Wrap to 0 to 2*PI range
    if (angle < 0) {
        angle += Math.PI * 2;
    }
    return angle;
}

function rotatePoint(x, y, ang) {
    const cosTheta = Math.cos(ang);
    const sinTheta = Math.sin(ang);
    var xRot = x * cosTheta - y * sinTheta;
    var yRot = x * sinTheta + y * cosTheta;
    return new Vector(xRot, yRot);
}

function transformPoint(x, y, ctx) {
    const matrix = ctx.getTransform(); // Get the current transformation matrix
    const a = matrix.a;
    const b = matrix.b;
    const c = matrix.c;
    const d = matrix.d;
    const e = matrix.e;
    const f = matrix.f;

    const xPrime = a * x + c * y + e;
    const yPrime = b * x + d * y + f;

    return new Vector(xPrime - camX, yPrime - camY);
}








function phaseAngleToSide(angle) {
    // Normalize the angle to the range [0, 2*Pi]
    angle = angle % (2 * Math.PI);
    if (angle < 0) {
        angle += 2 * Math.PI;
    }

    return (angle > Math.PI / 2 && angle <= 3 * Math.PI / 2) ? false : true;
}



function smartIndex(index, limit, extra = 0) {

    var ind = index;

    if (ind < 0) {
        ind = (-ind) % (limit + 1);
        ind = (limit) - ind;
    } else if (ind >= limit) {
        ind = ind % (limit + extra);
    }
    return ind;
}
