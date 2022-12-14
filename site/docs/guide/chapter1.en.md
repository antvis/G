---
title: Section I - Defining the Scenario
order: 1
---

In this tutorial series, we will step-by-step implement a simple visualization scene that shows nodes and edges and gives them basic interaction capabilities such as dragging and picking.

In this section, we will learn how to describe a scene using a [scene graph](/en/guide/diving-deeper/scenegraph).

Our scene is very simple, it contains two nodes implemented with [Circle](/en/api/basic/circle), an edge connecting them implemented with [Line](/en/api/basic/line), where the text on each node is implemented with [Text](/en/api/basic/text).

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*5irUQKZPTVoAAAAAAAAAAAAAARQnAQ" width="200" alt="2 nodes">

[DEMO in CodeSandbox](https://codesandbox.io/s/ru-men-jiao-cheng-qs3zn?file=/index.js)

## Create Node

First we import the base graph [Circle](/en/api/basic/circle) from `@antv/g`, which our node uses to implement:

```javascript
import { Circle } from '@antv/g';
```

Then we need to define a set of properties for the graph：

```javascript
const node1 = new Circle({
    style: {
        r: 100,
        fill: '#1890FF',
        stroke: '#F04864',
        lineWidth: 4,
    },
});
```

We can create a second node in the same way.

## Adding text to a node

We want to display descriptive text on the node, again we bring in the base graph [Text](/en/api/basic/text) from `@antv/g`:

```javascript
import { Text } from '@antv/g';

const text1 = new Text({
    style: {
        text: 'Node1',
        fontFamily: 'Avenir',
        fontSize: 22,
        fill: '#fff',
        textAlign: 'center',
        textBaseline: 'middle',
    },
});
```

The text should be a child of the node, and in the scene graph, this parent-child relationship is constructed via `appendChild`：

```javascript
node1.appendChild(text1);
```

We only need to set the position of the node, and all its children (text) will follow:

```javascript
node1.setPosition(200, 200);
```

## Create edge

We can import [Line](/en/api/basic/line) from `@antv/g` to connect the two endpoints:

```javascript
import { Line } from '@antv/g';

const edge = new Line({
    style: {
        x1: 200,
        y1: 200,
        x2: 400,
        y2: 200,
        stroke: '#1890FF',
        lineWidth: 2,
    },
});
```

At this point our scene is defined and in the next section we will render the scene using the renderer.
