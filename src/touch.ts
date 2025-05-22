const _seen: Set<HTMLCanvasElement> = new Set();

/**
 * Makes touch events appear like mouse events.
 * 
 * Note: Idempotent.
 * 
 * See: https://stackoverflow.com/questions/1517924/javascript-mapping-touch-events-to-mouse-events
 * 
 * @param canvas 
 */
export function init_touch_to_mouse(canvas: HTMLCanvasElement) {
    if (_seen.has(canvas)) {
        // Do not setup listeners multiple times!
        return;
    }

    function touchHandler(event: TouchEvent) {
        let touches = event.changedTouches,
            first = touches[0],
            type = "";

        switch (event.type) {
            case "touchstart": type = "mousedown"; break;
            case "touchmove": type = "mousemove"; event.preventDefault(); break;
            case "touchend": type = "mouseup"; break;
            default: return;
        }

        let simulatedEvent = new MouseEvent(type, {
            screenX: first.screenX,
            screenY: first.screenY,
            clientX: first.clientX,
            clientY: first.clientY
        });

        // console.log(simulatedEvent, first.target);
        first.target.dispatchEvent(simulatedEvent);
    }

    canvas.addEventListener("touchstart", touchHandler, true);
    canvas.addEventListener("touchmove", touchHandler, true);
    canvas.addEventListener("touchend", touchHandler, true);
    canvas.addEventListener("touchcancel", touchHandler, true);

    _seen.add(canvas);
}