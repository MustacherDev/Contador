class Random {
    constructor(seed = Date.now()) {
        this.seed = this.hashSeed(seed);
    }

    hashSeed(seed) {
        if (typeof seed === "number") {
            return seed >>> 0;
        }

        let h = 2166136261;

        for (let i = 0; i < seed.length; i++) {
            h ^= seed.charCodeAt(i);
            h = Math.imul(h, 16777619);
        }

        return h >>> 0;
    }

    next() {
        let t = this.seed += 0x6D2B79F5;

        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);

        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }

    int(min, max) {
        return Math.floor(this.next() * (max - min + 1)) + min;
    }

    float(min, max) {
        return this.next() * (max - min) + min;
    }

    bool() {
        return this.next() < 0.5;
    }

    pick(array) {
        return array[this.int(0, array.length - 1)];
    }
}