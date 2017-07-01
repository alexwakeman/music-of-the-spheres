import {Object3D, Quaternion} from 'THREE';

export default class Utils {
    /**
     *
     * @param a - min
     * @param b - max
     * @param c - value to clamp
     * @returns {number}
     */
    static clamp(a, b, c): number {
       return Math.max(b,Math.min(c,a));
    }

    /**
     * Given positive x return 1, negative x return -1, or 0 otherwise
     * @param x
     * @returns {number}
     */
    static sign(x: number): number {
        return x > 0 ? 1 : x < 0 ? -1 : 0;
    };

    static renormalizeQuarternion(object: Object3D): Quaternion {
        let clone = object.clone();
		let q = clone.quaternion;
		let magnitude = Math.sqrt(Math.pow(q.w, 2) + Math.pow(q.x, 2) + Math.pow(q.y, 2) + Math.pow(q.z, 2));
		q.w /= magnitude;
		q.x /= magnitude;
		q.y /= magnitude;
		q.z /= magnitude;
		return q;
    }
}