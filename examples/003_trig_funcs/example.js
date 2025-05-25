// @ts-check

import { rect, ViewPort2D, draw_circle, vec2, draw_axis_grid, deg_to_rad, style_default, draw_ray, Interactive, near_ray, rad_to_deg, annotate_arrow_head, draw_vector, rescale_vec, draw_v_line, annotate_text, draw_axes, near_line, unit_vec_deg, AnimationController, with_style, annotate_circle, annotation_size, annotate_labeled_ticks, annotate_ticks, expand_vec, draw_func, setup_canvas } from "../../dist/mint.js";

/** @type {HTMLCanvasElement} */
// @ts-ignore
let canvas = document.getElementById("theCanvas");

/** @type {CanvasRenderingContext2D} */
// @ts-ignore
let ctx = canvas.getContext("2d");

/** @type {HTMLInputElement} */
// @ts-ignore
const checkbox = document.getElementById("theCheckbox");

/** @type {HTMLInputElement} */
// @ts-ignore
const slider = document.getElementById("theSlider");

// Set the canvas' buffer size based on the element's layed-out size.
const [w, h] = setup_canvas(ctx);

const circ_width = h - 30;
const y_pad = (h - circ_width) / 2;
const y_range = [y_pad, h - y_pad];

const view_c = new ViewPort2D(ctx,
    rect([-1.2, 1.2], [-1.2, 1.2]),
    // @ts-ignore
    rect([10, 10 + circ_width], y_range),
);

const view_g = new ViewPort2D(ctx,
    rect([0, 2 * Math.PI], [-1.2, 1.2]),
    // @ts-ignore
    rect([50 + circ_width, w - 20], y_range),
)

let theta = deg_to_rad(30);

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

const asz = annotation_size(canvas);

/** 
 * @param {AnimationController | null} anim
 */
function draw(anim) {

    // Update theta based on time if neither dragging nor static.
    if (anim) {
        // @ts-ignore
        const omega = 2 * Math.PI / slider.value;

        if (theta_c_int.is_dragged || theta_g_int.is_dragged) {
            anim.rezero();
        } else {
            theta += omega * anim.frame_elapsed_sec;
            if (theta > Math.PI * 2) {
                theta -= Math.PI * 2
            }

            // Check if any draggables have moved under the mouse.
            int_c.updateHovered();
            int_g.updateHovered();
        }
    }


    // Reset the canvas for redrawing.
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    style_default(ctx);

    const sin_col = "steelblue";
    const cos_col = "darkorange";
    const theta_col = "darkviolet";

    const grid_style = { linewidth: 0.5, linecolor: "#cccccc" };
    const sin_style = { linewidth: 2, linecolor: sin_col, fillcolor: sin_col };
    const cos_style = { linewidth: 2, linecolor: cos_col, fillcolor: cos_col };
    const theta_style = { linecolor: theta_col, fillcolor: theta_col };

    const xval = Math.cos(theta);
    const yval = Math.sin(theta);
    const xyvec = vec2(xval, yval);
    const origin = vec2(0, 0);

    draw_axis_grid(view_c, 0.1, 0.1, grid_style);
    draw_axes(view_c, "x", "y");

    view_c.with_clip(() => {

        draw_circle(view_c, { center: origin, radius: 1.0 });

        const labels = ["30°", "45°", "60°"];
        const angles_r = [Math.PI / 6, Math.PI / 4, Math.PI / 3];
        const centers = angles_r.map((a) => vec2(Math.cos(a), Math.sin(a)));
        const angles_d = angles_r.map(rad_to_deg);
        annotate_labeled_ticks(view_c, centers, angles_d, labels, "both", "end");

        const wray = theta_c_int.is_hovered ? 2 : 1;

        draw_ray(view_c, { start: origin, angle: xyvec.arg }, { linestyle: "dotted", linewidth: wray });

        with_style(ctx, theta_style, () => {
            ctx.beginPath();
            view_c.arc(origin, 0.2, [0, rad_to_deg(theta)], true)
            ctx.stroke();
        });

        annotate_arrow_head(view_c, { start: rescale_vec(xyvec, 0.2), angle: xyvec.arg + 80 }, asz, 70, theta_style);

        // Draw the phasor & its x/y decomposition. 
        const phasor_col = theta_c_int.is_hovered ? "#2bad2a" : "limegreen";
        const xvec = vec2(xval, 0);
        const xyvec_ = xyvec.minus(xvec).map((v) => expand_vec(v, -0.03)).plus(xvec);
        draw_vector(view_c, xvec, xyvec_, 10, sin_style);
        draw_vector(view_c, origin, xvec, 10, cos_style);
        draw_vector(view_c, origin, expand_vec(xyvec, -0.03), 10, {
            fillcolor: phasor_col,
            linecolor: phasor_col,
            linewidth: wray + 1,
        })
        draw_circle(view_c, { center: xyvec, radius: 0.03 }, { fillcolor: phasor_col });

    });

    draw_axis_grid(view_g, 0.15, 0.1, grid_style);
    draw_axes(view_g, "θ", null);

    annotate_ticks(view_g, [-1, -0.5, 0, 0.5, 1].map((v) => vec2(0, v)), 0);
    annotate_ticks(view_g, [Math.PI / 2, Math.PI, 3 * Math.PI / 2, 2 * Math.PI].map((v) => vec2(v, 0)), 90);

    view_g.with_clip(() => {
        draw_func(view_g, [0, 2 * Math.PI], 0.05, Math.sin, sin_style);
        draw_func(view_g, [0, 2 * Math.PI], 0.05, Math.cos, cos_style);
    });

    annotate_labeled_ticks(view_g, [-1, -0.5, 0, 0.5, 1].map((v) => vec2(0, v)), 0, ["-1", "-0.5", "0", "0.5", "1"], "both", "start", asz, { linecolor: "none" });
    annotate_labeled_ticks(view_g, [Math.PI / 2, Math.PI, 3 * Math.PI / 2, 2 * Math.PI].map((v) => vec2(v, 0)), 90, ["π/2", "π", "3π/2", "2π"], "both", "start", asz, { linecolor: "none" });

    // view_g.with_clip(() => {
    const s = theta_g_int.is_hovered
        ? { fillcolor: theta_col, linecolor: "#7b00b0", linewidth: 3 }
        : { fillcolor: theta_col, linecolor: theta_col, linewidth: 2 };
    draw_v_line(view_g, theta, s);
    // })

    // Draw between the axes
    with_style(ctx, { linestyle: "dashed", linecolor: sin_col }, () => {
        ctx.beginPath();
        view_g.moveTo(vec2(theta, yval));
        view_c.lineTo(vec2(xval, yval));
        ctx.stroke();
    });

    with_style(ctx, { linestyle: "dashed", linecolor: cos_col }, () => {
        ctx.beginPath();
        view_c.moveTo(vec2(0, xval));
        view_c.arc(vec2(0, 0), Math.abs(xval), [90 * Math.sign(xval), xval > 0 ? 0 : 180], false);
        ctx.stroke();

        ctx.beginPath();
        view_g.moveTo(vec2(theta, xval));
        view_c.lineTo(vec2(0, xval));
        ctx.stroke();
    });

    annotate_circle(view_g, vec2(theta, xval), asz, { fillcolor: cos_col });
    annotate_circle(view_g, vec2(theta, yval), asz, { fillcolor: sin_col });

    // Some final annotations
    annotate_text(view_g, "sin(θ)", vec2(0.75 * 2 * Math.PI, -1.1), "..", 0, { linewidth: 3, linecolor: "white", fillcolor: sin_col });
    annotate_text(view_g, "cos(θ)", vec2(0.50 * 2 * Math.PI, -1.1), "..", 0, { linewidth: 3, linecolor: "white", fillcolor: cos_col });
    annotate_text(view_c, "θ", rescale_vec(unit_vec_deg(Math.min(rad_to_deg(theta / 2.0), 45)), 0.3), "..", 0, { linewidth: 3, linecolor: "white", fillcolor: theta_col });
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
if (checkbox.checked) {
    anim.start(draw);
} else {
    draw(null);
}