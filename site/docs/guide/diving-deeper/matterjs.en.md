---
title: Using the matter.js Physics Engine
order: 12
---

The [matter.js](https://brm.io/matter-js/) physics engine provides a series of simulation calculations for rigid bodies, such as gravity and surface friction. In addition, external forces can be applied at any time to change the position and rotation of a shape, which helps us to implement some layouts based on real physical rules.

With the support of the [g-plugin-matterjs](/plugins/matterjs) plugin, we can add physical properties to most existing 2D shapes.

In this [example](/examples/plugins/physics-engine/#matterjs), we create a series of dynamic objects, let them free fall, and finally stop in a "U-shaped trough".

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*Qw5OQLGQy_4AAAAAAAAAAAAAARQnAQ" width="300px">

## Registering the Plugin

Create a renderer and register the plugin:

```js
import { Canvas, CanvasEvent } from '@antv/g';
import { Renderer } from '@antv/g-canvas';
import { Plugin as PluginMatterjs } from '@antv/g-plugin-matterjs';

const renderer = new Renderer();
const plugin = new PluginMatterjs();
renderer.registerPlugin(plugin);

const canvas = new Canvas({
    container: 'container',
    width: 600,
    height: 500,
    renderer,
});
```

## Enabling Debug Mode

During development, we often want to render the world of the physics engine to compare it with the "real world".

matter.js itself supports rendering. When enabled, it can be used with [debugContainer](/plugins/matterjs#debugcontainer) to draw the wireframe of each object in the physics engine world, which is convenient for debugging:

```js
const plugin = new PluginMatterjs({
    debug: true,
    debugContainer: document.getElementById('container'),
    debugCanvasWidth: 600,
    debugCanvasHeight: 500,
});
```

For example, the following figure shows the wireframes of three static walls and some dynamic objects:

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*Z5XLQ5zRKzkAAAAAAAAAAAAAARQnAQ" width="300px">

## Creating a Static Ground

We use a [Line](/api/basic/line) to create a flat ground. It is important to pay special attention to the [rigid](/plugins/box2d#rigid) property, and set it to `static` to indicate that it is not affected by forces such as gravity:

```js
const ground = new Line({
    style: {
        x1: 50,
        y1: 400,
        // Omit other properties
        rigid: 'static',
    },
});
canvas.appendChild(ground);
```

## Creating a Dynamic Bouncy Ball

Next, we create a "bouncy ball" that is affected by gravity, where:

- [density](/plugins/matterjs#density) represents the density of the object, in kilograms per cubic meter.
- [restitution](/plugins/matterjs#restitution) represents the coefficient of restitution.

```js
const circle = new Circle({
    style: {
        fill: '#1890FF',
        r: 50,
        rigid: 'dynamic',
        density: 10,
        restitution: 0.5,
    },
});
canvas.appendChild(circle);
```

## Applying External Forces

The plugin will automatically complete the simulation process. You can see the ball free-fall to the ground and bounce.

You can use [applyForce](/plugins/matterjs#applyforce) to apply an external force to a shape. In this [example](/examples/plugins/physics-engine/#matterjs), clicking the button will apply an external force of `[0, -10]` at the `[0, 0]` point of the Circle, so it will bounce upwards:

```js
plugin.applyForce(circle, [0, -10], [0, 0]);
```

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*cen3SLSqkZEAAAAAAAAAAAAAARQnAQ" width="300px">
