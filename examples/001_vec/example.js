import { draw_circle, in_circle, draw_line_seg, Interactive, rotate_cw_deg, magnitude } from "../../dist/mint.js";

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

let circA = { center: { x: 1.0, y: 2.0 }, radius: 0.25 };
let circB = { center: () => ({ x: circA.center.x, y: -circA.center.y }), radius: 0.25 };
let circC = { center: () => rotate_cw_deg(reify(circB).center, 45), radius: 0.3 };
let circD = { center: { x: 0.0, y: 0.0 }, radius: () => magnitude(reify(circB).center) };

function reify(obj) {
    // Not an "object"; return unchanged.
    if (!(typeof obj === "object" && obj !== null && !Array.isArray(obj))) {
        return obj
    }

    // Recursively reify object keys.
    let obj_out = {}
    for (const key in obj) {
        if (typeof obj[key] == "function" && obj[key].length === 0) {
            obj_out[key] = reify(obj[key]());
        } else {
            obj_out[key] = obj[key];
        }
    }

    return obj_out;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let circB_ = reify(circB);
    let circC_ = reify(circC);
    let circD_ = reify(circD);
    draw_circle(view, circD_, "white", "black dotted");
    draw_line_seg(view, { start: { x: 0, y: 0 }, end: circA.center }, "darkorange");
    draw_line_seg(view, { start: circB_.center, end: circA.center }, "steelblue");
    draw_line_seg(view, { start: circB_.center, end: circC_.center }, "#239b56");
    draw_circle(view, circA, "darkorange", "black");
    draw_circle(view, circB_, "steelblue", "black");
    draw_circle(view, circC_, "#239b56 ", "black");
}

let interact = new Interactive(view);
let circA_selected = false;

interact.onMouseDown((mouseXY) => {
    if (in_circle(circA, mouseXY)) {
        circA_selected = true;
    }
});

interact.onMouseUp((mouseXY) => {
    circA_selected = false;
})

interact.onMouseDrag((mouseXY) => {

    if (circA_selected) {
        circA.center = mouseXY;
    }

    draw();
});

draw();