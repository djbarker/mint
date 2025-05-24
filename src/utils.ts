/**
 * Convert an angle in degrees to radians.
 * 
 * @param angle In degrees.
 * @returns In radians.
 */
export function deg_to_rad(angle: number): number {
    return angle * Math.PI / 180.0;
}

/**
 * Convert an angle in radians to degrees.
 * 
 * @param angle In radians.
 * @returns In degrees.
 */
export function rad_to_deg(angle: number): number {
    return angle * 180.0 / Math.PI;
}

/**
 * Get an array of evenly spaced values with the given start, stop & step.
 * 
 * @param start 
 * @param stop 
 * @param step 
 * @returns 
 */
export function arange(start: number, stop: number, step: number): number[] {
    const arr = [];
    let value = start;
    while (value < stop) {
        arr.push(value);
        value += step;
    }
    return arr;
}

/**
 * Calculate the cumulative sum of an array of values.
 * 
 * @param data 
 * @returns 
 */
export function cumsum(data: number[]): number[] {
    const arr = Array(data.length);
    arr[0] = data[0];
    for (let i = 1; i < data.length; i++) {
        arr[i] = arr[i - 1] + data[i];
    }
    return arr;
}

/**
 * Calculate the cumulative product of an array of values.
 * 
 * @param data 
 * @returns 
 */
export function cumprod(data: number[]): number[] {
    const arr = Array(data.length);
    arr[0] = data[0];
    for (let i = 1; i < data.length; i++) {
        arr[i] = arr[i - 1] * data[i];
    }
    return arr;
}

/**
 * Clip an array of values to the specified min & max values.
 * 
 * @param data 
 * @param min 
 * @param max 
 * @returns 
 */
export function clip(data: number[], min: number, max: number): number[] {
    const arr = Array(data.length);
    for (let i = 0; i < data.length; i++) {
        arr[i] = Math.max(Math.min(data[i], max), min);
    }
    return arr;

}