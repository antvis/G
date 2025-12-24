---
title: Understanding the Event Propagation Path
order: 4
---

In the previous [getting started tutorial](/en/guide/chapter3), we learned how to add event listeners to shapes. In this tutorial, we will take a deeper look at some useful properties and methods on the event object when a listener is triggered, understand the event propagation path, and finally implement a simple event delegation effect.

Final example:

- [Official website example](/en/examples/event/event-others/#delegate)
- [CodeSandbox example](https://codesandbox.io/s/jiao-cheng-shi-jian-wei-tuo-lq7wz?file=/index.js)

## Event Propagation Mechanism

This time, our scene is very simple, similar to ul/li in the DOM:

```
Group(ul)
    - Rect(li)
    - Rect(li)
```

We want to add a click event listener to each li under the ul. The most direct way is of course:

```js
li1.addEventListener('click', () => {});
li2.addEventListener('click', () => {});
```

There is nothing wrong with this, but every time a new li is added to the ul, such a listener needs to be added. Is there a "once and for all" method?

Before introducing event delegation, let's first look at the event propagation mechanism. Since we are fully compatible with the DOM Event API, we might as well use the tutorial on MDN to illustrate. In the figure below, when we click on the `<video>` element, two stages will be triggered in sequence: capturing and bubbling. The former proceeds from the root node all the way to the target node, triggering the onclick event listener of each node on the path (if any), while the latter is the opposite.

<https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events>

![](https://mdn.mozillademos.org/files/14075/bubbling-capturing.png)

In our example scene, clicking on each li will also go through the above propagation stages, so you only need to listen on the parent node ul, and the event will naturally bubble up. This is event delegation:

```js
ul.addEventListener('click', (ev) => {
    ev.target; // li1 li2...
});
```

## Event Object

There are many useful properties on the event object. Let's first look at the event propagation path mentioned in the previous section. You can get it through the [composedPath()](/en/api/event/event-object#composedpath) method. When we click on li1, the path will return the following result:

```js
ev.composedPath(); // [Rect(li1), Group(ul), Group(root), Document, Canvas];
```

The result is an array that shows the path from the target node that triggered the event to the root node in sequence. Let's look at it from back to front:

- [Canvas](/en/api/canvas/intro) is the canvas object, which can correspond to `window`.
- [Document](/en/api/builtin-objects/document) is the document, which can correspond to `window.document`.
- [Group(root)](/en/api/builtin-objects/document#documentelement) is the root node of the document, which can correspond to `window.document.documentElement`.

In addition to the event propagation path, other commonly used properties on the event object are:

- [target](/en/api/event/event-object#target) returns the shape that currently triggered the event.
- [currentTarget](/en/api/event/event-object#currenttarget) always points to the shape to which the event is bound.
- [Event coordinates](/en/api/event/event-object#canvasxy) in various coordinate systems.

## Advanced Usage of Adding Event Listeners

There are some other common requirements that can be met when binding events, such as binding a "one-time" listener:

```js
circle.addEventListener('click', () => {}, { once: true });
```

Another example is to register a listener that is only executed during the event capture phase:

```js
circle.addEventListener('click', () => {}, { capture: true });
// or
circle.addEventListener('click', () => {}, true);
```

For more usage, you can refer to the documentation for [addEventListener()](/en/api/event/intro#addeventlistener).
