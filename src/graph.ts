export type RecalcFunc<T> = (self: Value<T>, fired: Value<T>) => void;


/**
 * A value which depends on other values to calculate itself, or they on it.
 * 
 * This can be used to build a graph of dependencies between values which can recalculate themselves
 * as necessary when one changes.
 * 
 * > ![NOTE] 
 * > Obtain instances of this class using the convenience function {@link wrap},
 * > then configure them using {@link Value.set_recalc}.
 * 
 * For example; two vectors `a` and `b` and `b` is a reflection of `a` in the x-axis.
 * Dragging `a` should cause `b` to recalculate its value, similarly dragging `b` should cause `a` to change its position.
 * This would look like the following:
 * 
 * ```javascript
 * const a = wrap(vec2(1.0, 1.0));
 * const a = wrap(vec2(0.0, 0.0)); // Dummy value for now.
 * a.set_recalc([b], (_self, _fired) => { a.value.y = -b.value.y; }) // Modifies `a` when `b.recalc()` is called.
 * b.set_recalc([a], (_self, _fired) => { b.value.y = -a.value.y; }) // Modifies `b` when `a.recalc()` is called.
 * a.fire();
 * console.log(b.value); // >> { x: 1.0, y: -1.0 }
 * b.value.y = 2.0;
 * b.fire();
 * console.log(a.value); // >> { x: 1.0, y: -2.0 }
 * ```
 * 
 * The graph can be more complex than just two values, this just serves as an example.
 * For more complex example you would want to look at the `fired` argument of the {@link RecalcFunc}
 * to decide what and how to recalculate.
 * 
 * > [!TIP]
 * > In reality you would want to call {@link Value.fire} inside the `on_drag` callback of a {@link Draggable}.
 * 
 * > [!WARNING]
 * > If your two `recalc` callbacks are not the inverse of each other you may see weird effects.
 */
export class Value<T> {
    value: T;
    deps: Value<any>[];
    _recalc: RecalcFunc<T>;

    constructor(value: T, deps: Value<any>[], recalc: RecalcFunc<T>) {
        this.value = value;
        this.deps = deps
        this._recalc = recalc;
    }

    recalc(fired: Value<T>): void {
        this._recalc(this, fired);
        this.deps.forEach(dep => {
            if (dep != fired) {
                dep.recalc(this);
            }
        });
    }

    fire(): void {
        this.deps.forEach(dep => {
            dep.recalc(this);
        })
    }

    set_recalc(inputs: Value<any>[], recalc: RecalcFunc<T>): Value<T> {
        this._recalc = recalc;

        inputs.forEach(input => {
            input.deps.push(this);
        });

        return this;
    }
}

/**
 * Obtain an unlinked {@link Value}.
 * 
 * @param value 
 * @returns 
 */
export function wrap<T>(value: T): Value<T> {
    return new Value(value, [], (self, fired) => {
        console.warn("Unset recalc function!");
    });
}

// export function link(value_a: Value<any>, value_b: Value<any>, a_from_b: () => void, b_from_a: () => void) {
//     value_a
// }