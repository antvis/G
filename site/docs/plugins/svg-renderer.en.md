---
title: g-plugin-svg-renderer
order: 5
---

Provides SVG-based rendering capabilities.

## Usage

The [g-svg](/en/api/renderer/svg) renderer is built in by default, so there is no need to introduce it manually.

```js
import { Renderer as SvgRenderer } from '@antv/g-svg';
// Create a renderer with the plugin built in
const svgRenderer = new SvgRenderer();
```

## Contributions

The plugin exposes the following contributions.

### ElementLifeCycleContribution

This contribution provides the lifecycle of SVG elements from creation, update to destruction.

```js
export interface ElementLifeCycleContribution {
    createElement: (object: DisplayObject) => SVGElement;
    shouldUpdateElementAttribute: (
        object: DisplayObject,
        attributeName: string,
    ) => boolean;
    updateElementAttribute: (object: DisplayObject, $el: SVGElement) => void;
    destroyElement: (object: DisplayObject, $el: SVGElement) => void;
}
```

Different renderer plugins can implement the above interface to manage the lifecycle of each graphic using a custom approach. For example, the following code shows two SVG-based renderer plugins, the former built for [g-svg](/en/api/renderer/svg), which provides rendering capabilities for default SVG elements, and the latter which implements hand-drawn style rendering with rough.js on top of that.

```js
// g-plugin-svg-renderer
@singleton({ token: ElementLifeCycleContribution })
export class DefaultElementLifeCycleContribution
    implements ElementLifeCycleContribution {}

// g-plugin-svg-rough-renderer
@singleton({ token: ElementLifeCycleContribution })
export class RoughElementLifeCycleContribution
    implements ElementLifeCycleContribution {}
```

#### createElement

This method uses the DOM API to create the corresponding SVGElement based on the incoming base drawing, and is called when the [ElementEvent.MOUNTED](/en/api/basic/display-object#lifecycle-event-listening) event is triggered.

#### shouldUpdateElementAttribute

Redrawing is expressed as attribute update in SVG, but some attributes (e.g. [visibility](/en/api/basic/display-object#hidden display), [z-index](/en/api/basic/display-object#zindex), etc.) of updates we have a unified internal implementation and do not intend to open up custom capabilities. So there needs to be a judgment method to decide whether to trigger an attribute update or not.

This method gets called when [MOUNTED](/en/api/basic/display-object#lifecycle-event-listening) triggered for the first time and [ElementEvent.ATTR_MODIFIED](/en/api/basic/display-object#lifecycle-event-listening) for subsequent property updates.

#### updateElementAttribute

After passing the attribute update judgment method, the update attribute logic is executed.

#### destroyElement

This method is called when [ElementEvent.UNMOUNTED](/en/api/basic/display-object#lifecycle-event-listening) is triggered when the drawing is removed from the canvas.
