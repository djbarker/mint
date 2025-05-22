
export class Value<T> {
    value: T;
    deps: Value<any>[];
    _recalc: (self: Value<T>, fired: Value<T>) => void;

    constructor(value: T, deps: Value<any>[], recalc: (self: Value<T>) => void,) {
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

    set_recalc(inputs: Value<any>[], recalc: (self: Value<T>) => void): Value<T> {
        this._recalc = recalc;

        inputs.forEach(input => {
            input.deps.push(this);
        });

        return this;
    }
}

export function wrap<T>(value: T): Value<T> {
    return new Value(value, [], (fired) => {
        console.log("Unset recalc function. Is this intended?");
    });
}

// export function link(value_a: Value<any>, value_b: Value<any>, a_from_b: () => void, b_from_a: () => void) {
//     value_a
// }