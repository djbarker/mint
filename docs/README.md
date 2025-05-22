# Documentation

The code/API is documented in code as JSDoc comments comprehensively.
However there is no supplemental documentation, such as an introduction or basic tutorials.
In lieu of actual documentation, here are some breadcrumbs to get started ... 

### Basic Plotting

See `2d.vector.*`, `2d.shapes.*`, `2d.view.*`, `2d.draw.*`, `styles.*`.

Ultimately, you need a function which will draw your visualization to the canvas (`draw()` say).
To achieve this, briefly, you need to follow the following steps.
Create your objects & perform any calculations you need.
The objects can be simple vectors (see `Vect2D`) or shapes (see `2d.shapes`), and will typically live outside your `draw` function.
These can be drawn to the canvas with the functions under `2d.draw`, 
which take a `ViewPort2D` to convert between your units and canvas pixels.

### Interactivity

See `2d.view.Interactive`.

Interactivity can be added by wrapping your viewport in a `Interactive`.
This hooks up some mouse event handlers and automatically filters to events inside the ViewPort (it needn't fill the whole canvas.)
You can then register `Draggable` objects by providing a hit-test & a callback for when the object is dragged.
The `Draggable` instances expose both the 'hovered' and the 'dragged' state for you to inspect inside your `draw` function.

### Animation

See `anim.AnimationController`.

The animation is controlled by using the `AnimationController` which allows us to start & stop animating
(there is no point re-rendering if nothing is changing.)
Behind the scenes this calls [`requestAnimationFrame`](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame), 
but handles common pitfalls around scheduling duplicate frames,
and exposes things like time elapsed (total and since the last frame), etc.

> [!NOTE]
> If using `AnimationController` note that `draw` receives the controller as an argument,
> allowing you to query time elapsed and stop the animation if needed.

> [!TIP]
> You can also call `draw` manually on, say, a mouse move event and pass in `null` to distinguish
> the call from a normal animation call.
> See, for example, [`examples/003_trig_funcs`](../examples/003_trig_funcs/example.js).

### Graph

See `graph.*`

This is a basic computational graph where we can register callbacks to recompute out values, 
when others change their value (and vice-versa).
This is useful for updating dependent values when an object is dragged around the screen or otherwise animated.
This is used in [`examples/001_vec`](../examples/001_vec/example.js) to update a chain of points on the screen.

> [!TIP]
> For simple situations it may actually be easier to rely on recalculating things inside `draw()`,
> but you may need to check the dragged state to work out which value changed.
