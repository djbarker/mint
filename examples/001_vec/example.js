// @ts-check
import { draw_circle, in_circle, draw_line_seg, Interactive, rotate_cw_deg, wrap, style, ViewPort2D, vec2, rescale_vec, rect } from "../../dist/mint.js";

/** @type {HTMLCanvasElement} */
let canvas = document.getElementById("theCanvas");

/** @type {CanvasRenderingContext2D} */
let ctx = canvas.getContext("2d");

const origin = vec2(0, 0);

canvas.width = 400;
canvas.height = 400;

// The viewport to the canvas.
let view = new ViewPort2D(
    ctx,
    rect([-5, 5], [-5, 5]),
);

let circ_a = wrap({ center: vec2(1.0, 2.0), radius: 0.25 });
let circ_b = wrap({ center: vec2(1.0, -2.0), radius: 0.25 });
let circ_c = wrap({ center: vec2(-1.0, -2.0), radius: 0.25 });
let circ_d = wrap({ center: vec2(0, 0), radius: 0.25 });

function forward(self, downstream) {
    const mag = downstream.value.center.mag;
    const arg = downstream.value.center.arg;
    self.value.center = rescale_vec(rotate_cw_deg(downstream.value.center, 45), mag * 1.2);
}

function backward(self, upstream) {
    const mag = upstream.value.center.mag;
    const arg = upstream.value.center.arg;
    self.value.center = rescale_vec(rotate_cw_deg(upstream.value.center, -45), mag / 1.2);
}

circ_a.set_recalc(
    [circ_b],
    (self, fired) => {
        backward(self, circ_b);
    }
);

circ_b.set_recalc(
    [circ_a, circ_c],
    (self, fired) => {
        if (fired == circ_a) {
            forward(self, circ_a);
        }
        if (fired == circ_c) {
            backward(self, circ_c);
        }
    }
)

circ_c.set_recalc([circ_b, circ_d],
    (self, fired) => {
        if (fired == circ_b) {
            forward(self, circ_b);
        }
        if (fired == circ_d) {
            backward(self, circ_d);
        }
    }
)

circ_d.set_recalc([circ_c], (self, fired) => {
    forward(self, circ_c);
})

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // non-interactive calculations here:
    const mag_a = circ_a.value.center.mag;
    const mag_b = circ_b.value.center.mag;
    const mag_c = circ_c.value.center.mag;
    const mag_d = circ_d.value.center.mag;

    // draw it all
    draw_circle(view, { center: origin, radius: mag_a }, style({ fillcolor: "off", linewidth: 0.5, linecolor: "darkorange", }));
    draw_circle(view, { center: origin, radius: mag_b }, style({ fillcolor: "off", linewidth: 0.5, linecolor: "steelblue", }));
    draw_circle(view, { center: origin, radius: mag_c }, style({ fillcolor: "off", linewidth: 0.5, linecolor: "#239b56", }));
    draw_circle(view, { center: origin, radius: mag_d }, style({ fillcolor: "off", linewidth: 0.5, linecolor: "coral", }));

    draw_line_seg(view, { start: vec2(0, 0), end: circ_a.value.center }, style({ linewidth: 2, linecolor: "darkorange" }));
    draw_line_seg(view, { start: circ_a.value.center, end: circ_b.value.center }, style({ linewidth: 2, linecolor: "steelblue" }));
    draw_line_seg(view, { start: circ_b.value.center, end: circ_c.value.center }, style({ linewidth: 2, linecolor: "#239b56" }));
    draw_line_seg(view, { start: circ_c.value.center, end: circ_d.value.center }, style({ linewidth: 2, linecolor: "coral" }));

    draw_circle(view, circ_a.value, style({ fillcolor: "darkorange" }));
    draw_circle(view, circ_b.value, style({ fillcolor: "steelblue" }));
    draw_circle(view, circ_c.value, style({ fillcolor: "#239b56" }));
    draw_circle(view, circ_d.value, style({ fillcolor: "coral" }));
}

let interact = new Interactive(view);

function registerCircle(circ) {
    interact.registerDraggable(
        (mouseXY) => in_circle(circ.value, mouseXY),
        (mouseXY) => {
            circ.value.center = mouseXY;
            circ.deps.forEach(dep => dep.recalc(circ));
        }
    );
}

registerCircle(circ_a);
registerCircle(circ_b);
registerCircle(circ_c);
registerCircle(circ_d);

interact.addOnMouseDrag((mouseXY) => {
    draw();
});

// Start by assuming a is in the correct position and recalculating the others.
circ_a.fire();

// Draw the initial setup.
draw();