import { annotation_size } from "./2d/draw.js";

export function stroke_default(ctx: CanvasRenderingContext2D) {
    fill_off(ctx);
    ctx.lineWidth = 1;
    ctx.strokeStyle = "black";
    ctx.setLineDash([0])
}

export function stroke_dash(ctx: CanvasRenderingContext2D, dash: number, gap: number) {
    ctx.setLineDash([dash, gap]);
}

export function stroke_style(ctx: CanvasRenderingContext2D, style: string) {
    ctx.strokeStyle = style;
}

export function stroke_width(ctx: CanvasRenderingContext2D, width: number) {
    ctx.lineWidth = width;
}

export function stroke_off(ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = "rgba(1, 1, 1, 0)";
    ctx.lineWidth = 0;
}

export function fill_style(ctx: CanvasRenderingContext2D, style: string) {
    ctx.fillStyle = style
}

export function fill_off(ctx: CanvasRenderingContext2D) {
    fill_style(ctx, "rgba(1, 1, 1, 0)");
}

export function fill_default(ctx: CanvasRenderingContext2D) {
    stroke_default(ctx)
    fill_style(ctx, "black");
}

export function style_default(ctx: CanvasRenderingContext2D) {
    ctx.lineWidth = 1;
    ctx.strokeStyle = "black";
    ctx.setLineDash([0]);
    fill_off(ctx);
}

export type StyleSetter = (ctx: CanvasRenderingContext2D) => void;

export interface StyleProps {
    fillcolor?: string | CanvasGradient | CanvasPattern,
    linewidth?: number,
    linecolor?: string | CanvasGradient | CanvasPattern,
    linestyle?: string,
    fontsize?: number,
    font?: string,
}

export function text_default(ctx: CanvasRenderingContext2D) {
    ctx.setLineDash([0]);
    ctx.strokeStyle = "white";
    ctx.lineWidth = 3;
    ctx.fillStyle = "black";
}

/**
 * Convert a {@link StyleProps} object into a {@link StyleSetter} function.
 * 
 * @param props Key-value style properties.
 * @returns A function which operates on the {@link CanvasRenderingContext2D} to set the style.
 */
function as_styler(props: StyleProps): StyleSetter {
    return (ctx: CanvasRenderingContext2D) => {

        if (typeof props.fillcolor !== "undefined") {
            if ((props.fillcolor == "off") || (props.fillcolor == "none")) {
                fill_off(ctx);
            } else {
                ctx.fillStyle = props.fillcolor;
            }
        } else {
            fill_off(ctx);
        }

        if (typeof props.font != "undefined") {
            ctx.font = props.font;
        } else {
            const default_size = annotation_size(ctx.canvas) * 1.6;
            ctx.font = `${default_size}px sans-serif`;
        }

        // Stroke is a bit more tricky, we take the presence of any one property to indicate that
        // we would like a stroke, but we also have to consider the "null" values.

        const has_width = (typeof props.linewidth !== "undefined" && props.linewidth > 0);
        const has_color = (typeof props.linecolor !== "undefined" && props.linecolor != "off" && props.linecolor != "none");
        const has_style = (typeof props.linestyle !== "undefined" && props.linestyle != "off" && props.linestyle != "none");

        const has_stroke = has_width || has_color || has_style;

        if (!has_stroke) {
            stroke_off(ctx);
            return;
        }

        if (typeof props.linewidth !== "undefined") {
            ctx.lineWidth = props.linewidth;
        } else {
            ctx.lineWidth = 1;
        }

        if (typeof props.linecolor !== "undefined") {
            if ((props.linecolor == "off") || (props.linecolor == "none")) {
                stroke_off(ctx);
            } else {
                ctx.strokeStyle = props.linecolor;
            }
        } else {
            ctx.strokeStyle = "black";
        }

        if (typeof props.linestyle !== "undefined") {
            if ((props.linecolor == "off") || (props.linecolor == "none")) {
                stroke_off(ctx);
            } else if (props.linestyle == "solid") {
                ctx.setLineDash([0]);
            } else if (props.linestyle == "dashed") {
                ctx.setLineDash([5, 3]);
            } else if (props.linestyle == "dotted") {
                ctx.setLineDash([2, 3]);
            } else if (props.linestyle == "dashdot") {
                ctx.setLineDash([5, 3, 2, 3]);
            }
        } else {
            ctx.setLineDash([0]);
        }
    };
}


export type StyleT = StyleSetter | StyleProps;


/**
 * If needed, convert a {@link StyleProps} object to a {@link StyleSetter} function.
 * Otherwise, returns the {@link StyleSetter}.
 * 
 * Note: Idempotent.
 * 
 * @param s Either key-value style properties or a styler function.
 * @returns A function which operates on the {@link CanvasRenderingContext2D} to set the style.
 */
export function to_styler(s: StyleT): StyleSetter {
    if (typeof s === "object") {
        s = as_styler(s);
    }
    return s;
}

/**
 * Call the provided drawing callback with the specified styling applied.
 * 
 * Resets to the default style ({@link style_default}) once finished.
 * 
 * @param ctx 
 * @param style 
 * @param draw 
 */
export function with_style(ctx: CanvasRenderingContext2D, style: StyleT, draw: () => void) {
    to_styler(style)(ctx);
    draw();
    style_default(ctx);
}