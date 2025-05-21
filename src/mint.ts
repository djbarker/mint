/**
 * A 2D vector.
 */
export class Vect2D {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    /**
     * Construct a vector with the given x-component value, and the same y-component value.
     * 
     * @param x The new x-component value.
     * @returns 
     */
    with_x(x: number): Vect2D {
        return vec2(x, this.y);
    }

    /**
     * Construct a vector with the same x-component value, and the given y-component value.
     * 
     * @param y The new y-component value.
     * @returns 
     */
    with_y(y: number): Vect2D {
        return vec2(this.x, y);
    }

    /**
     * Map the y-component to a new value, and leave the x-coordinate unchanged.
     * 
     * @param f Function to map the y value.
     * @returns 
     */
    map_y(f: (y: number) => number): Vect2D {
        return vec2(this.x, f(this.y));
    }

    /**
     * Map the x-component to a new value, and leave the y-coordinate unchanged.
     * 
     * @param f Function to map the x value.
     * @returns 
     */
    map_x(f: (x: number) => number): Vect2D {
        return vec2(f(this.x), this.y);
    }

    /**
     * Map the vector to a new vector.
     * 
     * @param f Function to map the vector.
     * @returns 
     */
    map(f: (v: Vect2D) => Vect2D): Vect2D {
        return f(this)
    }

    /**
     * The (Euclidean) norm of the vector.
     */
    get mag(): number {
        return magnitude(this);
    }

    /**
     * The argument of the vector in degrees.
     */
    get arg(): number {
        return arg_deg(this);
    }

    /**
     * Add a vector to this.
     */
    plus(rhs: Vect2D): Vect2D {
        return add(this, rhs);
    }

    /**
     * Subtract a vector from this.
     */
    minus(rhs: Vect2D): Vect2D {
        return sub(this, rhs);
    }

    /**
     * The dot product of this with another vector.
     */
    dot(rhs: Vect2D): number {
        return dot(this, rhs);
    }
}

/**
 * Make a new {@link Vect2D}.
 * 
 * @param x 
 * @param y 
 * @returns The {@link Vect2D} having `x` and `y` as components.
 */
export function vec2(x: number, y: number): Vect2D {
    return new Vect2D(x, y);
}

/**
 * The componentwise absolute value of a vector.
 * 
 * @param v 
 * @returns The vector abs; `b_i = Math.abs(a_i)`.
 */
export function abs(v: Vect2D): Vect2D {
    return vec2(Math.abs(v.x), Math.abs(v.y));
}

/**
 * Add two vectors componentwise.
 * 
 * @param a 
 * @param b 
 * @returns The vector sum; `a + b`.
 */
export function add(a: Vect2D, b: Vect2D): Vect2D {
    return vec2(a.x + b.x, a.y + b.y);
}

/**
 * Subtract two vectors componentwise.
 * 
 * @param a 
 * @param b 
 * @returns The vector difference; `a - b`.
 */
export function sub(a: Vect2D, b: Vect2D): Vect2D {
    return vec2(a.x - b.x, a.y - b.y);
}

/**
 * Divide the components of two vectors.
 * 
 * @param a 
 * @param b 
 * @returns The "vector division"; `c_i = a_i / b_i`.
 */
export function div(a: Vect2D, b: Vect2D): Vect2D {
    return vec2(a.x / b.x, a.y / b.y);
}

/**
 * Multiply the components of two vectors.
 * 
 * @param a 
 * @param b 
 * @returns The "vector multiplication"; `c_i = a_i * b_i`.
 */
export function mul(a: Vect2D, b: Vect2D): Vect2D {
    return vec2(a.x * b.x, a.y * b.y);
}

/**
 * The scalar product of two vectors.
 * 
 * @param a 
 * @param b 
 * @returns The dot product.
 */
export function dot(a: Vect2D, b: Vect2D): number {
    return a.x * b.x + a.y * b.y;
}

/**
 * Convert an angle in degrees to radians.
 * 
 * @param angle In degrees.
 * @returns In radians.
 */
export function deg_to_rad(angle: number): number {
    return angle * Math.PI / 180.0;
}

/**
 * Convert an angle in radians to degrees.
 * 
 * @param angle In radians.
 * @returns In degrees.
 */
export function rad_to_deg(angle: number): number {
    return angle * 180.0 / Math.PI;
}

/**
 * Rotate a {@link Vect2D} clockwise by the specified angle.
 * 
 * @param a The vector to rotate.
 * @param angle The angle to rotate by (negative for anticlockwise).
 * @returns The rotated vector.
 */
export function rotate_cw_deg(a: Vect2D, angle: number): Vect2D {
    const angle_rad = deg_to_rad(angle);
    return vec2(
        a.x * Math.cos(angle_rad) - a.y * Math.sin(angle_rad),
        a.x * Math.sin(angle_rad) + a.y * Math.cos(angle_rad),
    );
}

/**
 * Return the argument of a {@link Vect2D}.
 * 
 * @param a 
 * @returns The clockwise angle from the x-axis in degrees.
 */
export function arg_deg(a: Vect2D): number {
    return rad_to_deg(Math.atan2(a.y, a.x));
}

/**
 * The magnitude of a {@link Vect2D}.
 * 
 * @param a 
 * @returns The Euclidean norm of the vector.
 */
export function magnitude(a: Vect2D): number {
    return Math.sqrt(dot(a, a));
}

/**
 * Change the length of a vector without changing its direction.
 * 
 * @param v The vector whose direction to use.
 * @param vmag The length of the new vector.
 * @returns A vector of length {@link vmag} pointing in the direction of {@link v}.
 */
export function rescale_vec(v: Vect2D, vmag: number): Vect2D {
    const mult = vmag / magnitude(v);
    return vec2(
        mult * v.x,
        mult * v.y,
    );
}

/**
 * Add or subtract to the length of a vector without changing its direction.
 * 
 * @param v The vector whose direction to use.
 * @param len The length to change the length of vector by (can be negative).
 * @returns A vector of length ({@link v}.mag + {@link len}) pointing in the direction of {@link v}.
 */
export function expand_vec(v: Vect2D, len: number): Vect2D {
    return rescale_vec(v, magnitude(v) + len);
}


/**
 * Returns a unit vector with the given argument.
 * 
 * @param angle In degrees.
 * @returns A unit vector with the given argument.
 */
export function unit_vec_deg(angle: number) {
    const rad = deg_to_rad(angle);
    return vec2(
        Math.cos(rad),
        Math.sin(rad),
    );
}

export interface Circle {
    center: Vect2D,
    radius: number,
}

/**
 * Hit-test for a {@link Circle}.
 * 
 * @param c The circle to test.
 * @param p The test point.
 * @returns True iff {@link p} is inside {@link c}.
 */
export function in_circle(c: Circle, p: Vect2D): boolean {
    let dx = p.x - c.center.x;
    let dy = p.y - c.center.y;
    return (dx * dx + dy * dy) <= c.radius * c.radius
}

export interface LineSegment2D {
    start: Vect2D,
    end: Vect2D,
}

export function make_segment(center_xy: Vect2D, length: number, angle_deg: number): LineSegment2D {
    const offset = rescale_vec(unit_vec_deg(angle_deg), length / 2.0);
    const start = add(center_xy, rotate_cw_deg(offset, 180));
    const end = add(center_xy, offset);
    return {
        start: start,
        end: end,
    }
}

/**
 * A ray in 2D.
 */
export interface Ray2D {
    /** The origin point of the ray. */
    start: Vect2D,
    /** The argument, in degrees. */
    angle: number,
}

/**
 * Are we close to the given {@link Ray2D}?
 * 
 * @param ray The ray.
 * @param point The point to test for closeness.
 * @param eps Perpendicular distance to the ray which will count as "close".
 * @returns True if {@link point} is within {@link eps} of the ray.
 */
export function near_ray(ray: Ray2D, point: Vect2D, eps: number): boolean {
    const r_unit = unit_vec_deg(ray.angle);
    const rc_dot = dot(r_unit, sub(point, ray.start))
    const c_para = rescale_vec(r_unit, rc_dot);
    const c_perp = sub(point, c_para);
    return (rc_dot > 0) && (magnitude(c_perp) <= eps)
}

export class Rectangle {
    lower: Vect2D;
    upper: Vect2D;

    constructor(lower: Vect2D, upper: Vect2D) {
        this.lower = lower;
        this.upper = upper;
        if (this.lower.x > this.upper.x || this.lower.y > this.upper.y) {
            console.log("Rectangle bounds flipped!");
        }
    }

    /** The rectangle's size in each dimension. */
    get size(): Vect2D {
        return sub(this.upper, this.lower);
    }

    /** The rectangle's width. */
    get width(): number {
        return this.size.x;
    }

    /** The rectangle's height. */
    get height(): number {
        return this.size.y;
    }

    /**
     * Confine the given vector to be in the rectangle.
     * 
     * @param v 
     * @returns 
     */
    confine(v: Vect2D) {
        const x = Math.min(this.upper.x, Math.max(this.lower.x, v.x));
        const y = Math.min(this.upper.y, Math.max(this.lower.y, v.y));
        return vec2(x, y);
    }
}

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

    with_clip(context: () => void) {
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.rect(this.canvas.lower.x, this.canvas.lower.y, this.canvas.width, this.canvas.height);
        this.ctx.clip();

        context();

        style_default(this.ctx);
        this.ctx.restore();
    }
}


export function stroke_default(ctx: CanvasRenderingContext2D) {
    fill_off(ctx);
    ctx.lineWidth = 1;
    ctx.strokeStyle = "black";
    ctx.setLineDash([0])
}

export function stroke_dash(ctx: CanvasRenderingContext2D, dash: number, gap: number) {
    ctx.setLineDash([dash, gap]);
}

export function stroke_style(ctx: CanvasRenderingContext2D, style: string) {
    ctx.strokeStyle = style;
}

export function stroke_width(ctx: CanvasRenderingContext2D, width: number) {
    ctx.lineWidth = width;
}
export function stroke_off(ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = "rgba(1, 1, 1, 0)";
    ctx.lineWidth = 0;
}

export function fill_style(ctx: CanvasRenderingContext2D, style: string) {
    ctx.fillStyle = style
}

export function fill_off(ctx: CanvasRenderingContext2D) {
    fill_style(ctx, "rgba(1, 1, 1, 0)");
}

export function fill_default(ctx: CanvasRenderingContext2D) {
    stroke_off(ctx)
    fill_style(ctx, "black");
}

export function style_default(ctx: CanvasRenderingContext2D) {
    ctx.lineWidth = 1;
    ctx.strokeStyle = "black";
    ctx.setLineDash([0])
}

export type StyleSetter = (ctx: CanvasRenderingContext2D) => void;

export interface StyleProps {
    fillcolor?: string | CanvasGradient | CanvasPattern,
    linewidth?: number,
    linecolor?: string | CanvasGradient | CanvasPattern,
    linestyle?: string,
}
export function style(props: StyleProps): (ctx: CanvasRenderingContext2D) => void {
    return (ctx: CanvasRenderingContext2D) => {
        if (typeof props.fillcolor !== "undefined") {
            if ((props.fillcolor == "off") || (props.fillcolor == "none")) {
                fill_off(ctx);
            } else {
                ctx.fillStyle = props.fillcolor;
            }
        }
        if (typeof props.linewidth !== "undefined") {
            ctx.lineWidth = props.linewidth;
        }
        if (typeof props.linecolor !== "undefined") {
            if ((props.linecolor == "off") || (props.linecolor == "none")) {
                stroke_off(ctx);
            } else {
                ctx.strokeStyle = props.linecolor;
            }
        }
        if (typeof props.linestyle !== "undefined") {
            if ((props.linecolor == "off") || (props.linecolor == "none")) {
                stroke_off(ctx);
            } else if (props.linestyle == "solid") {
                ctx.setLineDash([0]);
            } else if (props.linestyle == "dashed") {
                ctx.setLineDash([5, 3]);
            } else if (props.linestyle == "dotted") {
                ctx.setLineDash([2, 3]);
            } else if (props.linestyle == "dashdot") {
                ctx.setLineDash([5, 3, 2, 3]);
            }
        }
    };
}


export function draw_circle(view: ViewPort2D, circle: Circle, style: StyleSetter = style_default) {
    const center = view.data_to_canvas(circle.center);
    const radius = view.data_to_canvas_dist(circle.radius);

    view.ctx.beginPath();
    style(view.ctx);
    view.ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI);

    view.ctx.fill();
    view.ctx.stroke();
    style_default(view.ctx);
}


export function draw_line_seg(view: ViewPort2D, seg: LineSegment2D, style: StyleSetter = stroke_default) {
    const start = view.data_to_canvas(seg.start);
    const end = view.data_to_canvas(seg.end);

    view.ctx.beginPath();
    view.ctx.moveTo(start.x, start.y);
    view.ctx.lineTo(end.x, end.y);
    style(view.ctx)
    view.ctx.stroke();
    style_default(view.ctx);
}

export function draw_arrow_head(view: ViewPort2D, ray: Ray2D, size: number, angle: number = 60, style: StyleSetter = fill_default) {
    const beta = 90 - ray.angle + angle;
    const gamma = 90 - angle;
    const unit = unit_vec_deg(-beta)
    const head1 = rescale_vec(unit, size);
    const head2 = rotate_cw_deg(head1, -2 * gamma);
    const points = [
        ray.start,
        add(ray.start, head1),
        add(ray.start, head2),
    ];
    draw_poly(view, points, style);
}

export function draw_ray(view: ViewPort2D, ray: Ray2D, style: StyleSetter = stroke_default) {
    const length = Math.max(view.data.width, view.data.height) * 1.5; // NOTE: 1.5 > sqrt(2);
    let start = ray.start;
    let end = add(ray.start, rescale_vec(unit_vec_deg(ray.angle), length));

    start = view.data_to_canvas(start);
    end = view.data_to_canvas(end);

    view.ctx.beginPath();
    view.ctx.moveTo(start.x, start.y);
    view.ctx.lineTo(end.x, end.y);
    style(view.ctx)
    view.ctx.stroke();
    style_default(view.ctx);
}

export function draw_poly(view: ViewPort2D, points: Vect2D[], style: StyleSetter = fill_default) {
    const start = view.data_to_canvas(points[0]);

    view.ctx.beginPath();
    view.ctx.moveTo(start.x, start.y);
    points.forEach(p => {
        p = view.data_to_canvas(p);
        view.ctx.lineTo(p.x, p.y)
    });
    style(view.ctx);
    view.ctx.closePath();
    view.ctx.stroke();
    view.ctx.fill();
    style_default(view.ctx);
}

// Will automatically chose the shorter way round.
export function draw_arc(view: ViewPort2D, start: Vect2D, radius: number, angle_start: number, angle_end: number, style: StyleSetter = stroke_default) {
    start = view.data_to_canvas(start);
    radius = view.data_to_canvas_dist(radius);

    // Flipped y-coordinate means we need to negate these.
    angle_start = - angle_start
    angle_end = - angle_end

    let delta = angle_end - angle_start;
    if (delta < 0) {
        delta += 360;
    }

    const anticlockwise = delta > 180;

    view.ctx.beginPath();
    view.ctx.arc(start.x, start.y, radius, deg_to_rad(angle_start), deg_to_rad(angle_end), anticlockwise);
    style(view.ctx);
    view.ctx.stroke();
    stroke_default(view.ctx);
}

export type Quadrant = "++" | "+-" | "--" | "-+";

export function draw_right_angle(view: ViewPort2D, point: Vect2D, size: number, angle: number, quadrant: Quadrant, style: StyleSetter = stroke_default) {
    const sx = (quadrant == "++" || quadrant == "+-") ? 1 : -1;
    const sy = (quadrant == "++" || quadrant == "-+") ? 1 : -1;
    let a = vec2(size * sx, 0);
    let b = vec2(size * sx, size * sy);
    let c = vec2(0, size * sy);
    a = add(point, rotate_cw_deg(a, angle));
    b = add(point, rotate_cw_deg(b, angle));
    c = add(point, rotate_cw_deg(c, angle));

    a = view.data_to_canvas(a);
    b = view.data_to_canvas(b);
    c = view.data_to_canvas(c);

    view.ctx.beginPath();
    style(view.ctx);
    view.ctx.moveTo(a.x, a.y);
    view.ctx.lineTo(b.x, b.y);
    view.ctx.lineTo(c.x, c.y);
    view.ctx.stroke();
    view.ctx.fill();
    style_default(view.ctx);
}

export type Offset = "++" | ".+" | "-+" | "+." | ".." | "-." | "+-" | ".-" | "--";

export function text_default(ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = "white";
    ctx.lineWidth = 3;
    ctx.fillStyle = "black";
}

export const font_default: string = "16px sans-serif";

export function draw_text(view: ViewPort2D, text: string, xy: Vect2D, offset: Offset = "..", font: string = font_default, style: StyleSetter = text_default) {
    xy = view.data_to_canvas(xy);

    view.ctx.font = font;
    view.ctx.textAlign = "center";
    view.ctx.textBaseline = "middle";
    style(view.ctx);
    view.ctx.strokeText(text, xy.x, xy.y);
    view.ctx.fillText(text, xy.x, xy.y);
    // Reset all properties
    stroke_default(view.ctx);
    view.ctx.font = font_default;
    view.ctx.textAlign = "center";
    view.ctx.textBaseline = "middle";
}

export class Draggable {
    z: number;

    is_dragging: boolean = false;
    is_hovered: boolean = false;

    constructor(z: number) {
        this.z = z;
    }
}

export class Interactive {
    view: ViewPort2D;

    is_dragging: boolean = false;

    dragged: any | null = null;
    hovered: any | null = null;

    constructor(view: ViewPort2D) {
        this.view = view;

        view.ctx.canvas.addEventListener("mousedown", (e) => { this.is_dragging = true; });
        view.ctx.canvas.addEventListener("mouseup", (e) => { this.is_dragging = false; });
    }

    // This automatically converts the mouse event in canvas coordinates to data-space coordinates.
    _toHandler(func: (mouseXY: Vect2D) => void): (e: MouseEvent) => void {
        return (e: MouseEvent) => {
            const rect = this.view.ctx.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            const mouseXY = vec2(mouseX, mouseY)
                .map((v) => this.view.canvas_to_data(v))
                .map((v) => this.view.data.confine(v));
            func(mouseXY);
        }
    }

    registerDraggable(z: number, hit_test: (p: Vect2D) => boolean, on_drag: (p: Vect2D) => void): Draggable {
        const canvas = this.view.ctx.canvas;

        let out = new Draggable(z);

        canvas.addEventListener("mousedown", this._toHandler((m) => {
            if ((this.hovered == out) && (this.dragged == null)) {
                out.is_dragging = true;
                this.dragged = out;
            }
        }))

        canvas.addEventListener("mouseup", (e) => {
            out.is_dragging = false;
            this.dragged = null;
        });

        canvas.addEventListener("mousemove", this._toHandler((m) => {
            if (hit_test(m)) {
                if (this.hovered == null) {
                    out.is_hovered = true;
                    this.hovered = out;
                } else if (this.hovered.z < out.z) {
                    this.hovered.is_hovered = false;
                    out.is_hovered = true;
                    this.hovered = out;
                }
            } else if (this.hovered == out) {
                out.is_hovered = false;
                this.hovered = null;
            }

            if (out.is_dragging) {
                on_drag(m);
            }
        }));

        return out;
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
            if (this.is_dragging) {
                func(mXY);
            }
        };
        this.view.ctx.canvas.addEventListener("mousemove", this._toHandler(func_gated));
    }

    addOnMouseMove(func: (mouseXY: Vect2D) => void) {
        this.view.ctx.canvas.addEventListener("mousemove", this._toHandler(func));
    }
}

export class Value<T> {
    value: T;
    deps: Value<any>[];
    _recalc: (self: Value<T>, fired: Value<T>) => void;

    constructor(value: T, deps: Value<any>[], recalc: (self: Value<T>) => void,) {
        this.value = value;
        this.deps = deps
        this._recalc = recalc;
    }

    recalc(fired: Value<T>): void {
        this._recalc(this, fired);
        this.deps.forEach(dep => {
            if (dep != fired) {
                dep.recalc(this);
            }
        });
    }

    fire(): void {
        this.deps.forEach(dep => {
            dep.recalc(this);
        })
    }

    set_recalc(inputs: Value<any>[], recalc: (self: Value<T>) => void): Value<T> {
        this._recalc = recalc;

        inputs.forEach(input => {
            input.deps.push(this);
        });

        return this;
    }
}

export function wrap<T>(value: T): Value<T> {
    return new Value(value, [], (fired) => {
        console.log("Unset recalc function. Is this intended?");
    });
}

// export function link(value_a: Value<any>, value_b: Value<any>, a_from_b: () => void, b_from_a: () => void) {
//     value_a
// }

