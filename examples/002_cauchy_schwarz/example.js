// @ts-check

import { draw_circle, in_circle, draw_line_seg, Interactive, dot, magnitude, wrap, stroke_width, stroke_style, fill_style, style_default, ViewPort2D, make_segment, rescale_vec, draw_ray, stroke_dash, arg_deg, add_points, draw_poly, draw_arrow_head, style, draw_arc, rotate_cw_deg, draw_right_angle, near_ray, unit_vec_deg, draw_text, expand_vec, sub_points } from "../../dist/mint.js";

/** @type {HTMLCanvasElement} */
let canvas = document.getElementById("theCanvas");

/** @type {CanvasRenderingContext2D} */
let ctx = canvas.getContext("2d");

// The viewport to the canvas.
let view = new ViewPort2D(
    ctx,
    { x: -1, y: -1 },
    { x: 5, y: 5 },
);


const origin = { x: 0, y: 0 };

const rad = 0.1;
const col_a = "darkorange";
const col_b = "steelblue";
const col_r = "rgba(1, 1, 1, 0.1)";

let vect_a = wrap({ x: 1.0, y: 3.0 });
let vect_b = wrap({ x: 3.0, y: 1.0 });

let ray_a = wrap({ start: { x: 0, y: 0 }, angle: 0 });
let ray_b = wrap({ start: { x: 0, y: 0 }, angle: 0 });

ray_a.set_recalc([vect_a], (self, fired) => {
    self.value.angle = arg_deg(vect_a.value);
})

ray_b.set_recalc([vect_b], (self, fired) => {
    self.value.angle = arg_deg(vect_b.value);
})

vect_a.set_recalc([ray_a], (self, fired) => {
    const mag = magnitude(self.value);
    const vec = rescale_vec(unit_vec_deg(ray_a.value.angle), mag);
    vect_a.value = vec;
})

vect_b.set_recalc([ray_b], (self, fired) => {
    const mag = magnitude(self.value);
    const vec = rescale_vec(unit_vec_deg(ray_b.value.angle), mag);
    vect_b.value = vec;
})

let interact = new Interactive(view);

function registerVector(vect) {
    return interact.registerDraggable(10,
        (mouseXY) => in_circle({ center: vect.value, radius: rad }, mouseXY),
        (mouseXY) => {
            vect.value = mouseXY;
            vect.deps.forEach(dep => dep.recalc(vect));
        }
    );
}

const vect_a_int = registerVector(vect_a);
const vect_b_int = registerVector(vect_b);

function registerRay(ray) {
    return interact.registerDraggable(0,
        (mouseXY) => near_ray(ray.value, mouseXY, rad),
        (mouseXY) => {
            const arg = arg_deg(mouseXY);
            ray.value.angle = arg;
            // TODO: push this up into registerDraggable!
            ray.deps.forEach(dep => dep.recalc(ray));
        }
    );
}

const ray_a_int = registerRay(ray_a);
const ray_b_int = registerRay(ray_b);

function draw() {

    // First perform some calculations, before drawing.
    const ab = dot(vect_a.value, vect_b.value);
    const vect_a_proj = rescale_vec(vect_b.value, ab / magnitude(vect_b.value));
    const vect_b_proj = rescale_vec(vect_a.value, ab / magnitude(vect_a.value));

    const vect_a_axis = rotate_cw_deg(vect_a.value, (90 - arg_deg(vect_a.value)));
    const vect_b_axis = rotate_cw_deg(vect_b.value, 0 - arg_deg(vect_b.value));

    const vect_a_proj_axis = rotate_cw_deg(vect_a_proj, (90 - arg_deg(vect_a_proj)));
    const vect_b_proj_axis = rotate_cw_deg(vect_b_proj, 0 - arg_deg(vect_b_proj));

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    style_default(ctx);

    // Draw the axes.
    const grid_style = style({ "linecolor": "rgb(230, 230, 230)" });
    for (let i = -2; i <= 10; i++) {
        draw_line_seg(view, make_segment({ x: 0, y: i / 2 }, 15, 0), grid_style);
        draw_line_seg(view, make_segment({ x: i / 2, y: 0 }, 15, 90), grid_style);
    }
    const axis_style = style({ "linecolor": "rgb(100, 100, 100)" });
    draw_line_seg(view, make_segment(origin, 15, 0), axis_style);
    draw_line_seg(view, make_segment(origin, 15, 90), axis_style);

    // Draw the rays.
    const width_ray_a = ray_a_int.is_hovered ? 2 : 1;
    const width_ray_b = ray_b_int.is_hovered ? 2 : 1;
    draw_ray(view, { start: origin, angle: 0 + arg_deg(vect_a.value) }, style({ linestyle: "dashed", linewidth: width_ray_a }));
    draw_ray(view, { start: origin, angle: 0 + arg_deg(vect_b.value) }, style({ linestyle: "dashed", linewidth: width_ray_b }));
    draw_ray(view, { start: origin, angle: 180 + arg_deg(vect_a.value) }, style({ linestyle: "dashed", linewidth: width_ray_a }));
    draw_ray(view, { start: origin, angle: 180 + arg_deg(vect_b.value) }, style({ linestyle: "dashed", linewidth: width_ray_b }));

    // Draw the rectangles.
    const rect_1 = [origin, vect_a_axis, { x: vect_b_axis.x, y: vect_a_axis.y }, vect_b_axis];
    draw_poly(view, rect_1, style({
        fillcolor: col_r,
        linecolor: "rgba(1, 1, 1, 0)",
    }));

    const rect_2 = [origin, vect_a_proj_axis, { x: vect_b_proj_axis.x, y: vect_a_proj_axis.y }, vect_b_proj_axis];
    draw_poly(view, rect_2, style({
        fillcolor: col_r,
        linecolor: "rgba(1, 1, 1, 0)",
    }));

    // Draw the radii.
    draw_arc(view, origin, magnitude(vect_a.value), arg_deg(vect_a.value), 90, style({ linestyle: "dashed", linecolor: col_a }));
    draw_arc(view, origin, magnitude(vect_b.value), 0, arg_deg(vect_b.value), style({ linestyle: "dashed", linecolor: col_b }));
    draw_arc(view, origin, magnitude(vect_a_proj), arg_deg(vect_a_proj), 90, style({ linestyle: "dashed", linecolor: col_a }));
    draw_arc(view, origin, magnitude(vect_b_proj), 0, arg_deg(vect_b_proj), style({ linestyle: "dashed", linecolor: col_b }));

    // Draw the perpendiculars.
    draw_line_seg(view, { start: vect_a.value, end: vect_a_proj }, style({ linestyle: "dashed", linecolor: col_a }));
    draw_line_seg(view, { start: vect_b.value, end: vect_b_proj }, style({ linestyle: "dashed", linecolor: col_b }));

    draw_right_angle(view, vect_a_proj, 2 * rad, arg_deg(vect_a_proj), "-+", style({ linecolor: col_a }));
    draw_right_angle(view, vect_b_proj, 2 * rad, arg_deg(vect_b_proj), "--", style({ linecolor: col_b }));

    // Draw the main vectors.

    draw_line_seg(view, { start: origin, end: vect_a.value }, (ctx) => { stroke_style(ctx, col_a); stroke_width(ctx, 2) });
    draw_line_seg(view, { start: origin, end: vect_b.value }, (ctx) => { stroke_style(ctx, col_b); stroke_width(ctx, 2) });

    const style_a = (vect_a_int.is_hovered) ? {
        fillcolor: "#c46a00",
        linewidth: 2,
    } : { fillcolor: col_a };

    const style_b = (vect_b_int.is_hovered) ? {
        fillcolor: "#215e8e",
        linewidth: 2,
    } : { fillcolor: col_b };

    draw_circle(view, { center: vect_a.value, radius: rad }, style(style_a));
    draw_circle(view, { center: vect_b.value, radius: rad }, style(style_b));

    const head_a = rescale_vec(vect_a.value, magnitude(vect_a.value) - rad);
    const head_b = rescale_vec(vect_b.value, magnitude(vect_b.value) - rad);
    draw_arrow_head(view, { start: head_a, angle: arg_deg(head_a) }, 3 * rad, 70, style({ linecolor: "off", fillcolor: col_a }));
    draw_arrow_head(view, { start: head_b, angle: arg_deg(head_b) }, 3 * rad, 70, style({ linecolor: "off", fillcolor: col_b }));

    // Draw the projections.
    draw_circle(view, { center: vect_a_proj, radius: rad }, style({ linecolor: "none", fillcolor: col_a }));
    draw_circle(view, { center: vect_b_proj, radius: rad }, style({ linecolor: "none", fillcolor: col_b }));
    // draw_circle(view, { center: vect_a_axis, radius: rad / 1.4 }, style({ linecolor: "none", fillcolor: col_a }));
    // draw_circle(view, { center: vect_b_axis, radius: rad / 1.4 }, style({ linecolor: "none", fillcolor: col_b }));

    // Annotations go last.
    draw_text(view, "a", expand_vec(vect_a.value, 2.5 * rad));
    draw_text(view, "b", expand_vec(vect_b.value, 2.5 * rad));
    const vect_a_perp = sub_points(vect_a_proj, vect_a.value);
    const vect_b_perp = sub_points(vect_b_proj, vect_b.value);
    draw_text(view, "a'", add_points(vect_a_proj, rescale_vec(vect_a_perp, 2.5 * rad)));
    draw_text(view, "b'", add_points(vect_b_proj, rescale_vec(vect_b_perp, 2.5 * rad)));
}


interact.addOnMouseMove((mouseXY) => {
    draw();
});

vect_a.fire();
vect_b.fire();

// Draw the initial setup.
draw();