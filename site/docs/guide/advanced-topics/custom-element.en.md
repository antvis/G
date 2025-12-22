---
title: Custom Shapes
order: 3
---

We provide some [basic shapes](/api/basic/display-object), such as [Circle](/api/basic/circle), [Path](/api/basic/path), and so on. Through the [Scene Graph](/guide/diving-deeper/scenegraph) capabilities, we can also build hierarchical relationships between them. But when the scene hierarchy is deeply nested and needs to be reused, we need a custom component mechanism that can encapsulate these basic shapes into advanced shapes.

A similar problem is solved in Web Components through [Custom Elements](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements). In the [official example](https://github.com/mdn/web-components-examples/blob/main/life-cycle-callbacks/main.js), we can see that the registration process of a custom element follows these steps:

- Create the internal DOM structure in the constructor.
- Set styles in [connectedCallback()](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements#using_the_lifecycle_callbacks), which is called when the element is first inserted into the document.
- Handle attribute updates and reset styles in [attributeChangedCallback()](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements#using_the_lifecycle_callbacks).
- Use [customElements.define()](https://developer.mozilla.org/en-US/docs/Web/API/CustomElementRegistry/define) to complete the registration of the custom element.

We have adopted this design.

In this article, we will introduce the usage of custom shapes and implement a simple arrow, which includes the following steps:

- Designing custom properties
- Defining the scene graph
- Using the custom shape
- Handling attribute updates

![arrow](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*9Xs4SKUOAxwAAAAAAAAAAAAAARQnAQ)

The process will involve the [Scene Graph](/guide/diving-deeper/scenegraph), the [Animation System](/api/animation/waapi), the [Event System](/api/event/intro), and so on. Before you begin, we recommend that you first read the documentation for each of these systems.

- [Full DEMO](/examples/shape/custom-element/#arrow)
- [Source Code](https://github.com/antvis/g/blob/next/packages/g/src/plugins/components/Arrow.ts)

## Background

An arrow consists of a body part + one or two endpoints. As shown in the figure below, the body part can be a Line / Polyline / Path, while the endpoints can be any basic/advanced shape. The default endpoint we provide is a Path. It can be seen that an arrow is an "advanced shape" composed of several basic shapes.

## Inheriting from CustomElement

First, all custom shapes need to inherit from the `CustomElement` base class:

```js
import { CustomElement } from '@antv/g';

export class Arrow extends CustomElement<ArrowStyleProps> {}
```

Then you can define the properties of the custom shape. Here we provide the following custom properties for the arrow:

- `body`: The body part can only accept [Line](/api/basic/line), [Path](/api/basic/path), or [Polyline](/api/basic/polyline).
- `startHead`/`endHead`: The endpoint part can be any basic shape. Passing a boolean value will enable/disable the default built-in endpoint.
- `stroke`/`lineWidth`/`opacity`, etc., are regular drawing properties.

```js
type ArrowHead = boolean | DisplayObject;
type ArrowBody = Line | Path | Polyline;

export interface ArrowStyleProps extends BaseStyleProps {
    body?: ArrowBody; // body
    startHead?: ArrowHead; // start head
    endHead?: ArrowHead; // end head
    stroke?: string; // color
    lineWidth?: number; // line width
    opacity?: number; // opacity
    strokeOpacity?: number;
}
```

With the custom properties defined, the next step is to compose basic shapes through the scene graph.

## Defining the Scene Graph

We need to define the scene graph in the constructor. Here we will use the node manipulation capabilities of basic shapes, such as using [appendChild](/api/basic/display-object#add-and-remove-nodes) to add the body and endpoint parts of the arrow.

```js
static tag = 'arrow';

constructor(config: DisplayObjectConfig<ArrowStyleProps>) {
  // Call the base class constructor
  super({
    ...config,
    type: Arrow.tag, // Define the custom shape type
  });

  // Get the custom properties passed in by the user
  // @see /en/api/builtin-objects/element#attributes
  const { body, startHead, endHead, ...rest } = this.attributes;

  // The body part must be specified
  if (!body) {
    throw new Error("Arrow's body is required");
  }

  // Add the body
  this.body = body;
  this.appendChild(this.body);

  // Add start/end endpoints
  if (startHead) {
    this.appendArrowHead(this.getArrowHeadType(startHead), true);
  }
  if (endHead) {
    this.appendArrowHead(this.getArrowHeadType(endHead), false);
  }

  // Apply styles to the body and endpoints
  this.applyArrowStyle(rest, [this.body, this.startHead, this.endHead]);
}
```

### Adding Endpoints

We support both built-in endpoints and user-provided endpoints. Even if provided by the user, it is only used to describe the shape of the endpoint. To ensure that the arrow and the body part have the same orientation, we also need to transform the endpoint. In addition, we use [zIndex](/api/basic/display-object#zindex). Since the default zIndex is 0, setting it to 1 can ensure that the display order of the endpoint is above the body part.

```js
private appendArrowHead(type: ArrowHeadType, isStart: boolean) {
  let head: DisplayObject;
  if (type === 'default') {
    // Create a default endpoint
    head = this.createDefaultArrowHead();
  } else {
    // Use the endpoint provided by the user
    head = isStart ? this.attributes.startHead : this.attributes.endHead;
  }

  // Transform the endpoint
  this.transformArrowHead(head, isStart);

  // Make the endpoint display on the body
  head.setAttribute('zIndex', 1);
  // or head.style.zIndex = 1;

  if (isStart) {
    this.startHead = head;
  } else {
    this.endHead = head;
  }

  // Add the endpoint to the scene graph
  this.appendChild(head);
}
```

For the built-in default endpoint, we use a [Path](/api/basic/path) shaped like `<`, and here we set the `anchor` to `[0.5, 0.5]`, which is the center point of the Path, to facilitate subsequent transformations of the endpoint:

```js
private createDefaultArrowHead() {
  // Inherit the custom properties of the arrow
  const { stroke, lineWidth } = this.attributes;
  const { sin, cos, PI } = Math;
  return new Path({
    style: {
      path: `M${10 * cos(PI / 6)},${10 * sin(PI / 6)} L0,0 L${10 * cos(PI / 6)},-${10 * sin(PI / 6)
        }`,
      stroke,
      lineWidth,
      anchor: [0.5, 0.5], // The anchor defaults to [0, 0]
    },
  });
}
```

The next step is to transform the endpoint to ensure that it appears in the correct position (at both ends of the body) and has the correct orientation.

### Transforming the Endpoint

The transformation of the endpoint can be divided into two steps: setting the position (start or end of the body) and the orientation.

Depending on the different body shapes, the coordinates of the two endpoints can be obtained through different methods. It should be noted that when setting the position of the endpoint, you must use [methods for operating in the local coordinate system](), i.e., `setLocalPosition` or `translateLocal`. The reason is that we want the endpoint to be positioned relative to the entire arrow, not the world coordinate system. This way, when the entire arrow moves, its internal components (body, endpoints) will move with it, but their relative positions will not change.

Similarly, when setting the rotation angle of the endpoint along with the body, you also need to add the angle of the tangent of the body to the rotation angle of the endpoint itself, so you need to use `get/setLocalEulerAngles`.

```js
private transformArrowHead(head: DisplayObject, isStart: boolean) {
  let rad = 0;
  let x1 = 0;
  let x2 = 0;
  let y1 = 0;
  let y2 = 0;

  // Body type
  const bodyType = this.body && this.body.nodeName;
  if (bodyType === Shape.LINE) {
    // Omit tangent calculation
  } else if (bodyType === Shape.POLYLINE) {
    // Omit tangent calculation
  } else if (bodyType === Shape.PATH) {
    // Omit tangent calculation
  }

  // Calculate radians
  const x = x1 - x2;
  const y = y1 - y2;
  rad = Math.atan2(y, x);

  // Set the position in the local coordinate system
  head.setLocalPosition(x2, y2);
  // Set the rotation angle in the local coordinate system, converting radians to degrees
  head.setLocalEulerAngles((rad * 180) / Math.PI + head.getLocalEulerAngles());
}
```

Below we will see how to calculate the tangent for different types of bodies. This part is purely simple mathematical calculations and is not closely related to the theme of this article.

### Calculating the Tangent

For Line and Polyline, you just need to find the coordinates of the two endpoints and subtract them. For Path, we provide an [API for calculating the tangent](/api/basic/path#getstarttangent-number):

```js
private getTangent(path: Path, isStart: boolean): number[][] {
  return isStart ? path.getStartTangent() : path.getEndTangent();
}
```

At this point, a simple arrow is assembled.

## Using the Custom Shape

Custom shapes can use most of the capabilities of basic shapes, such as node manipulation, transformations, animations, and responding to events.

### Node Manipulation

Using an advanced shape like an arrow is the same as using other basic shapes. For example, we can create an arrow with a Line as its body. Then we can apply transformation methods to it, such as translation. We can also use the node query capabilities of the scene graph, such as `getElementById`:

```js
const lineArrow = new Arrow({
    id: 'lineArrow',
    style: {
        body: new Line({
            style: {
                x1: 200,
                y1: 100,
                x2: 0,
                y2: 0,
            },
        }),
        startHead: true,
        stroke: '#1890FF',
        lineWidth: 10,
        cursor: 'pointer',
    },
});

// Translate
lineArrow.translate(200, 100);

// Query by id
canvas.document.getElementById('lineArrow'); // Arrow lineArrow
```

### Applying Animations

You can also [apply animations](/api/animation/waapi) to it, for example, to the `transform`, `stroke`, and `opacity` properties:

```js
lineArrow.animate(
    [
        { transform: 'scale(1)', stroke: '#F04864', opacity: 1 },
        { transform: 'scale(2)', stroke: '#1890FF', opacity: 0.8 },
    ],
    {
        duration: 1500,
        iterations: Infinity,
        easing: 'cubic-bezier(0.250, 0.460, 0.450, 0.940)',
    },
);
```

[Full DEMO](/examples/shape/custom-element/#arrow)

### Responding to Events

Custom shapes can also [respond to events](/api/event/intro), for example, changing color on mouseenter and mouseleave:

```js
lineArrow.addEventListener('mouseenter', () => {
    lineArrow.style.stroke = '#2FC25B';
});
lineArrow.addEventListener('mouseleave', () => {
    lineArrow.style.stroke = '#1890FF';
});
```

## Handling Attribute Updates

Custom properties may be updated, for example, changing the style of an arrow's endpoint after it has been created. Therefore, you need to listen for changes in attribute values. Referring to the Web Components standard, we provide the following lifecycle methods for subclasses to implement. Here we will focus on `attributeChangedCallback`.

```js
export interface CustomElement<CustomElementStyleProps> {
  /**
   * Triggered when added to the canvas
   */
  connectedCallback?(): void;

  /**
   * Triggered when removed from the canvas
   */
  disconnectedCallback?(): void;

  /**
   * Triggered when an attribute is modified
   */
  attributeChangedCallback?<Key extends keyof CustomElementStyleProps>(
    name: Key,
    oldValue: CustomElementStyleProps[Key],
    newValue: CustomElementStyleProps[Key],
  ): void;
}
```

In our [DEMO](/examples/shape/custom-element/#arrow), you can switch the endpoint and body shapes at any time. For example, switching the start endpoint to an image:

```js
const image = new Image({
    style: {
        width: 50,
        height: 50,
        anchor: [0.5, 0.5],
        src: 'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*N4ZMS7gHsUIAAAAAAAAAAABkARQnAQ',
    },
});
image.rotateLocal(90);
// Modify the start endpoint
lineArrow.style.startHead = image;
```

At this point, we can listen for updates to the `startHead` attribute. When this attribute is modified, we first need to remove the existing start endpoint and then re-add it:

```js
attributeChangedCallback<Key extends keyof ArrowStyleProps>(
  name: Key,
  oldValue: ArrowStyleProps[Key],
  newValue: ArrowStyleProps[Key],
) {
  if (name === 'startHead' || name === 'endHead') {
    const isStart = name === 'startHead';
    // Remove the existing endpoint
    this.destroyArrowHead(isStart);

    if (newValue) {
      const { body, startHead, endHead, ...rest } = this.attributes;
      // Re-add the endpoint
      this.appendArrowHead(this.getArrowHeadType(newValue), isStart);
      this.applyArrowStyle(rest, [isStart ? this.startHead : this.endHead]);
    }
  }
}
```

Removing the endpoint uses `removeChild`, which is also a node manipulation method provided by the scene graph:

```js
private destroyArrowHead(isStart: boolean) {
  if (isStart && this.startHead) {
    this.removeChild(this.startHead);
    this.startHead = undefined;
  }
  if (!isStart && this.endHead) {
    this.removeChild(this.endHead);
    this.endHead = undefined;
  }
}
```

## Considerations

Once mounted on the canvas, a custom component is treated as a whole, and its internal shapes can no longer be obtained through scene graph query capabilities (such as `getElementById`). Therefore, you can expose methods to the user, for example, to get the body and endpoint parts of the arrow.

```js
getBody() {
  return this.body;
}

getStartHead() {
  return this.startHead;
}

getEndHead() {
  return this.endHead;
}
```
