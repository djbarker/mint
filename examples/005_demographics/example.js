// @ts-check

import { rect } from "../../dist/2d/shapes.js";
import { Interactive, ViewPort2D } from "../../dist/2d/view.js";
import { AnimationController, annotate_labeled_ticks, annotate_text, arange, clip, cumprod, cumsum, draw_axes, draw_axis_grid, draw_func, draw_h_line, draw_plot, draw_rectangle, stroke_default, sum, vec2 } from "../../dist/mint.js";

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
let exogSlider = document.getElementById("exogBirthRateSlider");
let endogSlider = document.getElementById("endogBirthRateSlider");
let hazardSlider = document.getElementById("hazardRateSlider");

// The viewport to the canvas.
const cpad = 50;
const crect = rect([cpad, canvas.width - cpad], [cpad, canvas.height - cpad]);
const xmax = 120;
const xrng = [0, xmax];
let view_pop = new ViewPort2D(ctx, rect(xrng, [0, 3.6]), crect);
let view_hzd = new ViewPort2D(ctx, rect(xrng, [0, 1.2]), crect);
let view_brt = new ViewPort2D(ctx, rect(xrng, [0, 1.2]), crect);

let years = 0;

const pop = Array(xmax + 1).fill(0);
const age = arange(0, xmax, 1.0);
const tot = Array(500).fill(0);

function hazard(age) {
    const l = 1 - 1 / (1 + Math.exp(- (age - 95) / 5.0));
    return Math.min(Number(hazardSlider.value) * (1 - l), 1.0);
}

function birth(age) {
    const x = (age - 30) / 5;
    const l = Math.exp(- x * x);
    return l * Number(endogSlider.value);
}

/** 
 * @param {AnimationController} anim
 */
function draw(anim) {

    const fps = 40;
    if (anim.total_elapsed_sec > 1 / fps) {
        anim.rezero();
        let rate = 0.0;
        for (let i = xmax - 1; i > 0; i--) {
            rate += pop[i] * birth(i);
            pop[i] = pop[i - 1] * (1 - hazard(i));
        }
        pop[0] = Number(exogSlider.value) + rate;
        // Really dumb but it's fast enough.
        for (let i = 0; i < tot.length - 1; i++) {
            tot[i] = tot[i + 1];
        }
        tot[tot.length - 1] = sum(pop);
        years += 1;
        years = years % 200
    }


    const ytop = canvas.height - 1.2 * cpad;
    let view_tot = new ViewPort2D(ctx, rect([years - tot.length, years - 1], [0, 300]), rect([1.2 * cpad, 1.2 * cpad + 200], [ytop - 100, ytop]))

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    draw_axis_grid(view_pop, 2, 0.2, { linecolor: "#DDDDDD" })
    const xticks = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120];
    annotate_labeled_ticks(view_pop, xticks.map((v) => vec2(v, 0)), 90, xticks.map(String), "outer");
    const yticks = [0, 1];
    annotate_labeled_ticks(view_hzd, yticks.map((v) => vec2(view_hzd.data.width, v)), 180, yticks.map(String), "outer");

    draw_h_line(view_hzd, 1, { linecolor: "#444444" });

    view_pop.with_clip(() => {
        const cumhzd = cumprod(age.map(hazard).map((v) => 1 - v)).map((v) => 1 - v);
        draw_plot(view_hzd, age, cumhzd, { linecolor: "coral", linewidth: 2, linestyle: "dotted" });
        draw_plot(view_brt, age, cumsum(age.map(birth)), { linecolor: "limegreen", linewidth: 2, linestyle: "dashed" });
        draw_func(view_brt, [0, xmax], 0.1, birth, { linecolor: "limegreen", linewidth: 2 });
        draw_func(view_hzd, [0, xmax], 0.1, hazard, { linecolor: "coral", linewidth: 2 });
        draw_plot(view_pop, age, pop, { linecolor: "steelblue", linewidth: 2 });
    });

    draw_rectangle(view_pop, view_pop.data);
    // vec2(-2, view_pop.data.width / 2.0)
    annotate_text(view_pop, "Age", vec2(view_pop.data.width / 2.0, -0.22), ".-");
    annotate_text(view_pop, "Population", vec2(-0.5, view_pop.data.height / 2.0), ".+", 90, { fillcolor: "steelblue" });
    annotate_text(view_pop, "Hazard Rate", vec2(view_pop.data.width + 2.5, view_pop.data.height * 0.75), ".+", -90, { fillcolor: "coral" });
    annotate_text(view_pop, "Birth Rate", vec2(view_pop.data.width + 2.5, view_pop.data.height * 0.25), ".+", -90, { fillcolor: "limegreen" });

    view_tot.with_clip(() => {
        draw_rectangle(view_tot, view_tot.data, { fillcolor: "white" });
        draw_axis_grid(view_tot, 50, 30, { linecolor: "#DDDDDD" });
        draw_plot(view_tot, arange(years - tot.length, years, 1), tot, { linecolor: "darkviolet", linewidth: 2 });
    })
    draw_rectangle(view_tot, view_tot.data, { linecolor: "black" });
    annotate_text(view_tot, "Total Population", view_tot.data.center.map_y((y) => y * 1.9), ".-", 0, { fillcolor: "darkviolet", linecolor: "white", linewidth: 3 });
    // annotate_text(view_tot, "Time", view_tot.data.center.map_y((y) => -y * 0.1), ".-", 0, { fillcolor: "black", linecolor: "white", linewidth: 3 });
}

const anim = new AnimationController()
anim.start(draw);


