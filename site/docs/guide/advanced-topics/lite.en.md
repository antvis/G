---
title: Using lite version
order: 6
---

As browsers iterate over new features, they get bigger and bigger. Although we want to achieve a "small browser", in size sensitive scenarios, users still want to use a minimal feature set. This requires that we split the existing features in a reasonable way, trying to achieve a minimal core + incremental enhancements model.

The following figure shows the composition of the bundle `@antv/g`.

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*lBr-T54VZpcAAAAAAAAAAAAAARQnAQ" alt="bundle viz" width="100%">

The full version `@antv/g` consists of the following parts.

-   `@antv/g-lite` Includes [canvas](/en/api/canvas), [basic graphics](/en/api/basic/concept), [event system](/en/api/event), [plugins system](/en/plugins/intro) and other core functions
-   `@antv/g-camera-api` Provides full camera motion and animation capabilities
-   `@antv/g-web-animations-api` Provides an animation system compatible with the [Web Animations API](https://developer.mozilla.org/zh-CN/docs/Web/API/Web_Animations_API)
-   `@antv/g-css-typed-om-api` Provides CSS Typed OM API
-   `@antv/g-css-layout-api` Provides CSS Layout API]
-   `@antv/g-dom-mutation-observer-api` Provides DOM Mutation Observer API

## Usage

The Lite version is identical to the full version in the use of core functions, such as creating canvases, basic graphics, using the renderer, etc.

```js
import { Canvas, Circle } from '@antv/g-lite';
import { Renderer } from '@antv/g-canvas';
```

Calling the element's animation method at this point will have no effect。

```js
circle.animate([], {});
```

Manual introduction of `@antv/g-web-animations-api` is required for this to take effect.

```js
import { Canvas, Circle } from '@antv/g-lite';
import '@antv/g-web-animations-api';
```

Other progressive features can be introduced on-demand using a similar approach.

## Function Introduction

The following is a detailed description of the functions of each part after splitting.

### g-lite

Contains core functions such as [canvas](/en/api/canvas), [basic graphics](/en/api/basic/concept), [event system](/en/api/event), [plugins system](/en/plugins/intro).

There is no change in the way the above functions are used, [example](/en/examples/ecosystem#lite).

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

### g-camera-api

`@antv/g-lite` contains a simple camera implementation, but it does not work with [camera action](/en/api/camera#actions) and [camera animation](/en/api/camera#animation).

```js
camera.pan(); // throw new Error('Method not implemented.');
camera.createLandmark(); // throw new Error('Method not implemented.');
```

### g-web-animations-api

Provides [animation capabilities](/en/api/animation/waapi) for base graphics compatible with the [Web Animations API](https://developer.mozilla.org/zh-CN/docs/Web/API/Web_Animations_API). The `object.animate()` method can still be called without this capability, but without any effect.

### g-css-typed-om-api

The [CSS Typed OM API](https://developer.mozilla.org/en-US/docs/Web/API/CSS_Typed_OM_API) allows parsed property values to be manipulated using JS, which is also the basis of CSS Houdini. In the case of `width: '50%'`, the property value in string form is parsed to `CSS.percent(50)`, facilitating the next calculation.

We provide [similar capabilities](/en/api/css/css-typed-om).

### g-css-layout-api

Reference [CSS Layout API](https://drafts.css-houdini.org/css-layout-api) provides [layout capabilities](/en/api/css/css-layout-api).

### g-dom-mutation-observer-api

In the DOM API, we can use [MutationObserver](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver) when we want to sense modifications in the DOM tree nodes, such as new nodes added, attribute values changed.

In G we also implement this [API](/en/api/builtin-objects/mutation-observer) to listen to changes in the scene graph.

### g-compat

Methods compatible with older versions are provided on the base graphics, most of which have DOM API-compatible implementations in newer versions. The use of these methods is therefore not recommended and may be removed at any time subsequently.

-   `getCount` Get the number of child nodes, the new version uses [childElementCount](/en/api/builtin-objects/element#childelementcount)
-   `getParent` Get the parent, the new version uses [parentElement](/en/api/builtin-objects/node#parentelement)
-   `getChildren` Get the list of child nodes, the new version uses [children](/en/api/builtin-objects/element#children)
-   `getFirst` Get the first child node, the new version uses [firstElementChild](/en/api/builtin-objects/element#firstelementchild)
-   `getLast` Get the last child node, the new version uses [lastElementChild](/en/api/builtin-objects/element#lastelementchild)
-   `getChildByIndex` the new version uses `this.children[index]`
-   `add` the new version uses [appendChild](/en/api/builtin-objects/node#appendchild)
-   `setClip` the new version uses [clipPath](/en/api/basic/display-object#clippath)
-   `getClip` ld.
-   `set` Storing key-value pairs on initialized configurations
-   `get` Read values on initialized configuration
-   `show` the new version uses [visibility](/en/api/basic/display-object#visibility)
-   `hide` ld.
-   `moveTo` the new version uses [setPosition](/en/api/basic/display-object#平移)
-   `move` ld.
-   `setZIndex` the new version uses [zIndex](/en/api/basic/display-object#zindex)
