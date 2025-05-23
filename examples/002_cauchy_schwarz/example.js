// @ts-check

import { vec2, dot, draw_circle, in_circle, draw_line_seg, Interactive, wrap, style_default, ViewPort2D, rescale_vec, draw_poly, draw_arc, rotate_cw_deg, draw_right_angle, near_ray, unit_vec_deg, annotate_text, expand_vec, Rectangle, draw_vector, draw_line, draw_axes, draw_axis_grid, rect, } from "../../dist/mint.js";

/** @type {HTMLCanvasElement} */
let canvas = document.getElementById("theCanvas");

// Ensure buffer matches the layed-out size.
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

/** @type {CanvasRenderingContext2D} */
let ctx = canvas.getContext("2d");

// The viewport to the canvas.
let view = new ViewPort2D(
    ctx,
    rect([-1, 5], [-1, 5]),
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

        // Draw the axes.
        const grid_style = { "linecolor": "rgb(230, 230, 230)" };
        draw_axis_grid(view, 0.25, 0.25, grid_style);

        const axis_style = { "linecolor": "rgb(100, 100, 100)" };
        draw_axes(view, null, null, 0, axis_style);

        // Draw the rays.
        const width_ray_a = ray_a_int.is_hovered ? 2 : 1;
        const width_ray_b = ray_b_int.is_hovered ? 2 : 1;
        draw_line(view, { start: origin, angle: 0 + vect_a.value.arg }, { linestyle: "dashed", linewidth: width_ray_a });
        draw_line(view, { start: origin, angle: 0 + vect_b.value.arg }, { linestyle: "dashed", linewidth: width_ray_b });

        // Draw the rectangles.
        const rect_1 = [vect_a_proj_axis, vect_a_axis, vec2(vect_b_axis.x, vect_a_axis.y), vect_b_axis, vect_b_proj_axis, vec2(vect_b_proj_axis.x, vect_a_proj_axis.y)];
        draw_poly(view, rect_1, {
            fillcolor: "rgba(50, 218, 78, 0.3)",
            linecolor: "rgba(0, 0, 0, 0)",
        });

        const rect_2 = [origin, vect_a_proj_axis, vec2(vect_b_proj_axis.x, vect_a_proj_axis.y), vect_b_proj_axis];
        draw_poly(view, rect_2, {
            fillcolor: "rgba(202, 199, 29, 0.3)",
            linecolor: "rgba(0, 0, 0, 0)",
        });

        // Annotate the rectangles.
        const s1 = { linewidth: 0, fillcolor: "rgb(0, 100, 17)", linecolor: "off", font: "13px 'PT Serif'" };
        const s2 = { linewidth: 0, fillcolor: "rgb(129, 127, 22)", linecolor: "off", font: "13px 'PT Serif'" };
        annotate_text(view, "|a|.|b|", vec2(vect_b.value.mag, vect_a.value.mag).plus(vec2(-3 * rad, -2 * rad)), "..", s1);
        annotate_text(view, "|a'|.|b'|", vec2(vect_b_proj.mag, vect_a_proj.mag).plus(vec2(-3.2 * rad, -2 * rad)), "..", s2);

        // Draw the radii.
        draw_arc(view, origin, vect_a.value.mag, vect_a.value.arg, 90, { linestyle: "dotted", linecolor: col_a });
        draw_arc(view, origin, vect_b.value.mag, 0, vect_b.value.arg, { linestyle: "dotted", linecolor: col_b });
        draw_arc(view, origin, vect_a_proj.mag, vect_a_proj.arg, 90, { linestyle: "dotted", linecolor: col_a });
        draw_arc(view, origin, vect_b_proj.mag, 0, vect_b_proj.arg, { linestyle: "dotted", linecolor: col_b });

        // Draw the perpendiculars.
        draw_line_seg(view, { start: vect_a.value, end: vect_a_proj }, { linestyle: "dashed", linewidth: 1.5, linecolor: col_a });
        draw_line_seg(view, { start: vect_b.value, end: vect_b_proj }, { linestyle: "dashed", linewidth: 1.5, linecolor: col_b });

        draw_right_angle(view, vect_a_proj, 2 * rad, vect_a_proj.arg, "-+", { linecolor: col_a });
        draw_right_angle(view, vect_b_proj, 2 * rad, vect_b_proj.arg, "--", { linecolor: col_b });

        // Draw the main vectors.

        const head_a = rescale_vec(vect_a.value, vect_a.value.mag - rad);
        const head_b = rescale_vec(vect_b.value, vect_b.value.mag - rad);
        draw_vector(view, origin, head_a, 15, { linewidth: 2, linecolor: col_a, fillcolor: col_a })
        draw_vector(view, origin, head_b, 15, { linewidth: 2, linecolor: col_b, fillcolor: col_b })

        const style_a = (vect_a_int.is_hovered) ? {
            fillcolor: "#c46a00",
            linewidth: 2,
        } : {
            fillcolor: col_a,
            linewidth: 1,
        };

        const style_b = (vect_b_int.is_hovered) ? {
            fillcolor: "#215e8e",
            linewidth: 2,
        } : {
            fillcolor: col_b,
            linewidth: 1,
        };

        draw_circle(view, { center: vect_a.value, radius: rad }, style_a);
        draw_circle(view, { center: vect_b.value, radius: rad }, style_b);


        // Draw the projections.
        draw_circle(view, { center: vect_a_proj, radius: rad }, { linecolor: "none", fillcolor: col_a });
        draw_circle(view, { center: vect_b_proj, radius: rad }, { linecolor: "none", fillcolor: col_b });

        // Annotations go last.
        const font = { font: "14pt 'PT Serif'", fillcolor: "black", linecolor: "white", linewidth: 3 };
        annotate_text(view, "a", expand_vec(vect_a.value, 2.5 * rad), "..", font);
        annotate_text(view, "b", expand_vec(vect_b.value, 2.5 * rad), "..", font);
        const vect_a_perp = vect_a_proj.minus(vect_a.value);
        const vect_b_perp = vect_b_proj.minus(vect_b.value);
        annotate_text(view, "a'", vect_a_proj.plus(rescale_vec(vect_a_perp, 2.5 * rad)), "..", font);
        annotate_text(view, "b'", vect_b_proj.plus(rescale_vec(vect_b_perp, 2.5 * rad)), "..", font);

        annotate_text(view, "|a|", vec2(-2 * rad, vect_a.value.mag), "..", font);
        annotate_text(view, "|a'|", vec2(-2 * rad, vect_a_proj.mag), "..", font);
        annotate_text(view, "|b|", vec2(vect_b.value.mag, -2 * rad), "..", font);
        annotate_text(view, "|b'|", vec2(vect_b_proj.mag, -2 * rad), "..", font);
    });
}


interact.addOnMouseMove((mouseXY) => {
    draw();
});

vect_a.fire();
vect_b.fire();

// Draw the initial setup.
draw();