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
