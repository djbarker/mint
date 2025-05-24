// @ts-check

import { in_circle, make_segment, near_line, rect } from "../../dist/2d/shapes.js";
import { unit_vec_deg, vec2 } from "../../dist/2d/vector.js";
import { Interactive, ViewPort2D } from "../../dist/2d/view.js";
import { AnimationController, annotate_circle, annotate_text, draw_axes, draw_axis_grid, draw_border, draw_circle, draw_line, draw_line_seg, draw_plot, draw_poly, draw_rectangle, draw_v_line, rad_to_deg, with_style } from "../../dist/mint.js";

/** @type {HTMLCanvasElement} */
let canvas = document.getElementById("theCanvas");

// Ensure buffer matches the layed-out size.
// canvas.style.width = canvas.clientWidth + "px";
// canvas.style.height = canvas.clientHeight + "px";
// canvas.width = canvas.clientWidth * 1.5;
// canvas.height = canvas.clientHeight * 1.5;
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

/** @type {CanvasRenderingContext2D} */
let ctx = canvas.getContext("2d");

/** @type {HTMLInputElement} */
let slider = document.getElementById("theSlider");

// The viewport to the canvas.
const cpad = 20;
const crect = rect([cpad, canvas.width - cpad], [cpad, canvas.height - cpad]);
const xmax = 2 * crect.width / crect.height;
const xrect = rect([0, xmax], [-1, 1]);
let view_main = new ViewPort2D(ctx, xrect, crect);
let interact = new Interactive(view_main);


// The example function & its gradient.
function theFunc(x) {
    x *= 1.5;
    return (Math.sin(x) + 0.2 * Math.sin(x * 3 + 2) + 0.1 * Math.sin(x + x * x - 1)) / 1.6;
}

function theGrad(x) {
    x *= 1.5;
    return 1.5 * (Math.cos(x) + 0.2 * Math.cos(x * 3 + 2) * 3 + 0.1 * Math.cos(x + x * x - 1) * (2 * x + 1)) / 1.6;
}

let xval = 2.0;
let yval = theFunc(xval);

const xval_int = interact.registerDraggable(
    (m) => in_circle({ center: vec2(xval, yval), radius: 0.05 }, m),
    (m) => {
        xval = m.x;
        yval = theFunc(xval);
    })



function draw(anim) {
    view_main.ctx.clearRect(0, 0, view_main.ctx.canvas.width, view_main.ctx.canvas.height);

    const lval = slider.value; // Lipschitz constant.
    const xyval = vec2(xval, theFunc(xval));
    const dyval = theGrad(xval);
    const dycol = (Math.abs(dyval) > lval) ? "red" : "limegreen";
    const dycol_alpha = (Math.abs(dyval) > lval) ? "rgba(200,20,0,0.1)" : "rgba(20,200,0,0.1)";

    const ang1 = 90 + rad_to_deg(Math.atan2(+1.0, lval));
    const ang2 = 90 + rad_to_deg(Math.atan2(-1.0, lval));

    draw_axis_grid(view_main, Math.PI / 25, 0.1, { "linecolor": "#DDDDDD" });
    draw_axes(view_main, "x", "f");


    function draw_contents(view, lw) {
        draw_plot(view, [0, 2 * Math.PI], 0.005, theFunc, { linecolor: "steelblue", linewidth: lw });

        draw_poly(view, [
            xyval,
            xyval.plus(unit_vec_deg(ang1).mul(100)),
            xyval.plus(unit_vec_deg(ang2).mul(100))
        ], { fillcolor: dycol_alpha })

        draw_poly(view, [
            xyval,
            xyval.plus(unit_vec_deg(180 + ang1).mul(100)),
            xyval.plus(unit_vec_deg(180 + ang2).mul(100))
        ], { fillcolor: dycol_alpha })


        draw_line(view, { start: xyval, angle: ang1 }, { linecolor: dycol, linestyle: "dashed" });
        draw_line(view, { start: xyval, angle: ang2 }, { linecolor: dycol, linestyle: "dashed" });
        // draw_circle(view, { center: xyval, radius: 1 / 2 })
        draw_line_seg(view, make_segment(xyval, 1, rad_to_deg(Math.atan2(dyval, 1.0))), { linecolor: dycol, linewidth: 2 });
    }

    view_main.with_clip(() => {
        draw_contents(view_main, 2);
    });

    const xycol = xval_int.is_hovered ? 15 : 10;
    annotate_circle(view_main, xyval, xycol, { fillcolor: dycol });

    // Draw zoom!
    const dx_zoom = 0.05;
    const view_zoom = new ViewPort2D(ctx,
        rect([xval - dx_zoom, xval + dx_zoom], [yval - dx_zoom, yval + dx_zoom]),
        rect([1.5 * cpad, 150 + 1.5 * cpad], [1.5 * cpad, 150 + 1.5 * cpad])
    );
    view_zoom.with_clip(() => {
        draw_rectangle(view_zoom, view_zoom.data, { fillcolor: "white" });
        draw_axis_grid(view_zoom, Math.PI / 25, 0.1, { linecolor: "#DDDDDD" });
        draw_contents(view_zoom, 4);
    })
    draw_border(view_zoom, { linecolor: "black" });
    // annotate_text(view_zoom, "Zoom:", view_zoom.canvas_to_data(vec2(10, 10)), ".+");
}

const anim = new AnimationController();

anim.start(draw);
