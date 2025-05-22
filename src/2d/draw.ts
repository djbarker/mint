import { fill_default, stroke_default, style_default, font_default, text_default, StyleT, to_styler } from "../styles.js";
import { deg_to_rad } from "../utils.js";
import { Circle, Line2D, LineSegment2D, Ray2D } from "./shapes.js";
import { add, div, mul, rescale_vec, rotate_cw_deg, unit_vec_deg, vec2, Vect2D } from "./vector.js";
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

export function draw_circle(view: ViewPort2D, circle: Circle, style: StyleT = stroke_default) {
    const center = view.data_to_canvas(circle.center);
    const radius = view.data_to_canvas_dist(circle.radius);

    _draw(view, style, () => {
        view.ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI);
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
 * @param view 
 * @param ray Location and direction of arrow head. In data-space units.
 * @param size In units of canvas pixels.
 * @param angle Controls the "flatness" of the head. In degrees.
 * @param style 
 */
export function draw_arrow_head(view: ViewPort2D, ray: Ray2D, size: number | null = null, angle: number = 70, style: StyleT = fill_default) {
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
    draw_arrow_head(view, { start: vec_to, angle: vec_to.minus(vec_from).arg }, size, 70, style);
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
    draw_line(view, { start: vec2(view.data.lower.x, y), angle: 0 }, style);
}


export function draw_v_line(view: ViewPort2D, x: number, style: StyleT = stroke_default) {
    draw_line(view, { start: vec2(x, view.data.lower.y), angle: 90 }, style);
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


// Will automatically chose the shorter way round.
export function draw_arc(view: ViewPort2D, start: Vect2D, radius: number, angle_start: number, angle_end: number, style: StyleT = stroke_default) {
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

    _draw(view, style, () => {
        view.ctx.beginPath();
        view.ctx.arc(start.x, start.y, radius, deg_to_rad(angle_start), deg_to_rad(angle_end), anticlockwise);
        view.ctx.stroke();
    });
}


export type Quadrant = "++" | "+-" | "--" | "-+";


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


export type Offset = "++" | ".+" | "-+" | "+." | ".." | "-." | "+-" | ".-" | "--";


/**
 * Annotate the plot with some text.
 * 
 * @param view 
 * @param text The text to draw.
 * @param xy Position of the text anchor.
 * @param offset Where to draw relative to the anchor.
 * @param font The font to use.
 * @param style 
 */
export function draw_text(view: ViewPort2D, text: string, xy: Vect2D, offset: Offset = "..", font: string = font_default, style: StyleT = text_default) {
    xy = view.data_to_canvas(xy);

    _draw(view, style, () => {
        view.ctx.font = font;
        view.ctx.textAlign = "center";
        view.ctx.textBaseline = "middle";
        view.ctx.strokeText(text, xy.x, xy.y);
        view.ctx.fillText(text, xy.x, xy.y);
        // Reset font properties
        view.ctx.font = font_default;
        view.ctx.textAlign = "center";
        view.ctx.textBaseline = "middle";
    });
}

/**
 * Draw a plot of the given function.
 * 
 * @param view 
 * @param x_range The range of x values to plot.
 * @param dx The step along the x-axis.
 * @param func The function to calculate the y values.
 * @param style 
 */
export function draw_plot(view: ViewPort2D, x_range: [number, number], dx: number, func: (x: number) => number, style: StyleT = stroke_default) {
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
 * Draw a set of orthogonal axes for the plot.
 * 
 * @param view 
 * @param xlabel Optional label for the x-axis.
 * @param ylabel Optional label for the y-axis.
 * @param size Optional size of the arrow heads.
 * @param font Optional font to use for the labels.
 * @param axis_style 
 * @param label_style
 */
export function draw_axes(view: ViewPort2D, xlabel: string | null = null, ylabel: string | null = null, size: number | null = null, font: string = font_default, axis_style: StyleT = fill_default, label_style: StyleT = text_default) {

    draw_vector(view, vec2(view.data.lower.x, 0), vec2(view.data.upper.x, 0), size, axis_style);
    draw_vector(view, vec2(0, view.data.lower.y), vec2(0, view.data.upper.y), size, axis_style);

    if (xlabel != null) {
        draw_text(view, xlabel, vec2(view.data.upper.x + 0.03 * view.data.width, 0), "..", font, label_style);
    }

    if (ylabel != null) {
        draw_text(view, ylabel, vec2(0, view.data.upper.y + 0.05 * view.data.height), "..", font, label_style);
    }
}
