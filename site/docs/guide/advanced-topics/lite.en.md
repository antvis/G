---
title: Using the Lite Version
order: 6
---

As browsers continue to iterate and add new features, their size will inevitably increase. Although we aim to create a "small browser," in size-sensitive scenarios, users still prefer to use a minimal feature set. This requires us to reasonably split the existing features and strive to achieve a model of a minimal core + progressive enhancement.

The following figure shows the bundle composition of `@antv/g`.

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*lBr-T54VZpcAAAAAAAAAAAAAARQnAQ" alt="bundle viz" width="100%">

The full version of `@antv/g` consists of the following parts:

- `@antv/g-lite`: Contains core features such as the [Canvas](/en/api/canvas/intro), [basic shapes](/en/api/basic/concept), the [event system](/en/api/event/intro), and the [plugin system](/en/plugins/intro).
- Provides the DOM Mutation Observer API.
- `web-animations-api`: Provides an animation system compatible with the [Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API).
- `camera-api`: Provides full camera actions and animation functions.

## Usage

The lite version is used in the same way as the full version for core functions, such as creating a canvas, basic shapes, and using a renderer:

```js
import { Canvas, Circle } from '@antv/g-lite';
import { Renderer } from '@antv/g-canvas';
```

At this point, calling the element's animation method will have no effect:

```js
circle.animate([], {});
```

You need to manually import `web-animations-api` for it to take effect:

```js
import { Canvas, Circle } from '@antv/g-lite';
import '@antv/g';
```

Other progressive features can be imported on demand in a similar way.

## Feature Introduction

The following is a detailed introduction to the functions of each part after splitting.

### g-lite

Contains core features such as the [Canvas](/en/api/canvas/intro), [basic shapes](/en/api/basic/concept), the [event system](/en/api/event/intro), and the [plugin system](/en/plugins/intro).

The usage of the above functions has not changed. [Example](/en/examples/ecosystem/lite/#lite):

```js
import { Canvas, Circle } from '@antv/g-lite';
import { Renderer } from '@antv/g-canvas';

const canvas = new Canvas({
    container: 'container',
    width: 600,
    height: 500,
    renderer: new Renderer(),
});

const circle = new Circle({
    style: { r: 100 },
});
```

### camera-api

`@antv/g-lite` includes a simple camera implementation, but you cannot use [camera actions](/en/api/camera/action) and [camera animations](/en/api/camera/animation):

```js
camera.pan(); // throw new Error('Method not implemented.');
camera.createLandmark(); // throw new Error('Method not implemented.');
```

It can be used normally after being imported.

### web-animations-api

Provides basic shapes with [animation capabilities](/en/api/animation/waapi) compatible with the [Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API). Without this feature, you can still call the `object.animate()` method, but it will have no effect.

### dom-mutation-observer-api

In the DOM API, when we want to perceive changes to DOM tree nodes, such as new nodes being added or attribute values changing, we can use [MutationObserver](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver).

In G, we have also implemented this [API](/en/api/builtin-objects/mutation-observer) to listen for changes in the scene graph.

### g-compat

Provides methods on basic shapes that are compatible with older versions. Most of them have implementations compatible with the DOM API in the new version. Therefore, it is not recommended to use these methods, as they may be removed at any time in the future:

- `getCount`: Gets the number of child nodes. The new version uses [childElementCount](/en/api/builtin-objects/element#childelementcount).
- `getParent`: Gets the parent node. The new version uses [parentElement](/en/api/builtin-objects/node#parentelement).
- `getChildren`: Gets the list of child nodes. The new version uses [children](/en/api/builtin-objects/element#children).
- `getFirst`: Gets the first child node. The new version uses [firstElementChild](/en/api/builtin-objects/element#firstelementchild).
- `getLast`: Gets the last child node. The new version uses [lastElementChild](/en/api/builtin-objects/element#lastelementchild).
- `getChildByIndex`: Gets a child node by index. The new version uses `this.children[index]`.
- `add`: Adds a child node. The new version uses [appendChild](/en/api/builtin-objects/node#appendchild).
- `setClip`: Sets the clipping shape. The new version uses [clipPath](/en/api/basic/display-object#clippath).
- `getClip`: Gets the clipping shape. Same as above.
- `set`: Stores a key-value pair on the initial configuration.
- `get`: Reads a value from the initial configuration.
- `show`: Shows the shape. The new version uses [visibility](/en/api/basic/display-object#visibility).
- `hide`: Hides the shape. Same as above.
- `moveTo`: Moves the shape in world coordinates. The new version uses [setPosition](/en/api/basic/display-object#translation).
- `move`: Same as above.
- `setZIndex`: Sets the rendering order. The new version uses [zIndex](/en/api/basic/display-object#zindex).
