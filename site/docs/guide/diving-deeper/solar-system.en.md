---
title: Creating a "Solar System"
order: 1
---

With the knowledge of the [Scene Graph](/guide/diving-deeper/scenegraph), in this tutorial, we will create a "solar system" where the moon revolves around the earth, and the earth revolves around the sun.

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*ZcrHSoLxRS8AAAAAAAAAAAAAARQnAQ)

The following APIs will be involved:

- Using [appendChild](/api/basic/display-object#add-and-remove-nodes) to create parent-child relationships between nodes in the scene.
- Using [translate](/api/basic/display-object#translation) to move nodes.
- Using [rotate](/api/basic/display-object#rotation) to rotate nodes.
- Using [getElementsByName](/api/basic/display-object#simple-node-query) to query nodes in the scene graph.
- Using [addEventListener](/api/event/intro#addeventlistener) to listen for canvas events.

Final example:

- [Official website example](/examples/scenegraph/basic/#hierarchy)
- [CodeSandbox example](https://codesandbox.io/s/jiao-cheng-tai-yang-xi-li-zi-1bphz)

## Creating the Scene Graph

It has the following hierarchical relationship:

```
solarSystem
   |    |
   |   sun
   |
 earthOrbit
   |    |
   |  earth
   |
 moonOrbit
      |
     moon
```

Import the basic objects [Group](/api/basic/group) and [Circle](/api/basic/circle) from the `@antv/g` core package. The former has no renderable entity and only represents the logical concept of a "container," which is suitable for abstract concepts such as "solar system," "earth orbit," and "moon orbit." The latter is used to represent the sun, earth, and moon. When we want to express an "is-a-part-of" relationship, we can use `appendChild`, for example, "the sun is a part of the solar system":

```js
import { Group, Circle } from '@antv/g';

// solarSystem
const solarSystem = new Group({
    name: 'solarSystem',
});
// earthOrbit
const earthOrbit = new Group({
    name: 'earthOrbit',
});
// moonOrbit
const moonOrbit = new Group({
    name: 'moonOrbit',
});
// sun
const sun = new Circle({
    name: 'sun',
    style: {
        r: 100,
    },
});
// earth
const earth = new Circle({
    name: 'earth',
    style: {
        r: 50,
    },
});
// moon
const moon = new Circle({
    name: 'moon',
    style: {
        r: 25,
    },
});

// The sun is a part of the solar system
solarSystem.appendChild(sun);
// The earth's orbit is also a part of the solar system
solarSystem.appendChild(earthOrbit);
earthOrbit.appendChild(earth);
earthOrbit.appendChild(moonOrbit);
moonOrbit.appendChild(moon);
```

You can query nodes in the scene graph at any time using [getElementsByName](/api/basic/display-object#simple-node-query):

```js
canvas.getElementsByName('sun'); // [sun]
```

## Determining the Position

At this point, we use [setPosition](/api/basic/display-object#translation) to move the entire solar system to the center of the canvas. Based on the parent-child relationship in the scene graph, the sun, earth's orbit, earth, moon's orbit, and moon are all moved to `(300, 250)`, as shown in the figure (left) below:

```javascript
// Set the position of the solar system
solarSystem.setPosition(300, 250);
```

Keeping the sun's position unchanged, we move the earth's orbit 100 along the X-axis. The earth, moon's orbit, and moon are also moved to `(400, 250)` in the world coordinate system, as shown in the figure (middle) below:

```javascript
earthOrbit.translate(100, 0);
// earthOrbit.getLocalPosition() --> (100, 0)
// earthOrbit.getPosition() --> (400, 250)
```

Then we move the moon's orbit, as shown in the figure (right) below:

```javascript
moonOrbit.translate(100, 0);
```

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*XcUqQJowVKMAAAAAAAAAAAAAARQnAQ)

## Making it Rotate

Now we need to make both the earth and the moon rotate. First, use [addEventListener](/api/event/intro#addeventlistener) to add an event listener to the canvas to listen for the [AFTER_RENDER](/api/canvas/event#canvas-specific-events) event, which is triggered after each frame is rendered. Then we make the solar system and the earth's orbit rotate 1 degree along the Z-axis in their local coordinate systems (you can also make the earth's orbit rotate faster):

```javascript
import { CanvasEvent } from '@antv/g';

// When each frame of the canvas is rendered...
canvas.addEventListener(CanvasEvent.AFTER_RENDER, () => {
    // The solar system rotates on its own axis
    solarSystem.rotateLocal(1);
    // The earth's orbit rotates on its own axis
    earthOrbit.rotateLocal(1);
});
```
