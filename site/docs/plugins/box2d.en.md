---
title: g-plugin-box2d
order: -1
---

Supports [Box2D](https://box2d.org/documentation/) physics engine (rigid bodies only). 2D graphics are initialized to start the simulation, and in addition to gravity and surface friction, external forces can be applied at any time to change the position and rotation angle of the graphics.

The WASM method is loaded at runtime and the UMD is used for entry.

-   version 2.4 https://github.com/Birch-san/box2d-wasm
-   version 2.3 & 2.2 https://github.com/kripken/box2d.js

Currently using Box2D latest version 2.4, refer to the documentation: https://box2d.org/documentation/。

The following 2D graphics are supported: [Circle](/en/api/basic/circle), [Rect](/en/api/basic/rect), [Line](/en/api/basic/line), [Image](/en/api/basic/image) and [Polygon](/en/api/basic/polygon).

In this [example](/en/examples/plugins#box2d), we create a series of dynamic objects that will free fall and end up in a "U-shaped slot".

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*Qw5OQLGQy_4AAAAAAAAAAAAAARQnAQ" width="300px">

## Usage

Create plug-ins and register them in the renderer.

```js
import { Plugin as PluginBox2D } from '@antv/g-plugin-box2d';
renderer.registerPlugin(new PluginBox2D());
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

### gravity

The gravity direction vector, the default value is `[0, 100]`.

For example, if it is set to `[100, 100]`, the object will naturally move to the lower right corner: `[100, 100]`.

```js
new PluginBox2D({
  gravity: [100, 100],
}),
```

### timeStep

Simulation time interval, default value is `1/60`

### velocityIterations

Calculate the number of acceleration iterations, the default value is `8`, the higher the calculation overhead

### positionIterations

Calculate the number of position iterations, the default value is `3`, the higher the computation overhead

### onContact

It is possible to listen to the surface contact of two objects.

```js
new PluginBox2D({
  onContact: (objectA, objectB) => {
    // The surfaces of two objects come into contact
  }
}),
```

https://box2d.org/documentation/md__d_1__git_hub_box2d_docs_dynamics.html#autotoc_md105

## Graphical Physical Properties

Box2D uses the following physical units: meters, kilograms, and seconds.

https://box2d.org/documentation/md__d_1__git_hub_box2d_docs_loose_ends.html#autotoc_md124

> Box2D uses MKS (meters, kilograms, and seconds) units and radians for angles.

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

### linearVelocity

Line speed, the default value is `[0, 0]`.

### angularVelocity

Angular velocity, the default value is `0`.

### gravityScale

Gravity factor, the default value is `1`.

https://box2d.org/documentation/md__d_1__git_hub_box2d_docs_dynamics.html#autotoc_md60

### linearDamping

Damping, the default value is `0`.

https://box2d.org/documentation/md__d_1__git_hub_box2d_docs_dynamics.html#autotoc_md59

### angularDamping

AngularDamping, the default value is `0`.

https://box2d.org/documentation/md__d_1__git_hub_box2d_docs_dynamics.html#autotoc_md59

### fixedRotation

Fixed rotation angle, the default value is `false`.

https://box2d.org/documentation/md__d_1__git_hub_box2d_docs_dynamics.html#autotoc_md62

### bullet

The default value is `false`。

https://box2d.org/documentation/md__d_1__git_hub_box2d_docs_dynamics.html#autotoc_md63

### friction

Friction, The default value is `[0 - 1]`.

### restitution

The recovery force, in the range `[0 - 1]`. For example, if a ball falls to the ground, it will not bounce if the restoring force is 0.

## [WIP] Applying an external force to an object

In addition to the simulation by initializing parameters, the position and rotation angle of the object can be changed at any moment by applying external forces.

https://box2d.org/documentation/md__d_1__git_hub_box2d_docs_dynamics.html#autotoc_md71

```c++
void b2Body::ApplyForce(const b2Vec2& force, const b2Vec2& point);
void b2Body::ApplyTorque(float torque);
void b2Body::ApplyLinearImpulse(const b2Vec2& impulse, const b2Vec2& point);
void b2Body::ApplyAngularImpulse(float impulse);
```

### applyForce

```js
const plugin = new PluginBox2D();
plugin.applyForce(circle, [0, 0], [0, 0]);
```

### applyTorque

### applyLinearImpulse

### applyAngularImpulse

## [WIP] Joint

Box2D provides a series of descriptions of the connections between the physics that cause the forces to occur.

https://box2d.org/documentation/md__d_1__git_hub_box2d_docs_dynamics.html#autotoc_md82

## [WIP] Fluids

Using liquidfun: https://github.com/Birch-san/box2d-wasm/blob/c04514c040/README.md#alternative-distributions
