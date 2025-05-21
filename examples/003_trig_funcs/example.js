// @ts-check

import { rect, ViewPort2D, draw_circle, vec2, draw_axis_grid, style, deg_to_rad, style_default, draw_plot, draw_ray, Interactive, near_ray, rad_to_deg, draw_arrow_head, draw_vector, rescale_vec, draw_v_line, draw_text, draw_axes, near_line, font_default, unit_vec_deg, AnimationController } from "../../dist/mint.js";

/** @type {HTMLCanvasElement} */
let canvas = document.getElementById("theCanvas");

/** @type {CanvasRenderingContext2D} */
let ctx = canvas.getContext("2d");

/** @type {HTMLInputElement} */
const checkbox = document.getElementById("theCheckbox");

const view_c = new ViewPort2D(ctx,
    rect([-1.2, 1.2], [-1.2, 1.2]),
    rect([20, 320], [50, 350]),
);

const view_g = new ViewPort2D(ctx,
    rect([-0.05, 2 * Math.PI], [-1.2, 1.2]),
    rect([340, 820], [50, 350]),
)

let theta = deg_to_rad(30);
const omega = 2 * Math.PI / 10; // 5 seconds per rotation

const int_c = new Interactive(view_c);
const int_g = new Interactive(view_g);

const theta_c_int = int_c.registerDraggable(
    (p) => near_ray({ start: vec2(0, 0), angle: rad_to_deg(theta) }, p, 0.1),
    (p) => {
        theta = deg_to_rad(p.arg);
    }
);

const theta_g_int = int_g.registerDraggable(
    (p) => near_line({ start: vec2(theta, 0), angle: 90 }, p, 0.1),
    (p) => {
        theta = p.x;
    }
)

const anim = new AnimationController();

/** 
 * @param {AnimationController | null} anim
 */
function draw(anim) {

    // Update theta based on time if neither dragging nor static.
    if (anim) {
        if (theta_c_int.is_dragged || theta_g_int.is_dragged) {
            anim.rezero();
        } else {
            theta += omega * anim.frame_elapsed_sec;
            if (theta > Math.PI * 2) {
                theta -= Math.PI * 2
            }
        }
    }

    // Check if any draggables have moved under the mouse.
    int_c.updateHovered();
    int_g.updateHovered();

    // Reset the canvas for redrawing.
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    style_default(ctx);

    const sin_col = "steelblue";
    const cos_col = "darkorange";
    const theta_col = "darkviolet";

    const grid_style = style({ linewidth: 0.5, linecolor: "#cccccc" });
    const sin_style = style({ linewidth: 2, linecolor: sin_col, fillcolor: sin_col });
    const cos_style = style({ linewidth: 2, linecolor: cos_col, fillcolor: cos_col });
    const theta_style = style({ linecolor: theta_col, fillcolor: theta_col });

    const xval = Math.cos(theta);
    const yval = Math.sin(theta);
    const xyvec = vec2(xval, yval);
    const origin = vec2(0, 0);

    draw_axes(view_c, "x", "y", 10);

    view_c.with_clip(() => {
        draw_axis_grid(view_c, 0.2, 0.2, grid_style);

        draw_circle(view_c, { center: origin, radius: 1.0 });

        const wray = theta_c_int.is_hovered ? 2 : 1;

        draw_ray(view_c, { start: origin, angle: xyvec.arg }, style({ linestyle: "dotted", linewidth: wray }));

        ctx.beginPath();
        theta_style(ctx);
        view_c.arc(origin, 0.2, [0, rad_to_deg(theta)])
        ctx.stroke();

        draw_arrow_head(view_c, { start: rescale_vec(xyvec, 0.2), angle: xyvec.arg + 80 }, 10, 70, theta_style)

        // Draw the phasor & its x/y decomposition. 
        draw_vector(view_c, vec2(xval, 0), xyvec, 10, sin_style);
        draw_vector(view_c, origin, vec2(xval, 0), 10, cos_style);
        draw_vector(view_c, origin, xyvec, 10, style({
            fillcolor: theta_c_int.is_hovered ? "#2bad2a" : "limegreen",
            linecolor: theta_c_int.is_hovered ? "#2bad2a" : "limegreen",
            linewidth: wray + 1,
        }))

    });

    draw_axes(view_g, "θ", null, 10);

    view_g.with_clip(() => {
        draw_axis_grid(view_g, 0.3, 0.2, grid_style);

        const s = theta_g_int.is_hovered
            ? { fillcolor: theta_col, linecolor: "#7b00b0", linewidth: 3 }
            : { fillcolor: theta_col, linecolor: theta_col, linewidth: 2 };
        draw_v_line(view_g, theta, style(s));

        draw_plot(view_g, [0, 2 * Math.PI], 0.05, Math.sin, sin_style);
        draw_plot(view_g, [0, 2 * Math.PI], 0.05, Math.cos, cos_style);
    });

    // Draw between the axes
    ctx.beginPath();
    style({ linestyle: "dashed", linecolor: sin_col })(ctx);
    view_g.moveTo(vec2(theta, yval));
    view_c.lineTo(vec2(xval, yval));
    ctx.stroke();

    ctx.beginPath();
    style({ linestyle: "dashed", linecolor: cos_col })(ctx);
    view_c.moveTo(vec2(0, xval));
    view_c.arc(vec2(0, 0), Math.abs(xval), [90 * Math.sign(xval), xval > 0 ? 0 : 180], false);
    ctx.stroke();
    ctx.beginPath();
    view_g.moveTo(vec2(theta, xval));
    view_c.lineTo(vec2(0, xval));
    ctx.stroke();

    // Some final annotations
    draw_text(view_g, "sin(θ)", vec2(0.75 * 2 * Math.PI, -1.1), "..", font_default, style({ linecolor: "none", fillcolor: sin_col }));
    draw_text(view_g, "cos(θ)", vec2(0.50 * 2 * Math.PI, -1.1), "..", font_default, style({ linecolor: "none", fillcolor: cos_col }));
    draw_text(view_c, "θ", rescale_vec(unit_vec_deg(Math.min(rad_to_deg(theta / 2.0), 45)), 0.3), "..", font_default, style({ linecolor: "none", fillcolor: theta_col }));
}

checkbox.addEventListener("click", () => {
    if (checkbox.checked) {
        anim.rezero();
        anim.start(draw);
    } else {
        anim.stop();
    }
});

// We need to redraw on mouse move because we may not be animating, 
// but we still want to update the hover or dragged position.
int_c.addOnMouseMove((m) => draw(null));
int_g.addOnMouseMove((m) => draw(null));

// Kick it off.
anim.start(draw);