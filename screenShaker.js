






class ScreenShaker {
    constructor(cameraReference) {
        this.camera = cameraReference; // Reference to your camera object (or a function to apply offsets)
        this.activeShakes = [];      // Stores all currently active shake effects
        this.currentOffsetX = 0;
        this.currentOffsetY = 0;
        this.currentOffsetAng = 0;
        this.time = 0;               // Internal timer for shake calculations
    }

    /**
     * Initiates a screen shake effect.
     * @param {number} amplitudeX - Maximum displacement in X.
     * @param {number} amplitudeY - Maximum displacement in Y.
     * @param {number} amplitudeAng - Maximum angular displacement (e.g., in degrees or radians).
     * @param {number} duration - Total duration of the shake in seconds.
     * @param {number} frequency - How often the shake oscillates per second (Hz). Higher frequency means more rapid changes.
     * @param {string} [ease='easeOutQuad'] - Easing function for the shake's amplitude decay. Options: 'linear', 'easeOutQuad', 'easeInQuad', 'easeInOutQuad', etc.
     * @param {number} [phaseOffset=0] - Initial phase offset for the sine wave (in radians).
     */
    shake(amplitudeX, amplitudeY, amplitudeAng, duration, frequency, ease = 'easeOutQuad', phaseOffset = 0) {
        var shakeId = Date.now() + Math.random();
        this.activeShakes.push({
            amplitudeX,
            amplitudeY,
            amplitudeAng,
            duration,
            frequency,
            ease,
            phaseOffset,
            life: duration,
            id: shakeId // Unique ID for this shake instance
        });
    }

    /**
     * Updates the shaker's internal state and calculates total offsets.
     * Call this once per game loop iteration (e.g., in your update function).
     * @param {number} deltaTime - Time elapsed since the last update (in seconds).
     */
    update(dt) {
        this.time += dt; // Advance internal time

        this.currentOffsetX = 0;
        this.currentOffsetY = 0;
        this.currentOffsetAng = 0;

        const newActiveShakes = [];

        for (let i = 0; i < this.activeShakes.length; i++) {
            const shake = this.activeShakes[i];
            shake.life -= dt;

            if (shake.life > 0) {
                // Calculate normalized time (0 to 1) for easing
                const t = 1-(shake.life / shake.duration);
                let easedAmplitude = 1;

                // Apply easing function to the amplitude decay
                switch (shake.ease) {
                    case 'linear':
                        easedAmplitude = 1 - t;
                        break;
                    case 'easeOutQuad':
                        easedAmplitude = 1 - (t * (2 - t));
                        break;
                    case 'easeInQuad':
                        easedAmplitude = t * t;
                        break;
                    case 'easeInOutQuad':
                        easedAmplitude = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
                        break;
                    // Add more easing functions as needed
                    default:
                        easedAmplitude = 1 - t; // Default to linear if unknown
                        break;
                }
                
                // Ensure amplitude smoothly goes to 0 at the end
                easedAmplitude = Math.max(0, easedAmplitude); 

                // Use a sine wave for oscillation
                // The phase is calculated based on frequency and current time, plus an initial offset
                const phase = (this.time * shake.frequency * Math.PI * 2) + shake.phaseOffset;

                this.currentOffsetX += shake.amplitudeX * easedAmplitude * Math.sin(phase);
                this.currentOffsetY += shake.amplitudeY * easedAmplitude * Math.sin(phase + Math.PI / 2); // Offset Y by 90 degrees for more natural movement
                this.currentOffsetAng += shake.amplitudeAng * easedAmplitude * Math.sin(phase + Math.PI / 4); // Offset Ang by 45 degrees

                newActiveShakes.push(shake); // Keep this shake as it's still active
            }
        }
        this.activeShakes = newActiveShakes; // Remove finished shakes


        if (this.camera) {
            this.camera.addPos(this.currentOffsetX, this.currentOffsetY);
            this.camera.addAng(this.currentOffsetAng);
        }
    }

    /**
     * Returns the current total offsets for the camera.
     * You would typically add these to your camera's base position.
     * @returns {{x: number, y: number, ang: number}}
     */
    getOffsets() {
        return {
            x: this.currentOffsetX,
            y: this.currentOffsetY,
            ang: this.currentOffsetAng
        };
    }

    /**
     * Stops all active shake effects immediately.
     */
    stopAllShakes() {
        this.activeShakes = [];
        this.currentOffsetX = 0;
        this.currentOffsetY = 0;
        this.currentOffsetAng = 0;
    }

    /**
     * Provides basic easing functions.
     * You can expand this or use a dedicated easing library.
     */
    static Easing = {
        linear: t => t,
        easeOutQuad: t => t * (2 - t),
        easeInQuad: t => t * t,
        easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
        // Add more easing functions as needed
    };
}


