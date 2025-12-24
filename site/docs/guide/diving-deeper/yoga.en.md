---
title: Using the Yoga Layout Engine
order: 13
---

[Yoga](https://yogalayout.com/) is a cross-platform layout engine provided by Facebook. It is based on Flex, and its properties are fully consistent with CSS Flex. Therefore, you can also read [Basic concepts of Flexbox on MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Flexible_Box_Layout/Basic_Concepts_of_Flexbox) to get more conceptual knowledge.

With the support of the [g-plugin-yoga](/plugins/yoga) plugin, we can add Flex properties to existing 2D shapes.

In this [example](/examples/plugins/yoga/#yoga-text), we create a common adaptive layout effect:

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*IH1fSJN9fsMAAAAAAAAAAAAAARQnAQ" width="300px">

## Registering the Plugin

Create a renderer and register the plugin:

```js
import { Canvas, CanvasEvent } from '@antv/g';
import { Renderer } from '@antv/g-canvas';
import { Plugin as PluginYoga } from '@antv/g-plugin-yoga';

const renderer = new Renderer();
const plugin = new PluginYoga();
renderer.registerPlugin(plugin);

const canvas = new Canvas({
    container: 'container',
    width: 600,
    height: 500,
    renderer,
});
```

## Creating a Flex Container

We use a [Rect](/api/basic/rect) to create a light blue background container.

First, we declare it as a Flex container through `display: 'flex'`. Currently, we only support [Rect](/api/basic/rect) and [Group](/api/basic/group) as Flex containers. See [Declaring a Flex Container](/plugins/yoga#declaring-a-flex-container) for details.

Then, we use the [flexDirection](/plugins/yoga#flexdirection) property to arrange the child elements vertically.

Finally, we use [padding](/plugins/yoga#padding) to leave a margin around the container:

```js
const root = new Rect({
  id: 'root',
  style: {
    fill: '#C6E5FF',
    width: 500,
    height: 300,
    x: 50,
    y: 50,
    display: 'flex', // Declare as a Flex container
    flexDirection: 'column',
    padding: [10, 10, 10, 10],
  },
});
canvas.appendChild(root);
```

## Creating the Top Header

Next, we add the first element to the container, a fixed-height Header.

Note that we use a percentage for the width: `width: '100%'`, which is the width of the parent element (the light blue container).

```js
const topPanel = new Rect({
    style: {
        fill: 'white',
        stroke: 'grey',
        lineWidth: 1,
        opacity: 0.8,
        width: '100%',
        height: 60,
        marginBottom: 10,
    },
});
```

## Creating the Bottom Adaptive Area

After the fixed Header, we want the bottom area to fill the remaining space of the container.

Here, we create a [Group](/api/basic/group). The reason we don't continue to use a [Rect](/api/basic/rect) is that we don't want it to be rendered as a container itself.

Using [flexGrow](/plugins/yoga#flexgrow), its height will adapt to the parent container. We also declare that it is a Flex container itself, and more child elements will be added later.

```js
const bottomPanel = new Group({
    style: {
        display: 'flex',
        width: '100%',
        flexGrow: 1,
    },
});
```

## Continuing to Divide the Area

Next, we continue to divide the newly created bottom area. This time, we create a horizontal two-column layout.

```js
bottomPanel.appendChild(leftPanel);
bottomPanel.appendChild(rightPanel);
```

## Centering Elements

Centering is also a common requirement. For example, we can use [justifyContent](/plugins/yoga#justifycontent) and [alignItems](/plugins/yoga#alignitems) in the top Header to achieve this:

```js
const topPanel = new Rect({
    style: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
topPanel.appendChild(
    new Text({
        style: {
            fontFamily: 'PingFang SC',
            fontSize: 24,
            fill: '#1890FF',
            text: '1',
        },
    }),
);
```
