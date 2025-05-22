import { style_default } from "../styles.js";
import { deg_to_rad } from "../utils.js";
import { in_rect, Rectangle } from "./shapes.js";
import { div, mul, sub, vec2, Vect2D } from "./vector.js";

/**
 * Convert our data space into canvas locations.
 */
export class ViewPort2D {
    ctx: CanvasRenderingContext2D;

    /** Coordinates spanned in data-space units. */
    data: Rectangle;

    /** Coordinates spanned in canvas units. */
    canvas: Rectangle;

    constructor(
        ctx: CanvasRenderingContext2D,
        data: Rectangle,
        canvas: Rectangle | null = null,
    ) {
        this.ctx = ctx;
        this.data = data;

        if (canvas != null) {
            this.canvas = canvas;
        } else {
            this.canvas = new Rectangle(
                vec2(0, 0),
                vec2(ctx.canvas.width, ctx.canvas.height),
            );
        }

        // Flip the y-coordinate already.
        // Careful: this also means the lower/upper interchange for the y-coordinate.
        this.canvas = new Rectangle(
            vec2(this.canvas.lower.x, this._flip_y(this.canvas.upper.y)),
            vec2(this.canvas.upper.x, this._flip_y(this.canvas.lower.y)),
        );
    }

    /** The canvas has its origin at the top-left. */
    _flip_y = (y: number) => {
        // Important: full canvas height, not viewport.
        return this.ctx.canvas.height - y;
    }

    /**
     * Convert a location in data-space units to a location on the canvas.
     * 
     * @param point In data units.
     * @returns In canvas units.
     */
    data_to_canvas(point: Vect2D): Vect2D {
        let frac = div(sub(point, this.data.lower), this.data.size);
        let pixels = frac
            .map_y((y) => 1 - y)
            .map((f) => mul(f, this.canvas.size))
            .plus(this.canvas.lower);
        ;
        return pixels;
    }

    /**
     * Convert a distance in data-space units to a distance in the canvas's units.
     * 
     * Note: Assumes the canvas's aspect ratio matches the viewport's.
     * 
     * @param dist In data units.
     * @returns In canvas units.
     */
    data_to_canvas_dist(dist: number): number {
        const frac = dist / this.data.width;
        const size = this.canvas.width;
        const pixels = frac * size;
        return pixels;
    }

    /**
     * Convert a location in canvas units to a location in our data-space units.
     * 
     * @param pixels In canvas units.
     * @returns In data units.
     */
    canvas_to_data(pixels: Vect2D): Vect2D {
        pixels = pixels.minus(this.canvas.lower);
        const frac = div(pixels, this.canvas.size).map_y((y) => 1 - y);
        const point = mul(frac, this.data.size).plus(this.data.lower);
        return point;
    }

    /**
     * Carry out the plotting in the passed function, but clip to the region of this view port.
     * 
     * @param context The plotting function.
     */
    with_clip(context: () => void) {
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.rect(this.canvas.lower.x, this.canvas.lower.y, this.canvas.width, this.canvas.height);
        this.ctx.clip();

        context();

        style_default(this.ctx);
        this.ctx.restore();
    }

    /**
     * Convenience funciton which moves to the given point in data units.
     * 
     * @param p A vector in data-space units.
     */
    moveTo(p: Vect2D) {
        p = this.data_to_canvas(p);
        this.ctx.moveTo(p.x, p.y);
    }

    /**
     * Convenience funciton which draws a line to the given point in data units.
     * 
     * @param p A vector in data-space units.
     */
    lineTo(p: Vect2D) {
        p = this.data_to_canvas(p);
        this.ctx.lineTo(p.x, p.y);
    }

    /**
     * Like {@link CanvasRenderingContext2D.arc} but takes data-space units and degrees.
     * 
     * @param p The center, in data-space units.
     * @param radius The radius, in data-space units.
     * @param angles The start & end angles. Anticlockwise from the x-axis, in degrees.
     */
    arc(p: Vect2D, radius: number, angles: [number, number], anticlockwise: boolean = true) {
        p = this.data_to_canvas(p);
        radius = this.data_to_canvas_dist(radius);
        angles = [deg_to_rad(-angles[0]), deg_to_rad(-angles[1])]
        this.ctx.arc(p.x, p.y, radius, angles[0], angles[1], anticlockwise)
    }

    /**
     * Like {@link CanvasRenderingContext2D.arcTo} but takes data-space units.
     * 
     * @param p1 Control point 1, in data units.
     * @param p2 Control point 2, in data units.
     * @param radius Arc radius, in data units.
     */
    arcTo(p1: Vect2D, p2: Vect2D, radius: number) {
        p1 = this.data_to_canvas(p1);
        p2 = this.data_to_canvas(p2);
        radius = this.data_to_canvas_dist(radius);
        this.ctx.arcTo(p1.x, p1.y, p2.x, p2.y, radius);
    }
}


/**
 * Stores information if something is being hovered or dragged.
 * 
 * The state of instances of this class is updated by the relevant {@link Interactive}.
 */
export class Draggable {

    /** 
     * The mouse was clicked while the hit-test was true. 
     * We are being dragged.
     */
    is_dragged: boolean = false;

    /**
     * The hit-test is true, the mouse may or may not be down.
     * We are being hovered.
     */
    is_hovered: boolean = false;

    hit_test: (p: Vect2D) => boolean;
    on_drag: (p: Vect2D) => void;

    constructor(hit_test: (p: Vect2D) => boolean, on_drag: (p: Vect2D) => void) {
        this.hit_test = hit_test;
        this.on_drag = on_drag;
    }
}

/**
 * Handle mouse events for the {@link ViewPort2D} and expose the "dragging" or "hovering" state.
 * 
 * This automatically filters mouse events to those inside the viewport.
 * Additionally it converts the canvas coordinates of the mouse event into our data-space.
 * Therefore your callbacks should expect the coordinates in the data units.
 */
export class Interactive {
    view: ViewPort2D;

    is_dragged: boolean = false;

    draggables: Draggable[] = [];

    dragged: Draggable | null = null;
    hovered: Draggable | null = null;

    /** The previous mouse position in data-space units. */
    prev_XY: Vect2D | undefined = undefined;

    constructor(view: ViewPort2D) {
        this.view = view;

        view.ctx.canvas.addEventListener("mousedown", this._toHandler((m) => {
            this._updateDragged(m);
            this.is_dragged = true;
        }));

        view.ctx.canvas.addEventListener("mouseup", this._toHandler((m) => {
            this.is_dragged = false;
            this._resetDragged();
        }));

        view.ctx.canvas.addEventListener("mousemove", this._toHandler((m) => {
            this._updateHovered(m);
            this.prev_XY = m;

            if (this.dragged != null) {
                this.dragged.on_drag(m);
            }
        }));
    }

    // This automatically converts the mouse event in canvas coordinates to data-space coordinates.
    _toHandler(func: (mouseXY: Vect2D) => void): (e: MouseEvent) => void {
        return (e: MouseEvent) => {
            const rect = this.view.ctx.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            const mouseXY_canvas = vec2(mouseX, mouseY);

            if (!in_rect(this.view.canvas, mouseXY_canvas)) {
                this.prev_XY = undefined;
                if (this.hovered) {
                    this.hovered.is_dragged = false;
                    this.hovered.is_hovered = false;
                }
                if (this.dragged) {
                    this.dragged.is_dragged = false;
                    this.dragged.is_hovered = false;
                }
                return;
            }

            const mouseXY_data = mouseXY_canvas
                .map((v) => this.view.canvas_to_data(v))
                .map((v) => this.view.data.confine(v));
            func(mouseXY_data);
        }
    }

    _resetHovered() {
        if (this.hovered != null) {
            this.hovered.is_hovered = false;
        }
        this.hovered = null;
    }

    _resetDragged() {
        if (this.dragged != null) {
            this.dragged.is_dragged = false;
        }
        this.dragged = null;
    }

    /**
     * Check & set the hover status of the {@link Draggable}s.
     * 
     * Note: Only one can be hovered at once. 
     *       Precendence goes to the earlier registered Draggable,
     *       unless a Draggable is being dragged, in which case it will be hovered.
     * 
     * @param m The point to check.
     */
    _updateHovered(m: Vect2D) {
        this._resetHovered();

        // Short-circuit; dragged => hovered.
        if (this.dragged != null) {
            this.dragged.is_hovered = true;
            this.hovered = this.dragged;
            return;
        }

        for (const d of this.draggables) {
            d.is_hovered = false;
            if (d.hit_test(m) && (this.hovered == null)) {
                this.hovered = d;
                d.is_hovered = true;
            }
        }
    }

    /**
     * Check & set the drag status of the {@link Draggable}s.
     * 
     * Note: Only one can be dragged at once. 
     *       Precendence goes to the earlier registered Draggable.
     * 
     * @param m The point to check.
     */
    _updateDragged(m: Vect2D) {
        this._resetDragged();
        for (const d of this.draggables) {
            d.is_dragged = false;
            if (d.hit_test(m) && (this.dragged == null)) {
                this.dragged = d;
                d.is_dragged = true;
            }
        }
    }

    /**
     * Check & set the hover status of the {@link Draggable}s 
     * given the current positon of the mouse.
     * 
     * See {@link _updateHovered}.
     */
    updateHovered() {
        if (this.prev_XY) {
            this._updateHovered(this.prev_XY);
        }
    }

    registerDraggable(hit_test: (p: Vect2D) => boolean, on_drag: (p: Vect2D) => void): Draggable {
        let draggable = new Draggable(hit_test, on_drag);
        this.draggables.push(draggable);
        return draggable;
    }

    addOnMouseDown(func: (mouseXY: Vect2D) => void) {
        this.view.ctx.canvas.addEventListener("mousedown", this._toHandler(func));
    }

    addOnMouseUp(func: (mouseXY: Vect2D) => void) {
        this.view.ctx.canvas.addEventListener("mouseup", this._toHandler(func));
        // this.view.ctx.canvas.addEventListener("mouseleave", this._toHandler(func));
    }

    addOnMouseDrag(func: (mouseXY: Vect2D) => void) {
        const func_gated = (mXY: Vect2D) => {
            if (this.is_dragged) {
                func(mXY);
            }
        };
        this.view.ctx.canvas.addEventListener("mousemove", this._toHandler(func_gated));
    }

    addOnMouseMove(func: (mouseXY: Vect2D) => void) {
        this.view.ctx.canvas.addEventListener("mousemove", this._toHandler(func));
    }
}