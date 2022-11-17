---
title: g-plugin-matterjs
order: -1
---

Supports [matter.js](https://brm.io/matter-js/) physics engine (rigid bodies only). 2D graphics are initialized to start the simulation, and in addition to gravity and surface friction, external forces can be applied at any time to change the position and rotation angle of the graphics.

The following 2D graphics are supported: [Circle](/en/api/basic/circle), [Rect](/en/api/basic/rect), [Line](/en/api/basic/line), [Image](/en/api/basic/image) and [Polygon](/en/api/basic/polygon).

In this [example](/en/examples/plugins#matterjs), we create a series of dynamic objects that will free fall and end up in a "U-shaped slot".

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*Qw5OQLGQy_4AAAAAAAAAAAAAARQnAQ" width="300px">

## Usage

Create plug-ins and register them in the renderer.

```js
import { Plugin as PluginMatterjs } from '@antv/g-plugin-matterjs';
renderer.registerPlugin(new PluginMatterjs());
```

Use the relevant physical properties in 2D graphics.

```js
new Circle({
    style: {
        rigid: 'dynamic', // Dynamic objects, involved in force calculations
        density: 10, // Density: 10 kg/m2
        r: 10, // Radius: corresponds to 10 meters in the physical world
    },
});
```

## Global Configuration

Global physical world configuration.

### debug

matter.js itself supports rendering. With [debugContainer](/en/plugins/matterjs#debugcontainer) on, you can draw a wireframe of each object in the physics engine world for debug.

```js
const plugin = new PluginMatterjs({
    debug: true,
    debugContainer: document.getElementById('container'),
    debugCanvasWidth: 600,
    debugCanvasHeight: 500,
});
```

For example, the following figure shows a wireframe with three static walls and some dynamic objects.

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*Z5XLQ5zRKzkAAAAAAAAAAAAAARQnAQ" width="300px">

### debugContainer

The type is `HTMLElement`, matter.js will create `<canvas>` inside the container for rendering.

### debugCanvasWidth

The width of the `<canvas>` of type `number` for debugging.

### debugCanvasHeight

The height of the `<canvas>` of type `number` for debugging.

### gravity

The direction of gravity vector, the default value is `[0, 1]`.

https://brm.io/matter-js/docs/classes/Engine.html#property_gravity

For example, if set to `[1, 1]`, the object will naturally move to the lower right corner.

```js
new PluginMatterjs({
  gravity: [1, 1],
}),
```

### gravityScale

Type is `number`, the gravity scaling factor.

https://brm.io/matter-js/docs/classes/Engine.html#property_gravity.scale

### timeStep

Simulation time interval, default value is `1/60`

### velocityIterations

Calculate the number of acceleration iterations, the default value is `4`, the higher the calculation overhead

https://brm.io/matter-js/docs/classes/Engine.html#property_velocityIterations

### positionIterations

Calculate the number of position iterations, the default value is `6`, the higher the computation overhead

https://brm.io/matter-js/docs/classes/Engine.html#property_positionIterations

## Graphical Physical Properties

Most of the following properties are supported for runtime modification, such as modifying the density.

```js
circle.style.density = 100;
```

### rigid

Rigid body type.

-   `'static'` Static objects, such as the ground
-   `'dynamic'` Dynamic objects, calculation of forces

<!-- - kinematic -->

### density

Density, kg/m2. Static objects are 0.

https://brm.io/matter-js/docs/classes/Body.html#property_density

### velocity

Line speed, the default value is `[0, 0]`.

https://brm.io/matter-js/docs/classes/Body.html#property_velocity

### angularVelocity

Angular velocity, the default value is `0`.

https://brm.io/matter-js/docs/classes/Body.html#property_angularVelocity

### friction

Friction, the range is `[0 - 1]`, and the default value is `0.1`. `0` means the object will slide indefinitely, `1` means the object will stop immediately after the force is applied.

https://brm.io/matter-js/docs/classes/Body.html#property_friction

### frictionAir

Defines the friction force in air, `0` means no gravity, the higher the value the more significant the deceleration of the object moving in space, the default value is `0.01`.

https://brm.io/matter-js/docs/classes/Body.html#property_frictionAir

### frictionStatic

The default value is `0.5`.

https://brm.io/matter-js/docs/classes/Body.html#property_frictionStatic

### restitution

The recovery force, in the range `[0 - 1]`. For example, if a ball falls to the ground, it will not bounce if the restoring force is 0.

## Applying an external force to an object

In addition to the simulation by initializing parameters, the position and rotation angle of the object can be changed at any moment by applying external forces.

### applyForce

Method signature, applying a force to a figure at a point.

```ts
applyForce(object: DisplayObject, force: [number, number], point: [number, number])
```

```js
const plugin = new PluginMatterjs();
plugin.applyForce(circle, [10, 0], [0, 0]);
```
