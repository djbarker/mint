import { draw_circle, in_circle, draw_line_seg, Interactive, dot, magnitude, wrap, stroke_width, stroke_style, fill_style, style_default, ViewPort2D, make_segment, rescale_vec, draw_ray, stroke_dash, arg_deg, add_points, draw_poly, draw_arrow_head, style, draw_arc, rotate_cw_deg } from "../../dist/mint.js";

let canvas = document.getElementById("theCanvas");
let ctx = canvas.getContext("2d");

canvas.width = 400;
canvas.height = 400;

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
    draw_ray(view, { start: origin, angle: 0 + arg_deg(vect_a.value) }, (ctx) => { stroke_dash(ctx, 2, 4) });
    draw_ray(view, { start: origin, angle: 0 + arg_deg(vect_b.value) }, (ctx) => { stroke_dash(ctx, 2, 4) });
    draw_ray(view, { start: origin, angle: 180 + arg_deg(vect_a.value) }, (ctx) => { stroke_dash(ctx, 2, 4) });
    draw_ray(view, { start: origin, angle: 180 + arg_deg(vect_b.value) }, (ctx) => { stroke_dash(ctx, 2, 4) });

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

    // Draw the main vectors.

    draw_line_seg(view, { start: origin, end: vect_a.value }, (ctx) => { stroke_style(ctx, col_a); stroke_width(ctx, 2) });
    draw_line_seg(view, { start: origin, end: vect_b.value }, (ctx) => { stroke_style(ctx, col_b); stroke_width(ctx, 2) });

    const style_a = (ctx) => {
        fill_style(ctx, (vect_a_int.is_hovered) ? "#c46a00" : col_a);
    }

    const style_b = (ctx) => {
        fill_style(ctx, (vect_b_int.is_hovered) ? "#215e8e" : col_b);
    }

    draw_circle(view, { center: vect_a.value, radius: rad }, style_a);
    draw_circle(view, { center: vect_b.value, radius: rad }, style_b);

    const head_a = rescale_vec(vect_a.value, magnitude(vect_a.value) - rad);
    const head_b = rescale_vec(vect_b.value, magnitude(vect_b.value) - rad);
    draw_arrow_head(view, { start: head_a, angle: arg_deg(head_a) }, 2 * rad, 60, style({ linecolor: "off", fillcolor: col_a }));
    draw_arrow_head(view, { start: head_b, angle: arg_deg(head_b) }, 2 * rad, 60, style({ linecolor: "off", fillcolor: col_b }));

    // Draw the projections.
    draw_circle(view, { center: vect_a_proj, radius: rad / 1.4 }, style({ linecolor: "none", fillcolor: col_a }));
    draw_circle(view, { center: vect_b_proj, radius: rad / 1.4 }, style({ linecolor: "none", fillcolor: col_b }));
    // draw_circle(view, { center: vect_a_axis, radius: rad / 1.4 }, style({ linecolor: "none", fillcolor: col_a }));
    // draw_circle(view, { center: vect_b_axis, radius: rad / 1.4 }, style({ linecolor: "none", fillcolor: col_b }));
}


interact.addOnMouseMove((mouseXY) => {
    draw();
});

vect_a.fire();
vect_b.fire();

// Draw the initial setup.
draw();