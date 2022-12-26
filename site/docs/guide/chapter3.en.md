---
title: Section III - Adding some interaction
order: 3
---

In this tutorial series, we will step-by-step implement a simple visualization scene that shows nodes and edges and gives them basic interaction capabilities such as dragging and picking.

In this section, we will learn how to make graphics respond to events, [example of this section](/en/examples/guide/basic/#chapter3). The following APIs will be involved：

-   Using [addEventListener](/en/api/event/intro#addeventlistener)
-   Using [style](/en/api/basic/display-object#drawing-properties)
-   Using [translateLocal](/en/api/basic/display-object#translation)

[DEMO in CodeSandbox](https://codesandbox.io/s/ru-men-jiao-cheng-qs3zn?file=/index.js)

## Activate highlighting

We want node 1 to respond to an activation event: turn the node red when the mouse is moved in, change the mouse style, and restore it when it is moved out.

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*Xw7JTZTFqMgAAAAAAAAAAAAAARQnAQ" width="200" alt="interaction">

As with the DOM API, we add event listeners to the graphics via [addEventListener](/en/api/event/intro#addeventlistener) to listen for mouseenter and mouseleave events.

```js
node1.addEventListener('mouseenter', () => {
    node1.style.fill = 'red';
});
node1.addEventListener('mouseleave', () => {
    node1.style.fill = '#1890FF';
});
```

Then we can add the `cursor` property to the node to set the [mouse hover style](/en/api/basic/display-object#mouse style), here we use the "finger" shape `pointer`.

```js
const node1 = new Circle({
    style: {
        //...
        cursor: 'pointer',
    },
});
```

Our [event system](/en/api/event/intro) is fully compatible with the DOM Event API, which means that it is possible to bind/unbind event listeners, trigger custom events, delegate events, and more using the familiar API on the front-end. Besides the fact that these method names are better remembered, we will see another big advantage of it in the next section.

## Dragging

Dragging is a common interaction and we want to implement dragging for node 1 while changing the endpoint position of the edge.

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*5irUQKZPTVoAAAAAAAAAAAAAARQnAQ" width="400" alt="dragging">

### Drag and Drop with interact.js

We can certainly drag and drop by combining listening to the base events (pointerup, pointermove, pointerdown). But here we go with a simpler approach. Since our [event system](/en/api/event/intro) is fully compatible with the DOM Event API, we can directly use a web-side off-the-shelf drag-and-drop library such as [interact.js](https://interactjs.io/) to do most of the of the "dirty work". Instead, we only need to do two things:

1. Pass interact.js a fake context `canvas.document` and node 1 to make it think it's operating on the real DOM
2. Changing the position of nodes and edge endpoints in the `onmove` callback function of interact.js

```js
import interact from 'interactjs';

// Use interact.js
interact(node1, {
    context: canvas.document, // Pass our fake DOM-like context
}).draggable({
    onmove: function (event) {
        // Get the offset from interact.js
        const { dx, dy } = event;
        // Change the position of node 1
        node1.translateLocal(dx, dy);
        // Get the position of node 1
        const [nx, ny] = node1.getLocalPosition();
        // Changing the endpoint position of an edge
        edge.style.x1 = nx;
        edge.style.y1 = ny;
    },
});
```

You may have noticed that the mouse style automatically changes to a `move` shape when dragging and dropping, thanks to interact.js. This is possible because [interact.js](https://interactjs.io/) does not assume that it is necessarily running in the real DOM environment. In other words, we can "trick" G's graphics by disguising them as the DOM. By the same token, we can also use gesture libraries like [hammer.js](/en/api/event/gesture-dragndrop#use-hammerjs).

### Change node position

Back in the `onmove` callback function, we need to change the position of the node, and the offset interact.js already tells us.

```js
node1.translateLocal(dx, dy);
```

There are many other [transform operations](/en/api/basic/display-object#transform operations) like `translateLocal`, besides translation, you can also rotate and scale.

Changing the endpoint of an edge is also simple, and can be done by modifying its style attribute `x1/y1`, see [Line](/en/api/basic/line) for further information.

```js
edge.style.x1 = nx;
edge.style.y1 = ny;
```

So this simple scene is complete, follow our subsequent tutorials to continue to understand the scene graph and camera.
