// MATH MANIPULATION
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




// RANDOM GENERATOR FUNCTIONS
/**
 * @param {integer} min Minimum
 * @param {integer} max Maximum
 * @returns {integer} A random integer between min and max (inclusive of min, exclusive of max)
 */
function randInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

/**
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

// RANDOM UTILS
function chance(val) {
    return (Math.random() < val);
}

function choose(options) {
    var ind = randInt(0, options.length);
    return options[ind];
}



// DISTANCE FUNCTIONS
function distance(dx, dy) {
    return Math.sqrt((dx * dx) + (dy * dy));
}

function sqrDist(dx, dy) {
    return (dx * dx) + (dy * dy);
}

function manhattanDist(dx, dy) {
    return Math.abs(dx) + Math.abs(dy);
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


function molder(val, valMin, valMax, outMin, outMax){
    var perc = (val-valMin)/(valMax-valMin);
    return outMin + (outMax-outMin)*perc;
}




const Easing = {
    linear: t => t,

    inQuad: t => t * t,
    outQuad: t => t * (2 - t),
    inOutQuad: t => t < 0.5
        ? 2 * t * t
        : 1 - Math.pow(-2 * t + 2, 2) / 2,

    inCubic: t => t * t * t,
    outCubic: t => 1 - Math.pow(1 - t, 3),
    inOutCubic: t => t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2
};






// COLLISION DETECTION FUNCTIONS
class Area{
    static pointInside(px, py, areaX, areaY, areaWid, areaHei){
        if(px < areaX || px >= areaX + areaWid) return false;
        if(py < areaY || py >= areaY + areaHei) return false;
        return true;
    }

    static rectCollision(x1, y1, wid1, hei1, x2, y2, wid2, hei2) {
        if (!(x2 + wid2 - x1 > 0 && x1 + wid1 - x2 > 0)) return false;
        if (!(y2 + hei2 - y1 > 0 && y1 + hei1 - y2 > 0)) return false;
        return true;
    }
}



// ANGLE FUNCTIONS
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

function phaseAngleToSide(angle) {
    // Normalize the angle to the range [0, 2*Pi]
    angle = angle % (2 * Math.PI);
    if (angle < 0) {
        angle += 2 * Math.PI;
    }

    return (angle > Math.PI / 2 && angle <= 3 * Math.PI / 2) ? false : true;
}



// INDEXING FUNCTIONS
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















