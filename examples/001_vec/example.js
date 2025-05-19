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

interact.addOnMouseDrag((mouseXY) => {
    draw();
});

// Start by assuming a is in the correct position and recalculating the others.
circ_a.fire();

// Draw the initial setup.
draw();