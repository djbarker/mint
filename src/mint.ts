
export interface Point2D {
    x: number,
    y: number,
}

export function add_points(a: Point2D, b: Point2D): Point2D {
    return {
        x: a.x + b.x,
        y: a.y + b.y,
    }
}

export function sub_points(a: Point2D, b: Point2D): Point2D {
    return {
        x: a.x - b.x,
        y: a.y - b.y,
    }
}

export function div_points(a: Point2D, b: Point2D): Point2D {
    return {
        x: a.x / b.x,
        y: a.y / b.y,
    }
}

export function mul_points(a: Point2D, b: Point2D): Point2D {
    return {
        x: a.x * b.x,
        y: a.y * b.y,
    }
}

export function dot(a: Point2D, b: Point2D): number {
    return a.x * b.x + a.y * b.y;
}

export function deg_to_rad(angle: number): number {
    return angle * Math.PI / 180.0;
}


export function rad_to_deg(angle: number): number {
    return angle * 180.0 / Math.PI;
}


export function rotate_cw_deg(a: Point2D, angle: number) {
    const angle_rad = deg_to_rad(angle);
    return {
        x: a.x * Math.cos(angle_rad) - a.y * Math.sin(angle_rad),
        y: a.x * Math.sin(angle_rad) + a.y * Math.cos(angle_rad),
    }
}

// Return the arugment (clockwise angle from x-axis) in degrees.
export function arg_deg(a: Point2D): number {
    return rad_to_deg(Math.atan2(a.y, a.x));
}

export function magnitude(a: Point2D): number {
    return Math.sqrt(a.x * a.x + a.y * a.y);
}

export function rescale_vec(v: Point2D, vmag: number): Point2D {
    const mult = vmag / magnitude(v);
    return {
        x: mult * v.x,
        y: mult * v.y,
    };
}

// Returns a unit vector with the given argument (clockwise angle from the x-axis).
export function unit_vec_deg(angle: number) {
    const rad = deg_to_rad(angle);
    return {
        x: Math.cos(rad),
        y: Math.sin(rad),
    }
}

export interface Circle {
    center: Point2D,
    radius: number,
}

export function in_circle(c: Circle, p: Point2D): boolean {
    let dx = p.x - c.center.x;
    let dy = p.y - c.center.y;
    return (dx * dx + dy * dy) <= c.radius * c.radius
}

export interface LineSegment2D {
    start: Point2D,
    end: Point2D,
}

export function make_segment(center_xy: Point2D, length: number, angle_deg: number): LineSegment2D {
    const offset = rescale_vec(unit_vec_deg(angle_deg), length / 2.0);
    const start = add_points(center_xy, rotate_cw_deg(offset, 180));
    const end = add_points(center_xy, offset);
    return {
        start: start,
        end: end,
    }
}

export interface Ray2D {
    start: Point2D,
    angle: number,
}

// export function near_line_seg_2d(seg: LineSegment2D, p: Point2D, d: number) {

// }

// Convert our data space into canvas locations.
export class ViewPort2D {
    ctx: CanvasRenderingContext2D;
    lower: Point2D;
    upper: Point2D;

    constructor(
        ctx: CanvasRenderingContext2D,
        lower: Point2D,
        upper: Point2D) {
        this.ctx = ctx;
        this.lower = lower;
        this.upper = upper;
    }

    // The width in data-space units.
    get width(): number {
        return this.upper.x - this.lower.x;
    }

    // The height in data-space units.
    get height(): number {
        return this.upper.y - this.lower.y;
    }
}

export function to_canvas_space_point(view: ViewPort2D, point: Point2D): Point2D {
    let frac = div_points(sub_points(point, view.lower), sub_points(view.upper, view.lower));
    let size = { x: view.ctx.canvas.width, y: view.ctx.canvas.height };
    let pixels = mul_points(frac, size);
    pixels = {
        x: pixels.x,
        y: size.y - pixels.y,
    }
    return pixels;
}

// NOTE: Assumes the canvas's aspect ratio matches the viewport's.
export function to_canvas_space_dist(view: ViewPort2D, dist: number): number {
    const frac = dist / (view.upper.x - view.lower.x);
    const size = view.ctx.canvas.width;
    const pixels = frac * size;
    return pixels;
}

export function to_data_space_point(view: ViewPort2D, pixels: Point2D): Point2D {
    const size = { x: view.ctx.canvas.width, y: view.ctx.canvas.height };
    pixels = {
        x: pixels.x,
        y: size.y - pixels.y,
    }
    const frac = div_points(pixels, size);
    const point = add_points(view.lower, mul_points(frac, sub_points(view.upper, view.lower)));
    return point;
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

export interface StyleProprs {
    fillcolor?: string | CanvasGradient | CanvasPattern,
    linewidth?: number,
    linecolor?: string | CanvasGradient | CanvasPattern,
    linestyle?: string,
}
export function style(props: StyleProprs): (ctx: CanvasRenderingContext2D) => void {
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
    const center = to_canvas_space_point(view, circle.center);
    const radius = to_canvas_space_dist(view, circle.radius);

    view.ctx.beginPath();
    style(view.ctx);
    view.ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI);
    view.ctx.fill();
    view.ctx.stroke();
    style_default(view.ctx);
}


export function draw_line_seg(view: ViewPort2D, seg: LineSegment2D, style: StyleSetter = stroke_default) {
    const start = to_canvas_space_point(view, seg.start);
    const end = to_canvas_space_point(view, seg.end);

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
        add_points(ray.start, head1),
        add_points(ray.start, head2),
    ];
    draw_poly(view, points, style);
}

export function draw_ray(view: ViewPort2D, ray: Ray2D, style: StyleSetter = stroke_default) {
    const length = Math.max(view.width, view.height) * 1.5; // NOTE: 1.5 > sqrt(2);
    let start = ray.start;
    let end = add_points(ray.start, rescale_vec(unit_vec_deg(ray.angle), length));

    start = to_canvas_space_point(view, start);
    end = to_canvas_space_point(view, end);

    view.ctx.beginPath();
    view.ctx.moveTo(start.x, start.y);
    view.ctx.lineTo(end.x, end.y);
    style(view.ctx)
    view.ctx.stroke();
    style_default(view.ctx);
}

export function draw_poly(view: ViewPort2D, points: Point2D[], style: StyleSetter = fill_default) {
    const start = to_canvas_space_point(view, points[0]);

    view.ctx.beginPath();
    view.ctx.moveTo(start.x, start.y);
    points.forEach(p => {
        p = to_canvas_space_point(view, p);
        view.ctx.lineTo(p.x, p.y)
    });
    style(view.ctx);
    view.ctx.closePath();
    view.ctx.stroke();
    view.ctx.fill();
    style_default(view.ctx);
}

// Will automatically chose the shorter way round.
export function draw_arc(view: ViewPort2D, start: Point2D, radius: number, angle_start: number, angle_end: number, style: StyleSetter = stroke_default) {
    start = to_canvas_space_point(view, start);
    radius = to_canvas_space_dist(view, radius);

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

export class Interactive {
    view: ViewPort2D;
    is_dragging: boolean = false;
    lock: boolean = false;

    constructor(view: ViewPort2D) {
        this.view = view;

        view.ctx.canvas.addEventListener("mousedown", (e) => { this.is_dragging = true; });
        view.ctx.canvas.addEventListener("mouseup", (e) => { this.is_dragging = false; });
    }

    // This automatically converts the mouse event in canvas coordinates to data-space coordinates.
    _toHandler(func: (mouseXY: Point2D) => void): (e: MouseEvent) => void {
        return (e: MouseEvent) => {
            const rect = this.view.ctx.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            const mouseXY = to_data_space_point(this.view, { x: mouseX, y: mouseY });
            func(mouseXY);
        }
    }

    registerDraggable(hit_test: (p: Point2D) => boolean, on_drag: (p: Point2D) => void) {
        const canvas = this.view.ctx.canvas;

        let out = {
            is_dragging: false,
            is_hovered: false,
        }

        canvas.addEventListener("mousedown", this._toHandler((m) => {
            if (hit_test(m) && !this.lock) {
                out.is_dragging = true;
                this.lock = true;
            }
        }))

        canvas.addEventListener("mouseup", (e) => {
            out.is_dragging = false;
            if (out.is_hovered) {
                this.lock = false;
            }
        });

        canvas.addEventListener("mousemove", this._toHandler((m) => {
            out.is_hovered = hit_test(m);
            if (out.is_dragging) {
                on_drag(m);
            }
        }));

        return out;
    }

    addOnMouseDown(func: (mouseXY: Point2D) => void) {
        this.view.ctx.canvas.addEventListener("mousedown", this._toHandler(func));
    }

    addOnMouseUp(func: (mouseXY: Point2D) => void) {
        this.view.ctx.canvas.addEventListener("mouseup", this._toHandler(func));
        // this.view.ctx.canvas.addEventListener("mouseleave", this._toHandler(func));
    }

    addOnMouseDrag(func: (mouseXY: Point2D) => void) {
        const func_gated = (mXY: Point2D) => {
            if (this.is_dragging) {
                func(mXY);
            }
        };
        this.view.ctx.canvas.addEventListener("mousemove", this._toHandler(func_gated));
    }

    addOnMouseMove(func: (mouseXY: Point2D) => void) {
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

    set_recalc(inputs: [Value<any>], recalc: (self: Value<T>) => void): Value<T> {
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
