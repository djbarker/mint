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
