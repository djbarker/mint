import { deg_to_rad, rad_to_deg } from "../utils.js";

/**
 * A 2D vector.
 */
export class Vect2D {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    /**
     * Construct a vector with the given x-component value, and the same y-component value.
     * 
     * @param x The new x-component value.
     * @returns 
     */
    with_x(x: number): Vect2D {
        return vec2(x, this.y);
    }

    /**
     * Construct a vector with the same x-component value, and the given y-component value.
     * 
     * @param y The new y-component value.
     * @returns 
     */
    with_y(y: number): Vect2D {
        return vec2(this.x, y);
    }

    /**
     * Map the y-component to a new value, and leave the x-coordinate unchanged.
     * 
     * @param f Function to map the y value.
     * @returns 
     */
    map_y(f: (y: number) => number): Vect2D {
        return vec2(this.x, f(this.y));
    }

    /**
     * Map the x-component to a new value, and leave the y-coordinate unchanged.
     * 
     * @param f Function to map the x value.
     * @returns 
     */
    map_x(f: (x: number) => number): Vect2D {
        return vec2(f(this.x), this.y);
    }

    /**
     * Map the vector to a new vector.
     * 
     * @param f Function to map the vector.
     * @returns 
     */
    map(f: (v: Vect2D) => Vect2D): Vect2D {
        return f(this)
    }

    /**
     * The (Euclidean) norm of the vector.
     */
    get mag(): number {
        return magnitude(this);
    }

    /**
     * The argument of the vector in degrees.
     */
    get arg(): number {
        return arg_deg(this);
    }

    /**
     * Add a vector to this.
     */
    plus(rhs: Vect2D): Vect2D {
        return add(this, rhs);
    }

    /**
     * Subtract a vector from this.
     */
    minus(rhs: Vect2D): Vect2D {
        return sub(this, rhs);
    }

    /**
     * The dot product of this with another vector.
     */
    dot(rhs: Vect2D): number {
        return dot(this, rhs);
    }
}

/**
 * Make a new {@link Vect2D}.
 * 
 * @param x 
 * @param y 
 * @returns The {@link Vect2D} having `x` and `y` as components.
 */
export function vec2(x: number, y: number): Vect2D {
    return new Vect2D(x, y);
}

/**
 * The componentwise absolute value of a vector.
 * 
 * @param v 
 * @returns The vector abs; `b_i = Math.abs(a_i)`.
 */
export function abs(v: Vect2D): Vect2D {
    return vec2(Math.abs(v.x), Math.abs(v.y));
}

/**
 * Add two vectors componentwise.
 * 
 * @param a 
 * @param b 
 * @returns The vector sum; `a + b`.
 */
export function add(a: Vect2D, b: Vect2D): Vect2D {
    return vec2(a.x + b.x, a.y + b.y);
}

/**
 * Subtract two vectors componentwise.
 * 
 * @param a 
 * @param b 
 * @returns The vector difference; `a - b`.
 */
export function sub(a: Vect2D, b: Vect2D): Vect2D {
    return vec2(a.x - b.x, a.y - b.y);
}

/**
 * Divide the components of two vectors.
 * 
 * @param a 
 * @param b 
 * @returns The "vector division"; `c_i = a_i / b_i`.
 */
export function div(a: Vect2D, b: Vect2D): Vect2D {
    return vec2(a.x / b.x, a.y / b.y);
}

/**
 * Multiply the components of two vectors.
 * 
 * @param a 
 * @param b 
 * @returns The "vector multiplication"; `c_i = a_i * b_i`.
 */
export function mul(a: Vect2D, b: Vect2D): Vect2D {
    return vec2(a.x * b.x, a.y * b.y);
}

/**
 * The scalar product of two vectors.
 * 
 * @param a 
 * @param b 
 * @returns The dot product.
 */
export function dot(a: Vect2D, b: Vect2D): number {
    return a.x * b.x + a.y * b.y;
}


/**
 * Rotate a {@link Vect2D} clockwise by the specified angle.
 * 
 * @param a The vector to rotate.
 * @param angle The angle to rotate by (negative for anticlockwise).
 * @returns The rotated vector.
 */
export function rotate_cw_deg(a: Vect2D, angle: number): Vect2D {
    const angle_rad = deg_to_rad(angle);
    return vec2(
        a.x * Math.cos(angle_rad) - a.y * Math.sin(angle_rad),
        a.x * Math.sin(angle_rad) + a.y * Math.cos(angle_rad),
    );
}

/**
 * Set the direction of a vector without changing its length.
 * 
 * @param a The vector whose length to use.
 * @param angle The argument of the new vector.
 * @returns A vector of length `a.mag` with argument of {@link angle}.
 */
export function set_arg(a: Vect2D, angle: number): Vect2D {
    const rad = deg_to_rad(angle);
    const mag = a.mag;
    return vec2(
        mag * Math.cos(rad),
        mag * Math.sin(rad),
    );
}

/**
 * Return the argument of a {@link Vect2D}.
 * 
 * @param a 
 * @returns The clockwise angle from the x-axis in degrees. In the range [0, 360)
 */
export function arg_deg(a: Vect2D): number {
    let arg = Math.atan2(a.y, a.x);
    if (arg < 0) {
        arg += 2 * Math.PI;
    }
    return rad_to_deg(arg);
}

/**
 * The magnitude of a {@link Vect2D}.
 * 
 * @param a 
 * @returns The Euclidean norm of the vector.
 */
export function magnitude(a: Vect2D): number {
    return Math.sqrt(dot(a, a));
}

/**
 * Change the length of a vector without changing its direction.
 * 
 * @param v The vector whose direction to use.
 * @param vmag The length of the new vector.
 * @returns A vector of length {@link vmag} pointing in the direction of {@link v}.
 */
export function rescale_vec(v: Vect2D, vmag: number): Vect2D {
    const mult = vmag / magnitude(v);
    return vec2(
        mult * v.x,
        mult * v.y,
    );
}

/**
 * Add or subtract to the length of a vector without changing its direction.
 * 
 * @param v The vector whose direction to use.
 * @param len The length to change the length of vector by (can be negative).
 * @returns A vector of length ({@link v}.mag + {@link len}) pointing in the direction of {@link v}.
 */
export function expand_vec(v: Vect2D, len: number): Vect2D {
    return rescale_vec(v, magnitude(v) + len);
}


/**
 * Returns a unit vector with the given argument.
 * 
 * @param angle In degrees.
 * @returns A unit vector with the given argument.
 */
export function unit_vec_deg(angle: number) {
    const rad = deg_to_rad(angle);
    return vec2(
        Math.cos(rad),
        Math.sin(rad),
    );
}