/**
 * Simple control of starting & stopping animation rendering.
 * 
 * We can manually build up animations with by calling {@link requestAnimationFrame}, 
 * but we must take care around exactly when we request new frames to avoid spamming requests,
 * or performing superfluous work if the canvas is off-screen.
 * This class handles that; it is responsible for requesting new frames at the approriate times.
 * 
 * The "draw" callback receives an extra first parameter over {@link requestAnimationFrame}, which is this controller.
 * If desired the callback can use this to stop the animation itself, based on some criterion.
 * 
 * Note: Since this is requesting the animation it also clears the canvas before calling `draw`.
 */
export class AnimationController {
    ctx: CanvasRenderingContext2D;
    _draw: (anim: AnimationController) => void;

    request_id: number | undefined = undefined;
    last_time: number = 0;
    zero_time: number = 0;
    frame_elapsed_sec: number = 0;

    constructor(ctx: CanvasRenderingContext2D, draw: (anim: AnimationController) => void) {
        this.ctx = ctx;
        this._draw = draw;

        // Stop animating if we scroll the canvas offscreen.
        window.onscroll = (e) => {
            const above = this.ctx.canvas.scrollTop + this.ctx.canvas.height < window.scrollY;
            const below = this.ctx.canvas.scrollTop > window.scrollY + window.screenTop;
            if (above || below) {
                this.stop();
            } else {
                this.start();
            }
        };
    }

    /** Reset the zero time to be now. */
    rezero() {
        this.zero_time = performance.now();
        this.last_time = this.zero_time;
    }

    get total_elapsed_sec(): number {
        return (this.last_time - this.zero_time) / 1000.0;
    }

    /**
     * Start animating.
     * 
     * Note: Calling start, with two different callbacks, without first calling stop, 
     *       will result in only the first being called.
     * 
     * Note: Idempotent.
     */
    start() {
        if (!this.request_id) {
            this.request_id = requestAnimationFrame(this.make_callback());
        }
    }

    /**
     * Stop animating.
     * 
     * Note: Idempotent.
     */
    stop() {
        if (this.request_id) {
            cancelAnimationFrame(this.request_id);
            this.request_id = undefined;
        }
    }

    /** If somehow we end up with multiple callbacks, dedupe them. */
    make_callback() {
        return (last_time: number) => {
            // Already requested a frame, so do not request another.
            if (!this.request_id) {
                return;
            }

            this.frame_elapsed_sec = (last_time - this.last_time) / 1000.0;
            this.last_time = last_time;
            this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
            this._draw(this);
            if (this.request_id) {
                this.request_id = requestAnimationFrame(this.make_callback())
            } else {
                // The last request was cancelled during draw(...), so we don't schedule another. 
                // Pass!
            }
        };
    }
}


/**
 * Interface which all animation primatives use.
 * 
 * The idea is they are functions parameterized by "time", which can take values between zero and the `duration`.
 * This may or may not be actual time and you can combine the primatives to build more complex animations & rescale time appropriately.
 */
export interface Animation<T> {
    /**
     * The max value the time parameter.
     */
    duration: number;

    /**
     * The value associated with the specified time.
     * @param time 
     */
    valueAt(time: number): T;
}

/**
 * Always return the same animation.
 */
export class Constant<T> {
    value: T;

    constructor(value: T) {
        this.value = value;
    }

    duration: number = Number.POSITIVE_INFINITY;

    valueAt(time: number): T {
        return this.value;
    }
}

/**
 * Rescale the time range of the given animation.
 */
export class Rescale<T> {
    anim: Animation<T>;
    duration: number;

    constructor(anim: Animation<T>, duration: number) {
        this.anim = anim;
        this.duration = duration;
    }

    valueAt(time: number): T {
        return this.anim.valueAt((time / this.duration) * this.anim.duration);
    }
}

/**
 * Clip the time range of another animation to a sub-interval.
 */
export class Clip<T> {
    anim: Animation<T>;
    range: [number, number];
    duration: number;

    constructor(anim: Animation<T>, range: [number, number]) {
        this.anim = anim;
        this.range = range;
        this.duration = (range[1] - range[0]);
    }

    valueAt(time: number): T {
        time = Math.min(Math.max(time, this.range[0]), this.range[1]);
        return this.anim.valueAt(time);
    }
}

/**
 * Repeat the given animation infinitely.
 */
export class LoopInf<T> {
    anim: Animation<T>;
    duration: number = Number.POSITIVE_INFINITY;

    constructor(anim: Animation<T>) {
        this.anim = anim;
    }

    valueAt(time: number): T {
        time = (time % this.duration);
        return this.anim.valueAt(time);
    }
}

/**
 * Repeat the given animation N times.
 * 
 * After the Nth time returns the final state.
 */
export class LoopN<T> {
    anim: Animation<T>;
    count: number;
    duration: number;

    constructor(anim: Animation<T>, count: number) {
        this.anim = anim;
        this.count = count;
        this.duration = count * anim.duration;
    }

    valueAt(time: number): T {
        if (time >= this.duration) {
            time = this.anim.duration;
        } else {
            time = time % this.anim.duration;
        }
        return this.anim.valueAt(time);
    }
}

/**
 * Combine multiple animations together.
 */
export class Composite<T> {
    anims: Animation<T>[];
    starts: number[];

    duration: number;

    constructor(anims: Animation<T>[]) {
        this.anims = anims;

        this.duration = 0;
        this.starts = Array(anims.length);
        for (let i = 0; i < anims.length; i++) {
            this.starts[i] = this.duration;
            this.duration += anims[i].duration;
        }
    }

    valueAt(time: number): T {
        // Implicitly has time after all anims => last value;
        for (let i = this.anims.length - 1; i >= 0; i--) {
            if (this.starts[i] < time) {
                return this.anims[i].valueAt(time - this.starts[i]);
            }
        }
        // Time was not after any start => first value.
        return this.anims[0].valueAt(0);
    }
}

/**
 * Linearly move between two values over a duration of 1.
 */
export class Tween {
    duration: number = 1;
    value1: number;
    value2: number;

    constructor(value1: number, value2: number) {
        this.value1 = value1;
        this.value2 = value2;
    }

    valueAt(time: number) {
        return this.value1 * (1 - time) + this.value2 * time;
    }
}

/**
 * Apply easing to the time parameter at the start _and_ at the end.
 */
export class EaseInOut<T> {
    anim: Animation<T>;
    duration: number;

    constructor(anim: Animation<T>) {
        this.anim = anim;
        this.duration = anim.duration;
    }

    valueAt(time: number): T {
        time = time / this.anim.duration; // to frac
        time = (time < 0.5) ? 2 * time * time : 1 - 2 * (1 - time) * (1 - time);
        time = time * this.anim.duration; // to time
        return this.anim.valueAt(time);
    }
}