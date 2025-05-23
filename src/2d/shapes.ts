import { add, dot, magnitude, rescale_vec, rotate_cw_deg, sub, unit_vec_deg, vec2, Vect2D } from "./vector.js";

/**
 * A circle.
 */
export interface Circle {
    center: Vect2D,
    radius: number,
}

/**
 * Hit-test for a {@link Circle}.
 * 
 * @param c The circle to test.
 * @param p The test point.
 * @returns True iff {@link p} is inside {@link c}.
 */
export function in_circle(c: Circle, p: Vect2D): boolean {
    let dx = p.x - c.center.x;
    let dy = p.y - c.center.y;
    return (dx * dx + dy * dy) <= c.radius * c.radius
}

/**
 * A line segment in 2D.
 */
export interface LineSegment2D {
    start: Vect2D,
    end: Vect2D,
}

/**
 * Make a line segment with the specified center point & angle.
 * 
 * @param center The center.
 * @param length The length.
 * @param angle In degrees.
 * @returns 
 */
export function make_segment(center: Vect2D, length: number, angle: number): LineSegment2D {
    const offset = rescale_vec(unit_vec_deg(angle), length / 2.0);
    const start = add(center, rotate_cw_deg(offset, 180));
    const end = add(center, offset);
    return {
        start: start,
        end: end,
    }
}

/**
 * A ray in 2D.
 */
export interface Ray2D {
    /** The origin point of the ray. */
    start: Vect2D,
    /** The argument, in degrees. */
    angle: number,
}

/**
 * Are we close to the given {@link Ray2D}?
 * 
 * Note: Can be used as a hit-test.
 * 
 * @param ray The ray.
 * @param point The point to test for closeness.
 * @param eps Perpendicular distance to the ray which will count as "close".
 * @returns True if {@link point} is within {@link eps} of the ray.
 */
export function near_ray(ray: Ray2D, point: Vect2D, eps: number): boolean {
    point = sub(point, ray.start);
    const r_unit = unit_vec_deg(ray.angle);
    const rc_dot = dot(r_unit, point)
    const c_para = rescale_vec(r_unit, rc_dot);
    const c_perp = sub(point, c_para);
    return (rc_dot > 0) && (magnitude(c_perp) <= eps)
}

/**
 * A line in 2D.
 */
export interface Line2D {
    /** A point on the line. */
    start: Vect2D,
    /** The argument, in degrees. */
    angle: number,
}

/**
 * Are we close to the given {@link Line2D}?
 *
 * Note: Can be used as a hit-test.
 * 
 * @param line The line.
 * @param point The point to test for closeness.
 * @param eps Perpendicular distance to the line which will count as "close".
 * @returns True if {@link point} is within {@link eps} of the line.
 */
export function near_line(line: Line2D, point: Vect2D, eps: number): boolean {
    point = sub(point, line.start);
    const r_unit = unit_vec_deg(line.angle);
    const rc_dot = dot(r_unit, point)
    const c_para = rescale_vec(r_unit, rc_dot);
    const c_perp = sub(point, c_para);
    return (magnitude(c_perp) <= eps);
}

/**
 * A rectangle.
 */
export class Rectangle {
    lower: Vect2D;
    upper: Vect2D;

    constructor(lower: Vect2D, upper: Vect2D) {
        this.lower = lower;
        this.upper = upper;
        if (this.lower.x > this.upper.x || this.lower.y > this.upper.y) {
            console.log("Rectangle bounds flipped!");
        }
    }

    /** The rectangle's size in each dimension. */
    get size(): Vect2D {
        return sub(this.upper, this.lower);
    }

    /** The rectangle's width. */
    get width(): number {
        return this.size.x;
    }

    /** The rectangle's height. */
    get height(): number {
        return this.size.y;
    }

    /** The rectangle's aspect ratio. */
    get aspect(): number {
        return this.height / this.width;
    }

    /**
     * Confine the given vector to be in the rectangle.
     * 
     * @param v 
     * @returns 
     */
    confine(v: Vect2D) {
        const x = Math.min(this.upper.x, Math.max(this.lower.x, v.x));
        const y = Math.min(this.upper.y, Math.max(this.lower.y, v.y));
        return vec2(x, y);
    }
}


/**
 * Construct a {@link Rectangle} from the x & y ranges.
 * 
 * This contrasts to the {@link Rectangle} constructor which takes the lower xy, and the upper xy coordinates.
 * 
 * @param x_range Tuple of `[xmin, xmax]`.
 * @param y_range Tuple of `[ymin, ymax]`.
 * @returns 
 */
export function rect(x_range: [number, number], y_range: [number, number]): Rectangle {
    return new Rectangle(vec2(x_range[0], y_range[0]), vec2(x_range[1], y_range[1]));
}

/**
 * Hit-test for a {@link Rectangle}.
 * 
 * @param rect 
 * @param p 
 * @returns 
 */
export function in_rect(rect: Rectangle, p: Vect2D): boolean {
    return (rect.lower.x <= p.x) && (p.x <= rect.upper.x) && (rect.lower.y <= p.y) && (p.y <= rect.upper.y);
}

