import { fill_default, stroke_default, style_default, text_default, StyleT, to_styler, with_style } from "../styles.js";
import { deg_to_rad } from "../utils.js";
import { Circle, Line2D, LineSegment2D, make_segment, Ray2D, Rectangle } from "./shapes.js";
import { add, rescale_vec, rotate_cw_deg, unit_vec_deg, vec2, Vect2D } from "./vector.js";
import { ViewPort2D } from "./view.js";


/**
 * Wrap the actual drawing to handle the boiler-plate of setting & resetting styles.
 * 
 * @param view 
 * @param style 
 * @param draw Function containing the actual drawing code.
 */
function _draw(view: ViewPort2D, style: StyleT, draw: () => void) {
    style = to_styler(style);
    style(view.ctx);
    view.ctx.beginPath();
    draw();
    style_default(view.ctx);
}

/** This is just a suggestion. */
export function annotation_size(canvas: HTMLCanvasElement): number {
    return Math.max(Math.min(canvas.width, canvas.height) / 60, 10);
}


/**
 * Draw a circle in the data space.
 * 
 * Note: If the viewport's data & canvas aspect ratios differ this will be an ellipse.
 *       If you truely want a circle in all situations (e.g. for annotation or markers) see {@link annotate_circle}.
 * 
 * @param view 
 * @param circle A circle whose radius is in data units.
 * @param style 
 */
export function draw_circle(view: ViewPort2D, circle: Circle, style: StyleT = stroke_default) {
    _draw(view, style, () => {
        view.ctx.beginPath();
        view.arc(circle.center, circle.radius, [0, 360]);
        view.ctx.fill();
        view.ctx.stroke();
    });
}


/**
 * Draw a circle.
 * 
 * @param view 
 * @param center In data units.
 * @param size The diamaeter in canvas units.
 * @param style 
 */
export function annotate_circle(view: ViewPort2D, center: Vect2D, size: number | null = null, style: StyleT = fill_default) {
    if (size == null) {
        size = annotation_size(view.ctx.canvas);
    }
    center = view.data_to_canvas(center);
    _draw(view, style, () => {
        view.ctx.beginPath();
        view.ctx.arc(center.x, center.y, size / 2.0, 0, 2 * Math.PI, true);
        view.ctx.fill();
        view.ctx.stroke();
    });
}


export function draw_line_seg(view: ViewPort2D, seg: LineSegment2D, style: StyleT = stroke_default) {
    const start = view.data_to_canvas(seg.start);
    const end = view.data_to_canvas(seg.end);

    _draw(view, style, () => {
        view.ctx.moveTo(start.x, start.y);
        view.ctx.lineTo(end.x, end.y);
        view.ctx.stroke();
    });
}

/**
 * Draw an arrow head (triangle).
 * 
 * Since we want these to be consistently sized regardless of their roation & between viewports,
 * they are sized in canvas pixels.
 * 
 * @param view 
 * @param ray Location and direction of arrow head. In data-space units.
 * @param size In units of canvas pixels.
 * @param angle Controls the "flatness" of the head. In degrees.
 * @param style 
 */
export function annotate_arrow_head(view: ViewPort2D, ray: Ray2D, size: number | null = null, angle: number = 70, style: StyleT = fill_default) {
    if (size == null) {
        size = annotation_size(view.ctx.canvas);
    }

    // Note: convert to canvas units and get the shape there to maintain aspect ratio & sizing.
    ray = {
        start: view.data_to_canvas(ray.start),
        angle: view.data_to_canvas_angle(ray.angle),
    };

    const beta = 90 - ray.angle + angle;
    const gamma = 90 - angle;
    const unit = unit_vec_deg(-beta)
    const head1 = rescale_vec(unit, size);
    const head2 = rotate_cw_deg(head1, -2 * gamma);

    const points = [
        ray.start,
        ray.start.plus(head1),
        ray.start.plus(head2),
    ];

    // Do not use draw_poly because that expects data-space units.
    _draw(view, style, () => {
        view.ctx.moveTo(points[0].x, points[0].y);
        points.forEach(p => {
            view.ctx.lineTo(p.x, p.y)
        });
        view.ctx.closePath();
        view.ctx.stroke();
        view.ctx.fill();
    });
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
export function draw_vector(view: ViewPort2D, vec_from: Vect2D, vec_to: Vect2D, size: number | null = null, style: StyleT = fill_default) {
    draw_line_seg(view, { start: vec_from, end: vec_to }, style);
    annotate_arrow_head(view, { start: vec_to, angle: vec_to.minus(vec_from).arg }, size, 70, style);
}


export function draw_ray(view: ViewPort2D, ray: Ray2D, style: StyleT = stroke_default) {
    const length = Math.max(view.data.width, view.data.height) * 1.5; // NOTE: 1.5 > sqrt(2);
    let start = ray.start;
    let end = add(ray.start, rescale_vec(unit_vec_deg(ray.angle), length));
    draw_line_seg(view, { start: start, end: end }, style);
}


export function draw_line(view: ViewPort2D, line: Line2D, style: StyleT = stroke_default) {
    const length = Math.max(view.data.width, view.data.height) * 1.5; // NOTE: 1.5 > sqrt(2);
    const start = line.start.plus(rescale_vec(unit_vec_deg(line.angle), -length));
    const end = line.start.plus(rescale_vec(unit_vec_deg(line.angle), +length));
    draw_line_seg(view, { start: start, end: end }, style);
}

export function draw_h_line(view: ViewPort2D, y: number, style: StyleT = stroke_default) {
    draw_line_seg(view, { start: vec2(view.data.lower.x, y), end: vec2(view.data.upper.x, y) }, style);
}


export function draw_v_line(view: ViewPort2D, x: number, style: StyleT = stroke_default) {
    draw_line_seg(view, { start: vec2(x, view.data.lower.y), end: vec2(x, view.data.upper.y) }, style);
}


export function draw_poly(view: ViewPort2D, points: Vect2D[], style: StyleT = fill_default) {
    const start = view.data_to_canvas(points[0]);

    _draw(view, style, () => {
        view.ctx.moveTo(start.x, start.y);
        points.forEach(p => {
            p = view.data_to_canvas(p);
            view.ctx.lineTo(p.x, p.y)
        });
        view.ctx.closePath();
        view.ctx.stroke();
        view.ctx.fill();
    });
}


/*
 * Will automatically chose the shorter way round.
 */
export function draw_arc(view: ViewPort2D, start: Vect2D, radius: number, angle_start: number, angle_end: number, style: StyleT = stroke_default) {

    let delta = angle_end - angle_start;
    if (delta < 0) {
        delta += 360;
    }

    const anticlockwise = delta < 180;

    _draw(view, style, () => {
        view.ctx.beginPath();
        view.arc(start, radius, [angle_start, angle_end], anticlockwise);
        view.ctx.stroke();
    });
}


export type Quadrant = "++" | "+-" | "--" | "-+";


/**
 * Draw a right-angle symbol at the given point with the given angle.
 * The quadrant argument can be used to to set which side of a line the glyph appears.
 * Alternatively this can be set by rotating the angle 90, 180 or 270 degrees.
 * 
 * @param view 
 * @param point The inner corner of the right-angle symbol, in data units.
 * @param size In canvas units.
 * @param angle In data units & degrees.
 * @param quadrant 
 * @param style 
 */
export function draw_right_angle(view: ViewPort2D, point: Vect2D, size: number, angle: number, quadrant: Quadrant, style: StyleT = stroke_default) {
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

    _draw(view, style, () => {
        view.ctx.moveTo(a.x, a.y);
        view.ctx.lineTo(b.x, b.y);
        view.ctx.lineTo(c.x, c.y);
        view.ctx.stroke();
        view.ctx.fill();
    });
}

/**
 * An alternative way to specify the right-angle symbol.
 * This takes two perpendicular vectors and draws the right-angle symbol inbetween them in the 
 * positive direction.
 * 
 * Note: If you pass two non-perpendicular vectors this will still work but will draw a parllelogram.
 * 
 * @param view 
 * @param point The inner corner of the right-angle symbol, in data units.
 * @param vec1 The direction the first side of the right-angle symbol, in data units.
 * @param vec2 The direction the other side of the right-angle symbol, in data units.
 * @param size In canvas units.
 * @param style 
 */
export function draw_right_angle_vecs(view: ViewPort2D, point: Vect2D, vec1: Vect2D, vec2: Vect2D, size: number, style: StyleT = stroke_default) {
    let a = unit_vec_deg(vec1.arg).mul(size);
    let b = unit_vec_deg(vec2.arg).mul(size);
    let c = a.plus(b);

    a = point.plus(a);
    b = point.plus(b);
    c = point.plus(c);

    a = view.data_to_canvas(a);
    b = view.data_to_canvas(b);
    c = view.data_to_canvas(c);

    _draw(view, style, () => {
        view.ctx.moveTo(a.x, a.y);
        view.ctx.lineTo(c.x, c.y);
        view.ctx.lineTo(b.x, b.y);
        view.ctx.stroke();
        view.ctx.fill();
    });
}

export function draw_rectangle(view: ViewPort2D, rect: Rectangle, style: StyleT = style_default) {
    with_style(view.ctx, style, () => {
        view.ctx.beginPath();
        view.rect(rect);
        view.ctx.fill();
        view.ctx.stroke();
    });
}

export function draw_border(view: ViewPort2D, style: StyleT = style_default) {
    draw_rectangle(view, view.data, style);
}

/**
 * Shorthand for how to anchor the text. 
 * The two characters are x and y directions respectively, 
 * with '+' meaning above/right, '.' meaning centered, and '-' meaning below/left.
 */
export type Offset = "++" | ".+" | "-+" | "+." | ".." | "-." | "+-" | ".-" | "--";

/**
 * Convert an angle into the corresponding offset.
 * 
 * This divides the circle into 8 segments corresponding to the offsets (minus "..").
 * 
 * @param angle In degrees.
 * @returns 
 */
export function angle_to_offset(angle: number): Offset {
    angle = (360 + (angle % 360)) % 360; // Make angle in [0, 360).
    if (angle < 45 / 2) {
        return "+.";
    } else if (angle < 45 + 45 / 2) {
        return "++";
    } else if (angle < 90 + 45 / 2) {
        return ".+";
    } else if (angle < 90 + 45 + 45 / 2) {
        return "-+";
    } else if (angle < 180 + 45 / 2) {
        return "-.";
    } else if (angle < 180 + 45 + 45 / 2) {
        return "--";
    } else if (angle < 270 + 45 / 2) {
        return ".-";
    } else if (angle < 270 + 45 + 45 / 2) {
        return "+-";
    } else {
        return "+.";
    }
}

/**
 * Annotate the plot with some text.
 * 
 * @param view 
 * @param text The text to draw.
 * @param xy Position of the text anchor, in data units.
 * @param offset Where to draw relative to the anchor.
 * @param font The font to use.
 * @param angle In degrees.
 * @param style 
 */
export function annotate_text(view: ViewPort2D, text: string, xy: Vect2D, offset: Offset = "..", angle: number = 0, style: StyleT = text_default) {
    xy = view.data_to_canvas(xy);

    let a: CanvasTextAlign | undefined = undefined;
    let b: CanvasTextBaseline | undefined = undefined;
    switch (offset) {
        case "++":
            a = "left";
            b = "bottom";
            break;
        case "+.":
            a = "left";
            b = "middle";
            break;
        case "+-":
            a = "left";
            b = "top";
            break;
        case ".+":
            a = "center";
            b = "bottom";
            break;
        case "..":
            a = "center";
            b = "middle";
            break;
        case ".-":
            a = "center";
            b = "top";
            break;
        case "-+":
            a = "right";
            b = "bottom";
            break;
        case "-.":
            a = "right";
            b = "middle";
            break;
        case "--":
            a = "right";
            b = "top";
            break;
    }

    _draw(view, style, () => {
        view.ctx.save();
        view.ctx.translate(xy.x, xy.y);
        view.ctx.rotate(deg_to_rad(-angle));
        view.ctx.textAlign = a;
        view.ctx.textBaseline = b;
        view.ctx.strokeText(text, 0, 0);
        view.ctx.fillText(text, 0, 0);
        // Reset font properties
        view.ctx.restore();
        view.ctx.textAlign = "center";
        view.ctx.textBaseline = "middle";
    });
}

/**
 * Draw a line plot of the given function.
 * 
 * @param view 
 * @param x_range The range of x values to plot.
 * @param dx The step along the x-axis.
 * @param func The function to calculate the y values.
 * @param style 
 */
export function draw_func(view: ViewPort2D, x_range: [number, number], dx: number, func: (x: number) => number, style: StyleT = stroke_default) {
    _draw(view, style, () => {
        view.moveTo(vec2(x_range[0], func(x_range[0])));
        for (let x = x_range[0] + dx; x < x_range[1]; x += dx) {
            view.lineTo(vec2(x, func(x)));
        }
        view.lineTo(vec2(x_range[1], func(x_range[1])));
        view.ctx.stroke();
    });
}

/**
 * Draw a line plot of the given data.
 * 
 * @param view 
 * @param xdata The x values in data units.
 * @param ydata The y values in data units.
 * @param style 
 */
export function draw_plot(view: ViewPort2D, xdata: number[], ydata: number[], style: StyleT = stroke_default) {
    const imax = Math.min(xdata.length, ydata.length);
    _draw(view, style, () => {
        view.moveTo(vec2(xdata[0], ydata[0]));
        for (let i = 1; i < imax; i++) {
            view.lineTo(vec2(xdata[i], ydata[i]));
        }
        view.ctx.stroke();
    });
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
export function draw_axis_grid(view: ViewPort2D, xspacing: number, yspacing: number, style: StyleT = stroke_default) {
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

/**
 * Draw a set as axes for the plot.
 * 
 * "Maths" style; i.e. a pair of of orthogonal arrows, centered on the origin.
 * 
 * @param view 
 * @param xlabel Optional label for the x-axis.
 * @param ylabel Optional label for the y-axis.
 * @param size Optional size of the arrow heads.
 * @param font Optional font to use for the labels.
 * @param axis_style 
 * @param label_style
 */
export function draw_axes(view: ViewPort2D, xlabel: string | null = null, ylabel: string | null = null, size: number | null = null, axis_style: StyleT = fill_default, label_style: StyleT = text_default) {

    draw_vector(view, vec2(view.data.lower.x, 0), vec2(view.data.upper.x, 0), size, axis_style);
    draw_vector(view, vec2(0, view.data.lower.y), vec2(0, view.data.upper.y), size, axis_style);

    if (xlabel != null) {
        annotate_text(view, xlabel, vec2(view.data.upper.x, 0), "+.", 0, label_style);
    }

    if (ylabel != null) {
        annotate_text(view, ylabel, vec2(0, view.data.upper.y), ".+", 0, label_style);
    }
}


export type TickStyle = "outer" | "inner" | "both";

/**
 * Annotate the plot with an axis tick.
 * 
 * @param view 
 * @param center In data space.
 * @param angle In data space, in degrees.
 * @param tick Inner, outer or both?
 * @param size The length in canvas units.
 * @param style 
 */
export function annotate_tick(view: ViewPort2D, center: Vect2D, angle: number, tick: TickStyle = "both", size: number | null, style: StyleT = stroke_default) {
    if (size == null) {
        size = annotation_size(view.ctx.canvas);
    }

    center = view.data_to_canvas(center);
    angle = view.data_to_canvas_angle(angle);
    const seg = make_segment(center, size, angle);
    if (tick == "outer") {
        seg.end = center;
    } else if (tick == "inner") {
        seg.start = center;
    }
    _draw(view, style, () => {
        view.ctx.beginPath();
        view.ctx.moveTo(seg.start.x, seg.start.y);
        view.ctx.lineTo(seg.end.x, seg.end.y);
        view.ctx.stroke();
    });
}

/**
 * Annotate multiple ticks. 
 * 
 * @param view 
 * @param centers A list of tick centers in data units.
 * @param angles The angle, or angles, of the ticks in degrees in data space.
 * @param tick Inner, outer or both?
 * @param style 
 */
export function annotate_ticks(view: ViewPort2D, centers: Vect2D[], angles: number | number[], tick: TickStyle = "both", size: number | null = null, style: StyleT = stroke_default) {
    if (!Array.isArray(angles)) {
        angles = Array(centers.length).fill(angles)
    }

    for (let i = 0; i < centers.length; i++) {
        annotate_tick(view, centers[i], angles[i], tick, size, style);
    }
}

export type LabelPos = "start" | "end";

/**
 * Annotate a tick with label.
 * 
 * @param view 
 * @param center In data space.
 * @param angle In data space, in degrees.
 * @param label 
 * @param tick Inner, outer or both?
 * @param loc Label the start or end of the tick?
 * @param size In canvas units.
 * @param tick_style 
 * @param text_style 
 */
export function annotate_labeled_tick(view: ViewPort2D, center: Vect2D, angle: number, label: string, tick: TickStyle = "both", loc: LabelPos = "start", size: number | null = null, tick_style: StyleT = stroke_default, text_style: StyleT = text_default) {
    if (size == null) {
        size = annotation_size(view.ctx.canvas);
    }

    annotate_tick(view, center, angle, tick, size, tick_style);

    if (loc == "start") {
        angle = angle + 180;
    }

    const offset = angle_to_offset(angle);
    angle = view.data_to_canvas_angle(angle);
    const off = rescale_vec(unit_vec_deg(angle), 1.2 * size / 2);
    const pos = view.data_to_canvas(center).plus(off).map((v) => view.canvas_to_data(v));
    annotate_text(view, label, pos, offset, 0, text_style);
    // annotate_circle(view, pos, 5, { fillcolor: "red" });
}

/**
 * Annotate multiple ticks with labels.
 * 
 * @param view 
 * @param centers In data space.
 * @param angles The angle, or angles, of the ticks in degrees in data space.
 * @param labels 
 * @param tick Inner, outer or both?
 * @param loc Label the start or end of the tick?
 * @param size In canvas units.
 * @param tick_style 
 * @param text_style 
 */
export function annotate_labeled_ticks(view: ViewPort2D, centers: Vect2D[], angles: number | number[], labels: string[], tick: TickStyle = "both", loc: LabelPos = "start", size: number | null = null, tick_style: StyleT = stroke_default, text_style: StyleT = text_default) {
    if (!Array.isArray(angles)) {
        angles = Array(centers.length).fill(angles)
    }

    for (let i = 0; i < centers.length; i++) {
        annotate_labeled_tick(view, centers[i], angles[i], labels[i], tick, loc, size, tick_style, text_style);
    }
}