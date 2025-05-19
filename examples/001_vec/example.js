import { draw_circle, in_circle, draw_line_seg, Interactive, rotate_cw_deg, magnitude, wrap, stroke_dash, stroke_style, fill_style, style_default } from "../../dist/mint.js";

let canvas = document.getElementById("theCanvas");
let ctx = canvas.getContext("2d");

canvas.width = 400;
canvas.height = 400;

// The viewport to the canvas.
let view = {
    ctx: ctx,
    lower: { x: -5, y: -5 },
    upper: { x: 5, y: 5 },
};


let circ_a = wrap({ center: { x: 1.0, y: 2.0 }, radius: 0.25 });
let circ_b = wrap({ center: { x: 1.0, y: -2.0 }, radius: 0.25 });
let circ_c = wrap({ center: { x: -1.0, y: -2.0 }, radius: 0.25 });
let circ_d = wrap({ center: { x: 0, y: 0 }, radius: 1.0 });

circ_a = circ_a.with_recalc(
    [circ_b],
    (self, fired) => {
        self.value.center = { x: circ_b.value.center.x, y: -circ_b.value.center.y };
    }
);

circ_b = circ_b.with_recalc(
    [circ_a, circ_c],
    (self, fired) => {
        if (fired == circ_a) {
            self.value.center = { x: circ_a.value.center.x, y: -circ_a.value.center.y };
        }
        if (fired == circ_c) {
            self.value.center = rotate_cw_deg(circ_c.value.center, -45.0);
        }
    }
)

circ_c = circ_c.with_recalc([circ_b],
    (self, fired) => {
        self.value.center = rotate_cw_deg(circ_b.value.center, +45.0);
    }
)

circ_d = circ_d.with_recalc([circ_a], (self, fired) => {
    self.value.radius = magnitude(circ_a.value.center);
})

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    style_default(ctx);
    draw_circle(view, circ_d.value, (ctx) => { stroke_dash(ctx, [5, 3]); stroke_style(ctx, "black"); });
    draw_line_seg(view, { start: { x: 0, y: 0 }, end: circ_a.value.center }, (ctx) => stroke_style(ctx, "darkorange"));
    draw_line_seg(view, { start: circ_a.value.center, end: circ_b.value.center }, (ctx) => stroke_style(ctx, "steelblue"));
    draw_line_seg(view, { start: circ_b.value.center, end: circ_c.value.center }, (ctx) => stroke_style(ctx, "#239b56"));
    draw_circle(view, circ_a.value, (ctx) => fill_style(ctx, "darkorange"));
    draw_circle(view, circ_b.value, (ctx) => fill_style(ctx, "steelblue"));
    draw_circle(view, circ_c.value, (ctx) => fill_style(ctx, "#239b56 "));
}

let interact = new Interactive(view);

let circ_a_selected = false;
let circ_b_selected = false;
let circ_c_selected = false;

interact.onMouseDown((mouseXY) => {
    if (in_circle(circ_a.value, mouseXY)) {
        circ_a_selected = true;
    }

    if (in_circle(circ_b.value, mouseXY)) {
        circ_b_selected = true;
    }

    if (in_circle(circ_c.value, mouseXY)) {
        circ_c_selected = true;
    }
});

interact.onMouseUp((mouseXY) => {
    circ_a_selected = false;
    circ_b_selected = false;
    circ_c_selected = false;
})

interact.onMouseDrag((mouseXY) => {
    if (circ_a_selected) {
        circ_a.value.center = mouseXY;
        circ_a.deps.forEach(dep => dep.recalc(circ_a));
    }

    if (circ_b_selected) {
        circ_b.value.center = mouseXY;
        circ_b.deps.forEach(dep => dep.recalc(circ_b));
    }

    if (circ_c_selected) {
        circ_c.value.center = mouseXY;
        circ_c.deps.forEach(dep => dep.recalc(circ_c));
    }

    draw();
});


circ_a.fire();

draw();