---
title: Scene Graph
order: 0
---

A [Scene Graph](https://en.wikipedia.org/wiki/Scene_graph) is a data structure used to organize and manage a 2D/3D virtual scene. It is a directed acyclic graph. The scene graph provides two main capabilities:

1. Describing parent-child relationships
2. Automatically completing certain complex cascading calculations based on parent-child relationships

In the old version of G, we provided some related operations on `Group/Shape`, but there were many problems, which led to many hacks being used in the upper layer. In the new version, we have referred to the DOM API and CSS selectors and have completed the following capabilities for each node in the scene graph, greatly reducing the learning cost:

1. Add/delete node/attribute methods with a style consistent with the DOM API
2. Node query syntax similar to CSS selectors
3. Controlling the display order through `z-index`
4. Controlling visibility through `visibility`

In addition, we have referred to `react-three-fiber` and use a declarative syntax to define the scene graph, which is convenient for component reuse.

## The Solar System Example

Imagine we need to build a simple solar system scene with the following hierarchical relationship:

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

In G, you can easily build their hierarchical relationship using `Group` and `Circle`:

```javascript
import { Group, Circle } from '@antv/g';

const solarSystem = new Group({
    name: 'solarSystem',
});
const earthOrbit = new Group({
    name: 'earthOrbit',
});
const moonOrbit = new Group({
    name: 'moonOrbit',
});
const sun = new Circle({
    name: 'sun',
    style: {
        r: 100,
    },
});
const earth = new Circle({
    name: 'earth',
    style: {
        r: 50,
    },
});
const moon = new Circle({
    name: 'moon',
    style: {
        r: 25,
    },
});

solarSystem.appendChild(sun);
solarSystem.appendChild(earthOrbit);
earthOrbit.appendChild(earth);
earthOrbit.appendChild(moonOrbit);
moonOrbit.appendChild(moon);
```

⚠️ At this point, we do not need to use a `Canvas`. The scene graph is an abstract data structure, and it only needs to interact with a `Canvas` when rendering.

After describing the hierarchical relationship, we usually need to further define the behavior of the objects in the scene graph. In the simple solar system model above, we want to make the earth revolve around the sun and the moon revolve around the earth, and update their position attributes in real time. [DEMO](/examples/scenegraph/basic/#hierarchy). But the calculation of the moon's trajectory (the red dashed line in the figure below) seems very complicated.

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*VDIfSJrf6xEAAAAAAAAAAAAAARQnAQ)

Therefore, we need to let the moon only focus on "revolving around the earth," and the matrix calculations involving parent-child relationships are left to the scene graph.

## Transformations

We provide three types of transformations: translation, scaling, and rotation. The value of each of these can be divided into relative and absolute. For example, for a translation transformation, translating to a certain point and translating a certain distance based on the current point are obviously different. Like the amount of transformation, the **coordinate system** also has the concepts of relative and absolute, which were not explained very clearly in the previous version of G, and there was no supporting API, which was very inconvenient to use.

### Local vs. World Coordinate System

A coordinate system can be used to describe the position, rotation, and scaling of objects in a scene. The most famous coordinate system is the Euclidean coordinate system. In computer graphics, we also use the barycentric coordinate system. Euclidean space can contain N dimensions. In visualization scenarios, we only use two and three dimensions.

When we say "the moon revolves around the earth," we are actually ignoring objects other than the earth. In the moon's **"local coordinate system,"** it is simply rotating around a point. Although in the **"world coordinate system"** of the entire solar system, the earth is still revolving around the sun, and the moon ultimately moves along the complex trajectory above.

In both 2D and 3D worlds, the concepts of local coordinate system and world coordinate system can be used. The following figure is from [playcanvas](https://developer.playcanvas.com/en/tutorials/manipulating-entities/), with the world coordinate system on the left and the local coordinate system on the right: ![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*kgaHRIYex8MAAAAAAAAAAAAAARQnAQ)

The world coordinate system is shared by all nodes in the entire scene graph, so it has a fixed origin `(0, 0)`, and the directions of the XYZ axes (XY axes in a 2D scene) are also fixed. Even if the box in the scene rotates itself, the world coordinate system will not change for it. But for its own local coordinate system, its origin is no longer `(0, 0)` but the position of the object itself, and the coordinate axes have naturally changed. As the name suggests, it is related to the object itself.

Imagine that we let this box "translate 10 units along the X-axis (red)." The meaning is completely different in different coordinate systems. Therefore, when we want to transform an object, we must first specify the coordinate system.

In addition, the local coordinate system is also called the **model coordinate system**, which is more convenient when describing the transformation of the model itself. In the [figure below](https://bladecast.pro/blog/local-vs-world-space-why-two), two soldier models are placed. If we want to turn the head of each soldier, it is obviously simpler to do it in the local coordinate system, because the "rotation" transformation is relative to the head of each model. ![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*9B4FRo4UbNsAAAAAAAAAAAAAARQnAQ)

### Translation

For translation operations, we provide APIs for moving absolute/relative distances in the local/world coordinate system:

| Name | Parameters | Return Value | Notes |
| --- | --- | --- | --- |
| translate | `[number, number]` | none | Moves relative to the current position in the **world coordinate system** |
| translateLocal | `[number, number]` | none | Moves relative to the current position in the **local coordinate system** |
| setPosition | `[number, number]` | none | Sets the position in the **world coordinate system** |
| setLocalPosition | `[number, number]` | none | Sets the position in the **local coordinate system** |
| getPosition | none | `[number, number]` | Gets the position in the **world coordinate system** |
| getLocalPosition | none | `[number, number]` | Gets the position in the **local coordinate system** |

### Scaling

Unlike translation, we cannot provide a method like `setScale` to set the scaling in the world coordinate system, so scaling in the global coordinate system is read-only. This is called [lossyScale](https://forum.unity.com/threads/solved-why-is-transform-lossyscale-readonly.363594/) in Unity.

| Name | Parameters | Return Value | Notes |
| --- | --- | --- | --- |
| scaleLocal | `[number, number]` | none | Scales relative to the current scaling ratio in the **local coordinate system** |
| setLocalScale | `[number, number]` | none | Sets the scaling ratio in the **local coordinate system** |
| getScale | none | `[number, number]` | Gets the scaling ratio in the **world coordinate system** |
| getLocalScale | none | `[number, number]` | Gets the scaling ratio in the **local coordinate system** |

### Rotation

In 3D scenes, rotation can be represented by matrices, axis-angles, Euler angles, and quaternions, which can be converted to each other. Although we use quaternions in the internal implementation of G for future scalability.

| Name | Parameters | Return Value | Notes |
| --- | --- | --- | --- |
| rotateLocal | `number` | none | Rotates a certain Euler angle in the **local coordinate system**, clockwise is positive, in `degrees` |
| rotate | `number` | none | Rotates a certain Euler angle in the **world coordinate system** |
| setEulerAngles | `number` | none | Sets the Euler angles in the **world coordinate system** |
| setLocalEulerAngles | `number` | none | Sets the Euler angles in the **local coordinate system** |
| setLocalRotation | `quat` | none | Sets the quaternion in the **local coordinate system** |
| setRotation | `quat` | none | Sets the quaternion in the **world coordinate system** |
| getEulerAngles | none | `number` | Gets the Euler angles in the **world coordinate system** |
| getLocalEulerAngles | none | `number` | Gets the Euler angles in the **local coordinate system** |
| getLocalRotation | none | `quat` | Gets the quaternion in the **local coordinate system** |
| getRotation | none | `quat` | Gets the quaternion in the **world coordinate system** |

The above rotation methods all use their own position as the center of rotation. If we want a node to rotate around an arbitrary point, we can create a parent node for it, and then move the parent node to a certain point and then rotate it:

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*VE3bSZ7RFlQAAAAAAAAAAAAAARQnAQ)

Below we will complete the above solar system example, making the earth revolve around the sun and the moon revolve around the earth.

### Completing the Solar System Example

First, set the position of the solar system in the world coordinate system. Based on the parent-child relationship in the scene graph, the sun, earth's orbit, earth, moon's orbit, and moon are all moved to `(300, 250)`, as shown in the figure (left) below:

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

Finally, in each frame, we rotate the solar system and the earth's orbit by 1 degree along the Z-axis in their local coordinate systems (you can also make the earth's orbit rotate faster):

```javascript
solarSystem.rotateLocal(1);
earthOrbit.rotateLocal(1);
```

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*ZcrHSoLxRS8AAAAAAAAAAAAAARQnAQ)

For each node, you only need to use the above transformation methods. Just like the moon only needs to revolve around the earth, the scene graph will calculate its position in the world coordinate system based on the parent-child relationship. Therefore, we do not recommend using methods like `get/setMatrix()` to manually set the matrix.

## Node Manipulation

In a scene graph, we need to build parent-child relationships, quickly get parent and child nodes, and sometimes query a list of a certain type of node in a subtree. To this end, we have referred to the [Node interface](https://developer.mozilla.org/en-US/docs/Web/API/Node) in the DOM API to define a series of properties and methods on nodes. At the same time, we provide a node query method similar to CSS selectors to minimize the learning cost.

### Simple Node Query

| Name | Property/Method | Return Value | Notes |
| --- | --- | --- | --- |
| parentNode | Property | `Group / null` | Parent node (if any) |
| children | Property | `Group[]` | List of child nodes |
| firstChild | Property | `Group / null` | Returns the first node in the list of child nodes (if any) |
| lastChild | Property | `Group / null` | Returns the last node in the list of child nodes (if any) |
| nextSibling | Property | `Group / null` | Returns the next sibling node (if any) |
| previousSibling | Property | `Group / null` | Returns the previous sibling node (if any) |
| contains | Method | `boolean` | Whether the subtree contains a certain node (input parameter) |

### Advanced Query

Referring to CSS selectors, we provide the following query methods. The query range is the **entire subtree** of the current node, not just the list of direct child nodes, but all descendant nodes.

| Name | Parameters | Return Value | Notes |
| --- | --- | --- | --- |
| getElementById | `(id: string)` | `Group / null` | Queries a child node by `id` |
| getElementsByName | `(name: string)` | `Group[]` | Queries a list of child nodes by `name` |
| getElementsByClassName | `(className: string)` | `Group[]` | Queries a list of child nodes by `className` |
| getElementsByTagName | `(tagName: string)` | `Group[]` | Queries a list of child nodes by `tagName` |
| querySelector | `(selector: string)` | `Group / null` | Queries the first child node that satisfies the condition |
| querySelectorAll | `(selector: string)` | `Group[]` | Queries a list of all child nodes that satisfy the condition |

Below we will use the solar system example above to demonstrate how to use these query methods.

```javascript
solarSystem.getElementsByName('sun');
// [sun]

solarSystem.getElementsByTagName('circle');
solarSystem.getElementsByTagName(Shape.CIRCLE);
// [sun, earth, moon]

solarSystem.querySelector('[name=sun]');
// sun

solarSystem.querySelectorAll('[r=25]');
// [moon]
```

### Add/Delete Nodes

| Name | Parameters | Return Value | Notes |
| --- | --- | --- | --- |
| appendChild | `(group: Group)` | `Group` | Adds a child node and returns the added node |
| insertBefore | `(group: Group, reference?: Group)` | `Group` | Adds a child node before a certain child node (if any) and returns the added node |
| removeChild | `(group: Group)` | `Group` | Deletes a child node and returns the deleted node |

### Get/Set Attribute Values

| Name | Parameters | Return Value | Notes |
| --- | --- | --- | --- |
| getAttribute | `(name: string)` | `null / any` | Gets an attribute value by attribute name |
| setAttribute | `(name: string, value: any)` | none | Sets an attribute value |

⚠️ Compatible with the old version of `attr(name: string, value?: any)`, which gets and sets attribute values.

## Visibility and Rendering Order

### Hide/Show

| Name | Parameters | Return Value | Notes     |
| ---- | ---- | ------ | -------- |
| hide | none   | none     | Hides a node |
| show | none   | none     | Shows a node |

In addition, we can also control it through the `visibility` property:

```javascript
const group = new Group();

group.hide();
// or group.setAttribute('visibility', false);

group.show();
// or group.setAttribute('visibility', true);
```

### Rendering Order

Similar to CSS, we can control the rendering order through the `zIndex` property. There are two things to note:

1. It only affects the rendering order and does not change the node structure in the scene graph.
2. It only takes effect in the current context.

| Name      | Parameters     | Return Value | Notes          |
| --------- | -------- | ------ | ------------- |
| setZIndex | `number` | none     | Sets the `zIndex` |
| toFront   | none       | none     | Brings to the front          |
| toBack    | none       | none     | Sends to the back          |

```javascript
const group = new Group();

group.setZIndex(100);
// or group.setAttribute('zIndex', 100);
```

## [WIP] React Fiber

The hierarchical structure of a scene graph is very suitable for being described by a declarative syntax. Referring to [react-three-fiber](https://github.com/pmndrs/react-three-fiber), we can also implement a [React Renderer](https://reactjs.org/docs/codebase-overview.html#renderers) for G, which has the following advantages:

1. The declarative syntax is convenient for describing the hierarchical structure.
2. It is convenient for component reuse.
3. It is naturally easy to integrate with the React ecosystem.

### Defining a Component

- Use a declarative syntax to define the scene graph structure, omitting a large number of manual calls to `appendChild`.
- If you need to call methods on a `Group`, you can use `useRef` to get a reference.
- Provide hooks such as `useFrame` to complete animations.

```jsx
import React, { useRef, useState } from 'react';
import { Group, Circle, useFrame } from '@antv/react-g-fiber';

const SolarSystem = () => {
    // Create a reference to the Group
    const solarSystem = useRef();
    const earthOrbit = useRef();

    // Called every frame
    useFrame(() => {
        solarSystem.rotateLocal(1);
        earthOrbit.rotateLocal(1);
    });

    const [hovered, setHover] = useState(false);

    return;
    <Group name="solarSystem" ref={solarSystem} position={[300, 250]}>
        <Circle name="sun" r={100} />
        <Group name="earthOrbit" ref={earthOrbit} localPosition={[100, 0]}>
            <Circle name="earth" r={50} />
            <Group name="moonOrbit" localPosition={[100, 0]}>
                <Circle
                    name="moon"
                    r={25}
                    fill={hovered ? 'yellow' : 'red'}
                    onPointerOver={(event) => setHover(true)}
                    onPointerOut={(event) => setHover(false)}
                />
            </Group>
        </Group>
    </Group>;
};
```

### Rendering a Component

You only need to specify the rendering engine when rendering a component:

```jsx
import ReactDOM from 'react-dom';
import { Canvas } from '@antv/react-g-fiber';
import { SolarSystem } from './SolarSystem';

ReactDOM.render(
    <Canvas width={600} height={500} renderer="webgl">
        <SolarSystem />
    </Canvas>,
    document.getElementById('root'),
);
```

### Linking with HTML

In actual use, how to combine the nodes in the scene graph with HTML is a problem, especially when the HTML becomes complex, it is not just a HUD problem:

- Canvas/WebGL can render simple components such as buttons, but the cost of complex components such as input boxes and forms is too high.
- Although SVG can use [foreignObject](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/foreignObject) to render both basic graphics and HTML, there are performance issues.

Therefore, we should let the rendering engines do what they are good at: let Canvas/WebGL efficiently draw basic graphics, and let HTML render complex components. The **linkage** between the two is what we should be concerned about.

Referring to [drei](https://github.com/pmndrs/drei#html), we can provide an HTML container node. When rendering, this node will be skipped by G, but its position will still be calculated through the scene graph, but it will eventually take effect by modifying the CSS style:

```jsx
import { Group, Circle, HTML } from '@antv/react-g-fiber';

const SolarSystem = () => (
    <Group>
        <Circle r={100} />
        <HTML prepend>
            <h1>hello</h1>
            <p>world</p>
        </HTML>
    </Group>
);
```

The content in this container will be added after the `<canvas>`. But since it is a special node, some functions will be limited, for example:

- You cannot use `z-index` to sandwich it between two `Circles`.
- You cannot nest other basic graphic nodes inside it.

## WIP Combining with the D3 Ecosystem

Choosing to be compatible with the DOM API and CSS selectors, in addition to reducing the learning cost, has another great advantage, that is, it is easy to combine with some existing ecosystems, such as D3, because everyone's node definitions are based on a unified interface.

SpriteJS does this. The node description and processing logic are still done by D3, but the rendering is replaced by its own implementation of Canvas/WebGL: <https://spritejs.org/demo/#/d3/bar>

## Old Version Compatibility

Although the scene graph-related functions provided in the old version of G 4.0 are not complete, since the upper-level G2 and G6 also use some APIs, we will try our best to be compatible with them.

### Transformation Related

Since the previous transformation methods were not complete, G6 uses `@antv/matrix-util` to allow users to directly operate the transformation matrix through `get/setMatrix`:

```javascript
import { transform } from '@antv/matrix-util';
transform(m, [
    ['t', x, y], // translate with vector (x, y)
    ['r', Math.PI], // rotate
    ['s', 2, 2], // scale at x-axis and y-axis
]);
```

We recommend removing this dependency and using the node's transformation methods directly:

```javascript
group
    .translate(x, y)
    .rotateLocal(180) // rotate in degrees
    .scaleLocal(2, 2);
```

### Node Definition

The scene graph should be able to exist independently of the rendering engine, so that you do not need to consider the specific rendering engine (`g-canvas/svg/webgl`) when describing components. Therefore, it is no longer recommended to use methods such as `canvas.addGroup` and `canvas.addShape`.

```javascript
// Old version is not recommended
import { Canvas } from 'g-canvas';
const canvas = new Canvas();
const circle = canvas.addShape('circle', { style: { r: 25 } });

// New version is recommended
// Define the component
import { Circle, Canvas } from '@antv/g';
const circle = new Circle({ style: { r: 25 } });
// Render the component
const canvas = new Canvas({});
canvas.appendChild(circle);
```

### Node Query

G6 uses the `find` method to query nodes that meet the conditions:

```javascript
group.find((element) => element.get('className') === 'link-point-left');
```

This type of simple query can be replaced by `getElementsByClassName` or `queryAllSelector`:

```javascript
group.getElementsByClassName('link-point-left');
// or
group.queryAllSelector('.link-point-left');
```

But note that, consistent with the DOM API, the query range is not limited to the direct list of child nodes, but the entire subtree.

### Visibility and Rendering Order

Fixed the bug in the old version of `z-index`. The API has not changed.

## References

- [World vs Local Space. Why do we need them both?](https://bladecast.pro/blog/local-vs-world-space-why-two)
- [PlayCanvas Docs - Manipulating Entities](https://developer.playcanvas.com/en/tutorials/manipulating-entities/)
- [What dose 'lossyScale' actually means?](https://answers.unity.com/questions/456669/what-dose-lossyscale-actually-means.html)
