// @ts-check

import { vec2, dot, draw_circle, in_circle, draw_line_seg, Interactive, wrap, stroke_width, stroke_style, style_default, ViewPort2D, make_segment, rescale_vec, draw_ray, draw_poly, draw_arrow_head, style, draw_arc, rotate_cw_deg, draw_right_angle, near_ray, unit_vec_deg, draw_text, expand_vec, Rectangle, } from "../../dist/mint.js";

/** @type {HTMLCanvasElement} */
let canvas = document.getElementById("theCanvas");

/** @type {CanvasRenderingContext2D} */
let ctx = canvas.getContext("2d");

// The viewport to the canvas.
let view = new ViewPort2D(
    ctx,
    new Rectangle(vec2(-1, -1), vec2(5, 5)),
);


const origin = vec2(0, 0);

const rad = 0.1;
const col_a = "darkorange";
const col_b = "steelblue";
const col_r = "rgba(1, 1, 1, 0.1)";

let vect_a = wrap(vec2(1.0, 2.5));
let vect_b = wrap(vec2(4.0, 0.5));

let ray_a = wrap({ start: origin, angle: 0 });
let ray_b = wrap({ start: origin, angle: 0 });

ray_a.set_recalc([vect_a], (self, fired) => {
    self.value.angle = vect_a.value.arg;
})

ray_b.set_recalc([vect_b], (self, fired) => {
    self.value.angle = vect_b.value.arg;
})

vect_a.set_recalc([ray_a], (self, fired) => {
    const mag = self.value.mag;
    const vec = rescale_vec(unit_vec_deg(ray_a.value.angle), mag);
    vect_a.value = vec;
})

vect_b.set_recalc([ray_b], (self, fired) => {
    const mag = self.value.mag;
    const vec = rescale_vec(unit_vec_deg(ray_b.value.angle), mag);
    vect_b.value = vec;
})

let interact = new Interactive(view);

function registerVector(vect) {
    return interact.registerDraggable(
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
    return interact.registerDraggable(
        (mouseXY) => near_ray(ray.value, mouseXY, rad),
        (mouseXY) => {
            ray.value.angle = mouseXY.arg;
            // TODO: push this up into registerDraggable!
            ray.deps.forEach(dep => dep.recalc(ray));
        }
    );
}

const ray_a_int = registerRay(ray_a);
const ray_b_int = registerRay(ray_b);

function draw() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    style_default(ctx);

    // First perform some calculations, before drawing.
    const ab = dot(vect_a.value, vect_b.value);
    const vect_a_proj = rescale_vec(vect_b.value, ab / vect_b.value.mag);
    const vect_b_proj = rescale_vec(vect_a.value, ab / vect_a.value.mag);

    const vect_a_axis = rotate_cw_deg(vect_a.value, (90 - vect_a.value.arg));
    const vect_b_axis = rotate_cw_deg(vect_b.value, 0 - vect_b.value.arg);

    const vect_a_proj_axis = rotate_cw_deg(vect_a_proj, (90 - vect_a_proj.arg));
    const vect_b_proj_axis = rotate_cw_deg(vect_b_proj, 0 - vect_b_proj.arg);

    view.with_clip(() => {

        // draw_poly(view, [vec2(-1, -1), vec2(-1, 5), vec2(5, 5), vec2(5, -1)], style({ fillcolor: "gray" }))

        // Draw the axes.
        const grid_style = style({ "linecolor": "rgb(230, 230, 230)" });
        for (let i = -2; i <= 10; i++) {
            draw_line_seg(view, make_segment(vec2(0, i / 2), 15, 0), grid_style);
            draw_line_seg(view, make_segment(vec2(i / 2, 0), 15, 90), grid_style);
        }
        const axis_style = style({ "linecolor": "rgb(100, 100, 100)" });
        draw_line_seg(view, make_segment(origin, 15, 0), axis_style);
        draw_line_seg(view, make_segment(origin, 15, 90), axis_style);

        // Draw the rays.
        const width_ray_a = ray_a_int.is_hovered ? 2 : 1;
        const width_ray_b = ray_b_int.is_hovered ? 2 : 1;
        draw_ray(view, { start: origin, angle: 0 + vect_a.value.arg }, style({ linestyle: "dashed", linewidth: width_ray_a }));
        draw_ray(view, { start: origin, angle: 0 + vect_b.value.arg }, style({ linestyle: "dashed", linewidth: width_ray_b }));
        draw_ray(view, { start: origin, angle: 180 + vect_a.value.arg }, style({ linestyle: "dashed", linewidth: width_ray_a }));
        draw_ray(view, { start: origin, angle: 180 + vect_b.value.arg }, style({ linestyle: "dashed", linewidth: width_ray_b }));

        // Draw the rectangles.
        const rect_1 = [vect_a_proj_axis, vect_a_axis, vec2(vect_b_axis.x, vect_a_axis.y), vect_b_axis, vect_b_proj_axis, vec2(vect_b_proj_axis.x, vect_a_proj_axis.y)];
        draw_poly(view, rect_1, style({
            fillcolor: "rgba(50, 218, 78, 0.3)",
            linecolor: "rgba(0, 0, 0, 0)",
        }));

        const rect_2 = [origin, vect_a_proj_axis, vec2(vect_b_proj_axis.x, vect_a_proj_axis.y), vect_b_proj_axis];
        draw_poly(view, rect_2, style({
            fillcolor: "rgba(202, 199, 29, 0.3)",
            linecolor: "rgba(0, 0, 0, 0)",
        }));

        // Annotate the rectangles.
        const s1 = style({ linewidth: 0, fillcolor: "rgb(0, 100, 17)", linecolor: "off" });
        const s2 = style({ linewidth: 0, fillcolor: "rgb(129, 127, 22)", linecolor: "off" });
        draw_text(view, "|a|.|b|", vec2(vect_b.value.mag, vect_a.value.mag).plus(vec2(-3 * rad, -2 * rad)), "..", "10pt 'PT Serif'", s1);
        draw_text(view, "|a'|.|b'|", vec2(vect_b_proj.mag, vect_a_proj.mag).plus(vec2(-3.2 * rad, -2 * rad)), "..", "10pt 'PT Serif'", s2);

        // Draw the radii.
        draw_arc(view, origin, vect_a.value.mag, vect_a.value.arg, 90, style({ linestyle: "dotted", linecolor: col_a }));
        draw_arc(view, origin, vect_b.value.mag, 0, vect_b.value.arg, style({ linestyle: "dotted", linecolor: col_b }));
        draw_arc(view, origin, vect_a_proj.mag, vect_a_proj.arg, 90, style({ linestyle: "dotted", linecolor: col_a }));
        draw_arc(view, origin, vect_b_proj.mag, 0, vect_b_proj.arg, style({ linestyle: "dotted", linecolor: col_b }));

        // Draw the perpendiculars.
        draw_line_seg(view, { start: vect_a.value, end: vect_a_proj }, style({ linestyle: "dashed", linewidth: 1.5, linecolor: col_a }));
        draw_line_seg(view, { start: vect_b.value, end: vect_b_proj }, style({ linestyle: "dashed", linewidth: 1.5, linecolor: col_b }));

        draw_right_angle(view, vect_a_proj, 2 * rad, vect_a_proj.arg, "-+", style({ linecolor: col_a }));
        draw_right_angle(view, vect_b_proj, 2 * rad, vect_b_proj.arg, "--", style({ linecolor: col_b }));

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

        const head_a = rescale_vec(vect_a.value, vect_a.value.mag - rad);
        const head_b = rescale_vec(vect_b.value, vect_b.value.mag - rad);
        draw_arrow_head(view, { start: head_a, angle: head_a.arg }, 3 * rad, 70, style({ linecolor: "off", fillcolor: col_a }));
        draw_arrow_head(view, { start: head_b, angle: head_b.arg }, 3 * rad, 70, style({ linecolor: "off", fillcolor: col_b }));

        // Draw the projections.
        draw_circle(view, { center: vect_a_proj, radius: rad }, style({ linecolor: "none", fillcolor: col_a }));
        draw_circle(view, { center: vect_b_proj, radius: rad }, style({ linecolor: "none", fillcolor: col_b }));

        // Annotations go last.
        draw_text(view, "a", expand_vec(vect_a.value, 2.5 * rad), "..", "16px 'PT Serif'");
        draw_text(view, "b", expand_vec(vect_b.value, 2.5 * rad), "..", "16px 'PT Serif'");
        const vect_a_perp = vect_a_proj.minus(vect_a.value);
        const vect_b_perp = vect_b_proj.minus(vect_b.value);
        draw_text(view, "a'", vect_a_proj.plus(rescale_vec(vect_a_perp, 2.5 * rad)), "..", "16px 'PT Serif'");
        draw_text(view, "b'", vect_b_proj.plus(rescale_vec(vect_b_perp, 2.5 * rad)), "..", "16px 'PT Serif'");

        draw_text(view, "|a|", vec2(-2 * rad, vect_a.value.mag), "..", "16px 'PT Serif'");
        draw_text(view, "|a'|", vec2(-2 * rad, vect_a_proj.mag), "..", "16px 'PT Serif'");
        draw_text(view, "|b|", vec2(vect_b.value.mag, -2 * rad), "..", "16px 'PT Serif'");
        draw_text(view, "|b'|", vec2(vect_b_proj.mag, -2 * rad), "..", "16px 'PT Serif'");
    });
}


interact.addOnMouseMove((mouseXY) => {
    draw();
});

vect_a.fire();
vect_b.fire();

// Draw the initial setup.
draw();