
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

export function deg_to_rag(angle: number): number {
    return angle * Math.PI / 180.0;
}

export function rotate_cw_deg(a: Point2D, angle: number) {
    const angle_rad = deg_to_rag(angle);
    return {
        x: a.x * Math.cos(angle_rad) - a.y * Math.sin(angle_rad),
        y: a.x * Math.sin(angle_rad) + a.y * Math.cos(angle_rad),
    }
}


export function magnitude(a: Point2D) {
    return Math.sqrt(a.x * a.x + a.y * a.y);
}

export function rescale_vec(v: Point2D, vmag: number): Point2D {
    const mult = vmag / magnitude(v);
    return {
        x: mult * v.x,
        y: mult * v.y,
    };
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

// export function near_line_seg_2d(seg: LineSegment2D, p: Point2D, d: number) {

// }

// Convert our data space into canvas locations.
export interface ViewPort2D {
    ctx: CanvasRenderingContext2D,
    lower: Point2D,
    upper: Point2D,
}

export function to_canvas_space_point(view: ViewPort2D, point: Point2D): Point2D {
    let frac = div_points(sub_points(point, view.lower), sub_points(view.upper, view.lower));
    let size = { x: view.ctx.canvas.width, y: view.ctx.canvas.height };
    let pixels = mul_points(frac, size);
    return pixels;
}

// NOTE: Assumes the canvas's aspect ratio matches the viewport's.
export function to_canvas_space_dist(view: ViewPort2D, dist: number): number {
    const frac = dist / (view.upper.x - view.lower.y);
    const size = view.ctx.canvas.width;
    const pixels = frac * size;
    return pixels;
}

export function to_data_space_point(view: ViewPort2D, pixels: Point2D): Point2D {
    const size = { x: view.ctx.canvas.width, y: view.ctx.canvas.height };
    const frac = div_points(pixels, size);
    const point = add_points(view.lower, mul_points(frac, sub_points(view.upper, view.lower)));
    return point;
}

export function stroke_default(ctx: CanvasRenderingContext2D) {
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

export function fill_default(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "rgba(255, 255, 255, 0)";
}

export function fill_style(ctx: CanvasRenderingContext2D, style: string) {
    ctx.fillStyle = style
}

export function style_default(ctx: CanvasRenderingContext2D) {
    stroke_default(ctx)
    fill_default(ctx);
}

export type StyleSetter = (ctx: CanvasRenderingContext2D) => void;

export function draw_circle(view: ViewPort2D, circle: Circle, style: StyleSetter = style_default) {
    const center = to_canvas_space_point(view, circle.center);
    const radius = to_canvas_space_dist(view, circle.radius);

    view.ctx.beginPath();
    view.ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI);
    style(view.ctx);
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

export class Interactive {
    view: ViewPort2D;
    is_dragging: boolean = false;

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

        let is_dragging = false;

        canvas.addEventListener("mousedown", this._toHandler((m) => {
            if (hit_test(m)) {
                is_dragging = true;
            }
        }))

        canvas.addEventListener("mouseup", (e) => {
            is_dragging = false;
        });

        canvas.addEventListener("mousemove", this._toHandler((m) => {
            if (is_dragging) {
                on_drag(m);
            }
        }));
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
