/**
 * Simple control of starting & stopping animation rendering.
 * 
 * We can manually build up animations with by calling {@link requestAnimationFrame}, 
 * but we must take care around exactly when we request new frames to avoid spamming requests.
 * This class handles that and is soley responsible for requesting new frames.
 * 
 * The "draw" callback receives an extra first parameter over {@link requestAnimationFrame}, which is this controller.
 * If desired the callback can use this to stop the animation itself, based on some criterion.
 */
export class AnimationController {
    request_id: number | undefined = undefined;
    last_time: number = 0;
    zero_time: number = 0;
    frame_elapsed_sec: number = 0;

    /** Reset the zero time to be now. */
    rezero() {
        this.zero_time = performance.now();
        this.last_time = this.zero_time;
    }

    get total_elapsed_sec(): number {
        return (this.last_time - this.zero_time) / 1000.0;
    }

    /**
     * Start animating with the given draw callback function.
     * 
     * Note: Calling start, with two different callbacks, without first calling stop, 
     *       will result in only the first being called.
     * 
     * Note: Idempotent.
     */
    start(draw: (anim: AnimationController) => void) {
        if (!this.request_id) {
            this.request_id = requestAnimationFrame(this.callback(draw));
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
    callback(draw: (anim: AnimationController) => void) {
        return (last_time: number) => {
            if ((last_time == this.last_time) || !this.request_id) {
                return;
            }

            this.frame_elapsed_sec = (last_time - this.last_time) / 1000.0;
            this.last_time = last_time;
            draw(this);
            if (this.request_id) {
                this.request_id = requestAnimationFrame(this.callback(draw))
            } else {
                // The last request was cancelled during draw(...), so we don't schedule another. 
                // Pass!
            }
        };
    }
}