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
 * @returns The clockwise angle from the x-axis in degrees. In the range [0, 360)
 */
export function arg_deg(a: Vect2D): number {
    let arg = Math.atan2(a.y, a.x);
    if (arg < 0) {
        arg += 2 * Math.PI;
    }
    return rad_to_deg(arg);
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
    point = sub(point, ray.start);
    const r_unit = unit_vec_deg(ray.angle);
    const rc_dot = dot(r_unit, point)
    const c_para = rescale_vec(r_unit, rc_dot);
    const c_perp = sub(point, c_para);
    return (rc_dot > 0) && (magnitude(c_perp) <= eps)
}

/**
 * A line in 2D.
 */
export interface Line2D {
    /** A point on the line. */
    start: Vect2D,
    /** The argument, in degrees. */
    angle: number,
}

/**
 * Are we close to the given {@link Line2D}?
 * 
 * @param line The line.
 * @param point The point to test for closeness.
 * @param eps Perpendicular distance to the line which will count as "close".
 * @returns True if {@link point} is within {@link eps} of the line.
 */
export function near_line(line: Line2D, point: Vect2D, eps: number): boolean {
    point = sub(point, line.start);
    const r_unit = unit_vec_deg(line.angle);
    const rc_dot = dot(r_unit, point)
    const c_para = rescale_vec(r_unit, rc_dot);
    const c_perp = sub(point, c_para);
    return (magnitude(c_perp) <= eps);
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

    /** The rectangle's aspect ratio. */
    get aspect(): number {
        return this.height / this.width;
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
 * Construct a {@link Rectangle} from the x & y ranges.
 * 
 * This contrasts to the {@link Rectangle} constructor which takes the lower xy, and the upper xy coordinates.
 * 
 * @param x_range Tuple of `[xmin, xmax]`.
 * @param y_range Tuple of `[ymin, ymax]`.
 * @returns 
 */
export function rect(x_range: [number, number], y_range: [number, number]): Rectangle {
    return new Rectangle(vec2(x_range[0], y_range[0]), vec2(x_range[1], y_range[1]));
}


export function in_rect(rect: Rectangle, p: Vect2D): boolean {
    return (rect.lower.x <= p.x) && (p.x <= rect.upper.x) && (rect.lower.y <= p.y) && (p.y <= rect.upper.y);
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
     * Like but {@link CanvasRenderingContext2D.arc} but takes data-space units and degrees.
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

    arcTo(p1: Vect2D, p2: Vect2D, radius: number) {
        p1 = this.data_to_canvas(p1);
        p2 = this.data_to_canvas(p2);
        radius = this.data_to_canvas_dist(radius);
        this.ctx.arcTo(p1.x, p1.y, p2.x, p2.y, radius);
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
    stroke_default(ctx)
    fill_style(ctx, "black");
}

export function style_default(ctx: CanvasRenderingContext2D) {
    ctx.lineWidth = 1;
    ctx.strokeStyle = "black";
    ctx.setLineDash([0]);
    fill_off(ctx);
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


export function draw_circle(view: ViewPort2D, circle: Circle, style: StyleSetter = stroke_default) {
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

/**
 * Draw an arrow head (triangle).
 * 
 * @param view 
 * @param ray Location and direction of arrow head. In data-space units.
 * @param size In units of canvas pixels.
 * @param angle Controls the "flatness" of the head. In degrees.
 * @param style 
 */
export function draw_arrow_head(view: ViewPort2D, ray: Ray2D, size: number | null = null, angle: number = 70, style: StyleSetter = fill_default) {
    if (size == null) {
        size = Math.sqrt(view.ctx.canvas.width * view.ctx.canvas.height) / 20.0;
    }

    // Note: convert to canvas units and get the shape there to maintain aspect ratio & sizing.
    ray = {
        start: view.data_to_canvas(ray.start),
        // angle: ray.angle,
        angle: unit_vec_deg(ray.angle)
            .map((v) => div(v, view.data.size))
            .map((v) => mul(v, view.canvas.size))
            .arg,
    };

    const beta = 90 - ray.angle + angle;
    const gamma = 90 - angle;
    const unit = unit_vec_deg(beta)
    const head1 = rescale_vec(unit, size);
    const head2 = rotate_cw_deg(head1, 2 * gamma);

    const points = [
        ray.start,
        add(ray.start, head1),
        add(ray.start, head2),
    ];

    // Do not use draw_poly because that expects data-space units.
    view.ctx.beginPath();
    view.ctx.moveTo(points[0].x, points[0].y);
    points.forEach(p => {
        view.ctx.lineTo(p.x, p.y)
    });
    style(view.ctx);
    view.ctx.closePath();
    view.ctx.stroke();
    view.ctx.fill();
    style_default(view.ctx);
}


/**
 * Draws a vector as an arrow.
 * 
 * The arrow head is calculated based on the _canvas_ so the aspect ratio is mantained,
 * and to allow consistent sizing between different {@link ViewPort2D}s.
 * 
 * @param view 
 * @param vec_from 
 * @param vec_to 
 * @param size 
 * @param style 
 */
export function draw_vector(view: ViewPort2D, vec_from: Vect2D, vec_to: Vect2D, size: number | null = null, style: StyleSetter = fill_default) {
    draw_line_seg(view, { start: vec_from, end: vec_to }, style);
    draw_arrow_head(view, { start: vec_to, angle: vec_to.minus(vec_from).arg }, size, 70, style);
}


export function draw_ray(view: ViewPort2D, ray: Ray2D, style: StyleSetter = stroke_default) {
    const length = Math.max(view.data.width, view.data.height) * 1.5; // NOTE: 1.5 > sqrt(2);
    let start = ray.start;
    let end = add(ray.start, rescale_vec(unit_vec_deg(ray.angle), length));
    draw_line_seg(view, { start: start, end: end }, style);
}


export function draw_line(view: ViewPort2D, line: Line2D, style: StyleSetter = stroke_default) {
    const length = Math.max(view.data.width, view.data.height) * 1.5; // NOTE: 1.5 > sqrt(2);
    const start = line.start.plus(rescale_vec(unit_vec_deg(line.angle), -length));
    const end = line.start.plus(rescale_vec(unit_vec_deg(line.angle), +length));
    draw_line_seg(view, { start: start, end: end }, style);
}

export function draw_h_line(view: ViewPort2D, y: number, style: StyleSetter = stroke_default) {
    draw_line(view, { start: vec2(view.data.lower.x, y), angle: 0 }, style);
}


export function draw_v_line(view: ViewPort2D, x: number, style: StyleSetter = stroke_default) {
    draw_line(view, { start: vec2(x, view.data.lower.y), angle: 90 }, style);
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
    style_default(view.ctx);
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


export function draw_plot(view: ViewPort2D, x_range: [number, number], dx: number, func: (x: number) => number, style: StyleSetter = stroke_default) {
    view.ctx.beginPath();
    style(view.ctx)
    view.moveTo(vec2(x_range[0], func(x_range[0])));
    for (let x = x_range[0] + dx; x < x_range[1]; x += dx) {
        view.lineTo(vec2(x, func(x)));
    }
    view.lineTo(vec2(x_range[1], func(x_range[1])));
    view.ctx.stroke();
}

/**
 * Draw an axis grid covering the view port.
 * 
 * The lines will be evenly spaced around the origin in both directions.
 * 
 * @param view 
 * @param xspacing How far apart should the grid lines be on the x-axis?
 * @param yspacing How far apart should the grid lines be on the y-axis?
 * @param style 
 */
export function draw_axis_grid(view: ViewPort2D, xspacing: number, yspacing: number, style: StyleSetter = stroke_default) {
    // Draw vertical lines.
    const nxl = Math.floor(view.data.lower.x / xspacing);
    const nxu = Math.ceil(view.data.upper.x / xspacing);
    for (let i = nxl; i <= nxu; i++) {
        draw_v_line(view, i * xspacing, style);
    }

    // Draw horizontal lines.
    const nyl = Math.floor(view.data.lower.y / yspacing);
    const nyu = Math.ceil(view.data.upper.y / yspacing);
    for (let i = nyl; i <= nyu; i++) {
        draw_h_line(view, i * yspacing, style);
    }
}

export function draw_axes(view: ViewPort2D, xlabel: string | null = null, ylabel: string | null = null, size: number | null = null, font: string = font_default, style: StyleSetter = fill_default) {

    draw_vector(view, vec2(view.data.lower.x, 0), vec2(view.data.upper.x, 0), size, style);
    draw_vector(view, vec2(0, view.data.lower.y), vec2(0, view.data.upper.y), size, style);

    if (xlabel != null) {
        draw_text(view, xlabel, vec2(view.data.upper.x + 0.03 * view.data.width, 0), "..", font);
    }

    if (ylabel != null) {
        draw_text(view, ylabel, vec2(0, view.data.upper.y + 0.05 * view.data.height), "..", font);
    }
}

export class Draggable {

    is_dragged: boolean = false;
    is_hovered: boolean = false;

    hit_test: (p: Vect2D) => boolean;
    on_drag: (p: Vect2D) => void;

    constructor(hit_test: (p: Vect2D) => boolean, on_drag: (p: Vect2D) => void) {
        this.hit_test = hit_test;
        this.on_drag = on_drag;
    }
}

export class Interactive {
    view: ViewPort2D;

    is_dragged: boolean = false;

    draggables: Draggable[] = [];

    dragged: any | null = null;
    hovered: any | null = null;

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