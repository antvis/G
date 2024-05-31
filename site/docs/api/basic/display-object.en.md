---
title: DisplayObject
order: 0
redirect_from:
  - /en/api/basic
---

DisplayObject is the base class of all graph like [Group](/en/api/basic/group), [Circle](/en/api/basic/circle), [Text](/en/api/basic/text) etc.

We tried to make it as compatible as possible with [DOM Element](https://developer.mozilla.org/en-US/docs/Web/API/Element), which in addition to reducing learning costs, allows us to take advantage of the existing Web ecosystem by disguising ourselves as a DOM Element, e.g.

- Using CSS selectors for [advanced queries](/en/plugins/css-select).
- Using Hammer.js for [gesture](/en/api/event#直接使用-hammerjs)
- Using Interact.js for [Drag'n'Drop and Resize](/en/api/event#直接使用-interactjs)
- [Taking over D3's rendering implementation](/en/guide/diving-deeper/d3)
- [Taking over Observable Plot's rendering implementation](/en/guide/diving-deeper/plot)

## Inherited from

[Element](/en/api/builtin-objects/element)

## id

https://developer.mozilla.org/en-US/docs/Web/API/Element/id

Globally unique identifier, can be queried by [getElementById](/en/api/display-object#advanced query).

```js
const circle = new Circle({
  id: 'my-circle-id',
  style: {
    r: 10,
  },
});
circle.id; // 'my-circle-id'
canvas.getElementById('my-circle-id'); // circle
```

## name

https://developer.mozilla.org/en-US/docs/Web/API/Document/getElementsByName

Graph name, not required to be globally unique, can be queried by [getElementsByName](/en/api/display-object#advanced query).

```js
const circle = new Circle({
  name: 'my-circle-name',
  style: {
    r: 10,
  },
});
circle.name; // 'my-circle-name'
canvas.getElementsByName('my-circle-name'); // [circle]
```

## className

https://developer.mozilla.org/en-US/docs/Web/API/Element/className

The class name owned by the graphic, which can be used to get/set the class name of the graphic. It can be queried later using [getElementsByClassName](/en/api/display-object#advanced query).

```js
const circle = new Circle({
  className: 'my-circle-classname',
  style: {
    r: 10,
  },
});
circle.className; // 'my-circle-classname'
canvas.getElementsByClassName('my-circle-classname'); // [circle]
```

You can use spaces to separate multiple class names, and then use [classList](/en/api/builtin-objects/element#classlist) read-only attribute to get a list of class names.

```js
circle.className = 'c1 c2';
circle.classList; // ['c1', 'c2']
```

Not specifying a class name will return the empty string.

```js
const group = new Group();
group.className; // ''
```

Finally, you can also use `class` as an alias when setting.

```js
const group = new Group({
  class: 'my-classname',
  // className: 'my-classname'
});

group.setAttribute('class', 'my-classname');

// wrong, class is the kept keywords
group.class;
```

## interactive

Whether to support responding to [events](/en/api/event), default is `true`. Can be turned off on some graphics that do not need to support interaction.

For example, we don't want the following circle to respond to the mouse `mouseenter/leave` event, [example](/en/examples/event#circle)

```js
const circle = new Circle({
  interactive: false,
  style: {
    r: 100,
  },
});

// or
circle.interactive = false;
```

It is recommended to use the [pointerEvents](/en/api/basic/display-object#pointerevents) attribute, so the above prohibited interactions are equivalent to

```js
circle.style.pointerEvents = 'none';
```

## Drawing Properties

The drawing properties are set by `style` and usually contain **generic properties** such as fill color, transparency, etc. Different types of shapes also have their own **additional properties**, for example, in the following rounded rectangle, the fill color `fill` and stroke color `stroke` are generic properties, while the top-left vertex position `(x, y)`, the size `width/height` and the radius `radius` of the rectangle are additional properties.

```javascript
const rect = new Rect({
  style: {
    // or using attrs
    x: 200,
    y: 100,
    fill: '#1890FF',
    stroke: '#F04864',
    lineWidth: 4,
    width: 300,
    height: 200,
    radius: 8,
  },
});
```

Property names can also be hyphenated, so the following writeups are fully equivalent, see [get/set property values](/en/api/basic/display-object#获取设置属性值) for full usage.

```js
const rect = new Rect({
  'line-width': 4,
  // lineWidth: 4,
});

rect.style.lineWidth = 4;
rect.style['line-width'] = 4;
rect.style.setProperty('lineWidth', 4);
rect.style.setProperty('line-width', 4);
```

### Position

The initial position of the drawing in the local coordinate system is described by different properties depending on the type of drawing, and can be reset later by [setLocalPosition](/en/api/display-object#panning).

```js
const circle = new Cirle({
  style: {
    cx: 100,
    cy: 100,
    r: 100,
  },
});
circle.getLocalPosition(); // [0, 0]
```

#### transform

We provide shortcuts for transformations in local coordinate systems, while keeping in line with [CSS Transform](https://developer.mozilla.org/zh-CN/docs/Web/CSS/transform), supporting the following [transform-function transformations function](https://developer.mozilla.org/zh-CN/docs/Web/CSS/transform-function).

- Scaling
  - scale(x, y)
  - scaleX(x)
  - scaleY(x)
  - scaleZ(z)
  - scale3d(x, y, z)
- Translation, 0 can be used without units, unitless is treated as px, the percentage is relative to the current graph bounding box
  - translate(0, 0) translate(0, 30px) translate(100%, 100%)
  - translateX(0)
  - translateY(0)
  - translateZ(0)
  - translate3d(0, 0, 0)
- Rotation, support for deg rad turn, these angular units
  - rotate(0.5turn) rotate(30deg) rotate(1rad)
- Stretch, support deg rad turn these angular units
  - skew(ax, ay)
  - skewX(a)
  - skewY(a)
- Matrix
  - matrix()
  - matrix3d()
- none

| [Initial value](/en/api/css/css-properties-values-api#initial-value) | Applicable elements | [Inheritable](/en/api/css/inheritance) | Animatable | [Computed value](/en/api/css/css-properties-values-api#computed-value) |
| -------------------------------------------------------------------- | ------------------- | -------------------------------------- | ---------- | ---------------------------------------------------------------------- |
| `'none'`                                                             | all                 | no                                     | yes        | `<transform>`                                                          |

Since the transformation is performed in a local coordinate system, the following write-ups are visually consistent.

```js
// Using transform
const circle = new Circle({
  style: {
    transform: 'translate(100px, 100px)',
    r: 100,
  },
});

// or set cx/cy directly
const circle = new Circle({
  style: {
    cx: 100,
    cy: 100,
    r: 100,
  },
});

// or using transform functions
const circle = new Circle({
  style: {
    r: 100,
  },
});
circle.translateLocal(100, 100);
```

#### transformOrigin

Rotation and scaling centers, also called transform origin, are defined relative to Bounds.

Similar to CSS [transform-origin](https://developer.mozilla.org/zh-CN/docs/Web/CSS/transform-origin), the following string writing is supported, separated by spaces.

- One value
  - Length in px, e.g. 10px
  - Length in %, e.g. 50%
  - The keywords left, center, right, top, bottom are expressed as percentages, e.g. left equals 0%, center equals 50%.
- Two values
  - The first is the length in px or %, or one of the left, center, or right keywords
  - The second is the length in px or %, or one of the top, center, or bottom keywords

Therefore the following write-ups are equivalent.

```js
// r = 100
circle.style.transformOrigin = 'left';
circle.style.transformOrigin = 'left center'; // AABB horizontal left edge, vertical midpoint
circle.style.transformOrigin = '0 50%'; // The distance to the left edge of the AABB is 0 horizontally and 50% height from the top vertically
circle.style.transformOrigin = '0 100px'; // The distance to the left edge of the AABB is 0 horizontally and 100px vertically from the top
```

⚠️ Writing with three values is not supported at the moment.

| [Initial value](/en/api/css/css-properties-values-api#initial-value) | Applicable elements | [Inheritable](/en/api/css/inheritance) | Animatable | [Computed value](/en/api/css/css-properties-values-api#computed-value) |
| -------------------------------------------------------------------- | ------------------- | -------------------------------------- | ---------- | ---------------------------------------------------------------------- |
| -                                                                    | all                 | no                                     | no         | `<transform-origin>`                                                   |

### Fill

#### opacity

The overall transparency of the graph, with values in the range `[0, 1]`, supports both `number` and `string` types, so the following two ways of writing it are equivalent.

```js
circle.style.opacity = 0.5;
circle.style.opacity = '0.5';
```

| [Initial value](/en/api/css/css-properties-values-api#initial-value) | Applicable elements | [Inheritable](/en/api/css/inheritance) | Animatable | [Computed value](/en/api/css/css-properties-values-api#computed-value) |
| -------------------------------------------------------------------- | ------------------- | -------------------------------------- | ---------- | ---------------------------------------------------------------------- |
| '1'                                                                  | all                 | no                                     | yes        | [\<number\>](/en/api/css/css-properties-values-api#number)             |

#### fillOpacity

The fill color transparency, in the range `[0, 1]`, supports both `number` and `string` types, so the following two ways of writing are equivalent.

```js
circle.style.fillOpacity = 0.5;
circle.style.fillOpacity = '0.5';
```

| [Initial value](/en/api/css/css-properties-values-api#initial-value) | Applicable elements | [Inheritable](/en/api/css/inheritance) | Animatable | [Computed](/en/api/css/css-properties-values-api#computed-value) |
| -------------------------------------------------------------------- | ------------------- | -------------------------------------- | ---------- | ---------------------------------------------------------------- |
| '1'                                                                  | all                 | yes                                    | yes        | [\<number\>](/en/api/css/css-properties-values-api#number)       |

#### fill

Fill color, supports `string` type, see [\<paint\>](/en/api/css/css-properties-values-api#paint)：

```js
circle.style.fill = 'red';
circle.style.fill = 'rgb(255, 0, 0)';
```

| [Initial value](/en/api/css/css-properties-values-api#initial-value) | Applicable elements | [Inheritable](/en/api/css/inheritance) | Animatable | [Computed value](/en/api/css/css-properties-values-api#computed-value) |
| -------------------------------------------------------------------- | ------------------- | -------------------------------------- | ---------- | ---------------------------------------------------------------------- |
| 'none'                                                               | all                 | no                                     | yes        | [\<paint\>](/en/api/css/css-properties-values-api#paint)               |

#### fillRule

This attribute is a presentation attribute defining the algorithm to use to determine the inside part of a shape.

- `'nonzero'` Default https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/fill-rule#nonzero
- `'evenodd'` https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/fill-rule#evenodd

This [example](/en/examples/shape#polygon) shows the fill effects of `'nonzero'` and `'evenodd'` in order.

<img src="https://gw.alipayobjects.com/mdn/rms_dfc253/afts/img/A*LgwCQ7mL4GoAAAAAAAAAAAAAARQnAQ" alt="fill rule" width="200">

### Stroke

#### strokeOpacity

Stroke transparency, which takes values in the range `[0, 1]`, supports both `number` and `string` types, so the following two ways of writing it are equivalent.

```js
circle.style.strokeOpacity = 0.5;
circle.style.strokeOpacity = '0.5';
```

| [Initial value](/en/api/css/css-properties-values-api#initial-value) | Applicable elements | [Inheritable](/en/api/css/inheritance) | Animatable | [Computed value](/en/api/css/css-properties-values-api#computed-value) |
| -------------------------------------------------------------------- | ------------------- | -------------------------------------- | ---------- | ---------------------------------------------------------------------- |
| '1'                                                                  | all                 | yes                                    | yes        | [\<number\>](/en/api/css/css-properties-values-api#number)             |

#### stroke

Stroke color, supports `string` type, see [\<paint\>](/en/api/css/css-properties-values-api#paint)：

```js
circle.style.stroke = 'red';
circle.style.stroke = 'rgb(255, 0, 0)';
```

| [Initial value](/en/api/css/css-properties-values-api#initial-value) | Applicable elements | [Inheritable](/en/api/css/inheritance) | Animatable | [Computed value](/en/api/css/css-properties-values-api#computed-value) |
| -------------------------------------------------------------------- | ------------------- | -------------------------------------- | ---------- | ---------------------------------------------------------------------- |
| 'none'                                                               | all                 | no                                     | yes        | [\<paint\>](/en/api/css/css-properties-values-api#paint)               |

#### lineWidth

The width of the stroke. Unlike the familiar [CSS box model](https://developer.mozilla.org/en-US/docs/Web/CSS/box-sizing), half of the width of the border is inside the graphic and half is outside the graphic. For example, the width of the enclosing box for the circle below is: `r + lineWidth / 2 = 110`

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*f0-CTpClWkMAAAAAAAAAAAAAARQnAQ" width="300">

supports `number` and `string` types, the former defaulting to length values in `px`, with the following writing equivalents.

```js
circle.style.lineWidth = 1;
circle.style.lineWidth = '1';
circle.style.lineWidth = '1px';
```

| [Initial value](/en/api/css/css-properties-values-api#initial-value) | Applicable elements | [Inheritable](/en/api/css/inheritance) | Animatable | [Computed value](/en/api/css/css-properties-values-api#computed-value)                                                        |
| -------------------------------------------------------------------- | ------------------- | -------------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------- |
| '1'                                                                  | all                 | yes                                    | yes        | [\<percentage\>](/en/api/css/css-properties-values-api#percentage) [\<length\>](/en/api/css/css-properties-values-api#length) |

#### lineCap

Endpoint style, supporting the following values.

- 'butt' Default value. The end of the line segment ends in a square.
- 'round' The line segment ends in a circle.
- 'square' The line segment ends in a square, but adds a rectangular area with the same width as the line segment and half the height of the line segment's thickness.

https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/lineCap

#### lineJoin

Supporting the following values.

- 'miter' Default. An additional diamond-shaped area is formed by extending the outer edges of the connected sections so that they intersect at a point. The effect of this setting can be seen with the [miterLimit](/en/api/basic/display-object#miterlimit) property.
- 'round' Draws the shape of the corner by filling an additional, circular sector with the center of the circle at the end of the connected section. The radius of the rounded corner is the width of the line segment.
- 'bevel' An additional triangular-base area is filled in at the end of the connected sections, each with its own separate rectangular corner.

https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/lineJoin

#### miterLimit

The default value for SVG and Canvas2D is different, the former is 4 and the latter is 10. We set [Path](/en/api/basic/path) [Polyline](/en/api/basic/polyline) [Polygon](/en/api/basic/polygon) to 4 and the rest to 10. api/basic/polygon) These three graphs are set to 4, and the rest are set to 10.

https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/miterLimit

#### lineDash

Use `number[]` to describe the alternate line segments and spacing. Reference can be made to: https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/setLineDash

Currently only the form `[dash, gap]` is supported, if there is only one element in the array, i.e. `[dash]` is equivalent to `[dash, dash]`.

Applying animation to it can achieve [handwriting animation effect](/en/api/animation/waapi#stroke-animation).

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*8NOsQoWLm2IAAAAAAAAAAAAAARQnAQ" width="400" alt="stroke animation">

| [Initial value](/en/api/css/css-properties-values-api#initial-value) | Applicable elements | [Inheritable](/en/api/css/inheritance) | Animatable | [Computed value](/en/api/css/css-properties-values-api#computed-value) |
| -------------------------------------------------------------------- | ------------------- | -------------------------------------- | ---------- | ---------------------------------------------------------------------- |
| -                                                                    | all                 | yes                                    | yes        |                                                                        |

#### lineDashOffset

Dashed line offset, type `number`, transform it to achieve [marching ants animation](/en/api/animation/waapi#marching-ant-animation)

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*TTyTTISXlKAAAAAAAAAAAAAAARQnAQ" width="400" alt="marching ants animation">

| [Initial value](/en/api/css/css-properties-values-api#initial-value) | Applicable elements | [Inheritable](/en/api/css/inheritance) | Animatable | [Computed value](/en/api/css/css-properties-values-api#computed-value)                                                        |
| -------------------------------------------------------------------- | ------------------- | -------------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------- |
| '0'                                                                  | all                 | yes                                    | yes        | [\<percentage\>](/en/api/css/css-properties-values-api#percentage) [\<length\>](/en/api/css/css-properties-values-api#length) |

### Shadow

Add shadow effect at the bottom of the shape, support configuring shadow color, blur radius and horizontal/vertical offset distance. [example](/en/examples/shape#circle).

Shadows do not affect the graph's [Geometry Bounds](/en/api/basic/concept#bounding-box), e.g. in the following figure, after adding a shadow to a circle with a radius of 100, the geometry wrapping box size remains the same.

```js
circle.getBounds(); // { halfExtents: [100, 100] }
circle.style.shadowBlur = 20;
circle.getBounds(); // { halfExtents: [100, 100] }
```

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*shbSR55j_iQAAAAAAAAAAAAAARQnAQ" width="200" alt="outer shadow">

Of course outer shadows increase the [Render Bounds](/en/api/basic/concept#bounding-box), inner shadows do not.

Finally, shadows can have a very big impact on rendering performance.

#### shadowType

We currently support two kinds of shadow.

- `'outer'` Outer Shading, which is also the default value for this property. The shadow appears on the outside of the drawing fill or stroke.
- `'inner'` Internal shading. As the name implies the shadows are inside the graph, as shown in the figure below.

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*0uHfQa00ZeYAAAAAAAAAAAAAARQnAQ" width="200" alt="inner shadow">

#### shadowColor

Shade color, supports `string` type, for example `'#1890FF'`. Gradient or pattern writing is not supported.

| [Initial value](/en/api/css/css-properties-values-api#initial-value) | Applicable elements | [Inheritable](/en/api/css/inheritance) | Animatable | [Computed value](/en/api/css/css-properties-values-api#computed-value) |
| -------------------------------------------------------------------- | ------------------- | -------------------------------------- | ---------- | ---------------------------------------------------------------------- |
| -                                                                    | all                 | no                                     | yes        | [\<color\>](/en/api/css/css-properties-values-api#color)               |

#### shadowBlur

The blurring degree of the shading effect, `number` type, negative numbers are not allowed. Larger means more blurred, 0 means no blurring effect.

| [Initial value](/en/api/css/css-properties-values-api#initial-value) | Applicable elements | [Inheritable](/en/api/css/inheritance) | Animatable | [Computed value](/en/api/css/css-properties-values-api#computed-value) |
| -------------------------------------------------------------------- | ------------------- | -------------------------------------- | ---------- | ---------------------------------------------------------------------- |
| -                                                                    | all                 | no                                     | yes        | [\<number\>](/en/api/css/css-properties-values-api#number)             |

#### shadowOffsetX

Horizontal offset, supports `number` or `string` types, e.g. negative numbers move shadows to the left, positive numbers to the right.

| [Initial value](/en/api/css/css-properties-values-api#initial-value) | Applicable elements | [Inheritable](/en/api/css/inheritance) | Animatable | [Computed value](/en/api/css/css-properties-values-api#computed-value)                                                        |
| -------------------------------------------------------------------- | ------------------- | -------------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------- |
| -                                                                    | all                 | no                                     | yes        | [\<percentage\>](/en/api/css/css-properties-values-api#percentage) [\<length\>](/en/api/css/css-properties-values-api#length) |

#### shadowOffsetY

Vertical offset, e.g. a negative number moves the shadow up, a positive number down.

| [Initial value](/en/api/css/css-properties-values-api#initial-value) | Applicable elements | [Inheritable](/en/api/css/inheritance) | Animatable | [Computed value](/en/api/css/css-properties-values-api#computed-value)                                                        |
| -------------------------------------------------------------------- | ------------------- | -------------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------- |
| -                                                                    | all                 | no                                     | yes        | [\<percentage\>](/en/api/css/css-properties-values-api#percentage) [\<length\>](/en/api/css/css-properties-values-api#length) |

### Filter

Filters can perform some processing on the generated image, such as blurring, highlighting, boosting contrast, etc. The following implementations are available on the web side.

- CSS Filter: https://developer.mozilla.org/en-US/docs/Web/CSS/filter
- Canvas Filter: https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/filter
- SVG Filter: https://developer.mozilla.org/zh-CN/docs/Web/SVG/Element/filter
- Post Processing in WebGL.

Referring to the CSS Filter syntax, we support applying one or more filter effects to a shape, [example](/en/examples/shape#filter).

```js
circle.style.filter = 'blur(5px)';
circle.style.filter = 'blur(5px) brightness(0.4)'; // Stackable
```

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*3MxRTpAT77gAAAAAAAAAAAAAARQnAQ" alt="filters" width="300">

Filters can currently be used in the g-canvas/svg/webgl renderer with the following caveats.

- Due to poor Canvas Filter support, mainly [Safari does not support](https://caniuse.com/mdn-api_canvasrenderingcontext2d_filter), filters are not displayed properly in Safari using g-canvas
- g-canvas and g-svg differ slightly in some filter effects
- Can be applied to all base graphs and Groups
- This property does not support animation at this time

#### blur

Applies a Gaussian blur to the input image. where radius defines the standard deviation value of the Gaussian function, or how many pixels on the screen blend into each other so that larger values will produce more blur, with a default value of 0. This parameter can be specified as a CSS length, but does not accept percentage values.

As with shadows, blurring also does not affect the size of the geometry bounds for graphics.

```js
circle.style.filter = 'blur(5px)';
```

The following figure shows the blurring effect of 2px 4px and 10px in order, [example](/en/examples/shape#filter).

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*rYA_TLechgYAAAAAAAAAAAAAARQnAQ" width="300" alt="blur filter">

#### brightness

Applies a linear multiplier to the input image to make it lighter or darker, with a default value of 1. A value of 0% will create an all-black image. A value of 100% will leave the input unchanged. Other values are linear multipliers of the effect. Values greater than 100% provide brighter results.

```js
circle.style.filter = 'brightness(2)';
circle.style.filter = 'brightness(200%)';
```

The following figure shows the bright effects of 0 100% and 200% in order, [example](/en/examples/shape#filter).

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*LG_pQ6GzA3wAAAAAAAAAAAAAARQnAQ" width="300" alt="brightness filter">

#### drop-shadow

To display the shadows under the image, you can set the shadow color, offset and blur effect by passing in the following parameters in order.

- offset-x Describes the horizontal offset distance of the shadow in px
- offset-y Describes the vertical offset distance of the shadow in px
- blur-radius The larger the value, the more ambiguous it is, in px, no negative numbers allowed
- color

The shading does not affect the size of the geometry bounding box of the graph.

```js
circle.style.filter = 'drop-shadow(16px 16px 10px black)';
```

The following figure shows the effect of the above configuration in turn, [example](/en/examples/shape#filter).

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*shbSR55j_iQAAAAAAAAAAAAAARQnAQ" width="300" alt="drop-shadow filter">

#### contrast

Adjusts the contrast of the image. When the value is 0%, the image becomes completely black. When the value is 100%, the image does not change at all.

```js
circle.style.filter = 'contrast(2)';
circle.style.filter = 'contrast(200%)';
```

The following figure shows the contrast effect of 0, 1 and 10 in order，[example](/en/examples/shape#filter).

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*gc-1QJYr2awAAAAAAAAAAAAAARQnAQ" width="300" alt="contrast filter">

#### grayscale

Converts the image to a gray picture. When the value is 100%, the image turns completely gray. When the value is 0%, the image does not change at all.

```js
circle.style.filter = 'grayscale(1)';
circle.style.filter = 'grayscale(100%)';
```

The following figure shows the grayscale effect of 0 50% and 100% in order, [example](/en/examples/shape#filter).

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*OadOQLl_bH0AAAAAAAAAAAAAARQnAQ" alt="grayscale filter" width="300">

#### saturate

Saturation is applied to the image. When the value is 0%, the image is not saturated at all. When the value is 100%, there is no change in the image.

```js
circle.style.filter = 'saturate(1)';
circle.style.filter = 'saturate(100%)';
```

The following figure shows the saturation effect at 0 50% and 100% in order, [example](/en/examples/shape#filter).

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*8J4IRJTJcVUAAAAAAAAAAAAAARQnAQ" alt="saturate filter" width="300">

#### sepia

Applies sepia processing to the image (nostalgic style). When the value is 100%, the image becomes completely sepia. When the value is 0%, the image does not change at all.

```js
circle.style.filter = 'sepia(1)';
circle.style.filter = 'sepia(100%)';
```

The following figure shows the results of 0 50% and 100% processing in order, [example](/en/examples/shape#filter).

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*79UARqYrimcAAAAAAAAAAAAAARQnAQ" alt="saturate filter" width="300">

#### hue-rotate

Applying hue rotation to the input image sets the value of the color ring angle at which the image will be adjusted. The image does not change when the value is 0deg.

```js
circle.style.filter = 'hue-rotate(30deg)';
circle.style.filter = 'hue-rotate(180deg)';
```

The following figure shows the effect of 0, 90deg and 180deg processing in turn, [example](/en/examples/shape#filter).

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*k8rsSbW4WRwAAAAAAAAAAAAAARQnAQ" alt="saturate filter" width="300">

#### invert

Inverts the color of the input image. amount defines the percentage of conversion, 100% means complete inversion, 0% means no change in the image.

```js
circle.style.filter = 'invert(1)';
circle.style.filter = 'invert(100%)';
```

The following figure shows in turn the effect of 0, 50% and 100% inversions, [example](/en/examples/shape#filter).

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*N1OjR6pR0CMAAAAAAAAAAAAAARQnAQ" alt="saturate filter" width="300">

### zIndex

Similar to CSS's `z-index` property, used to control the rendering order, it needs to be noted that

1. Only affects the rendering order, and does not change the node structure in the scene graph.
2. Effective only in the current context.
3. The default display order is the order in which the scenes are added, with those added later on top of the previously added elements.

| [Initial value](/en/api/css/css-properties-values-api#initial-value) | Applicable elements | [Inheritable](/en/api/css/inheritance) | Animatable | [Computed value](/en/api/css/css-properties-values-api#computed-value) |
| -------------------------------------------------------------------- | ------------------- | -------------------------------------- | ---------- | ---------------------------------------------------------------------- |
| '0'                                                                  | all                 | no                                     | no         | [\<number\>](/en/api/css/css-properties-values-api#number)             |

For example, in the scene below, li2 is displayed on top of li1 by default because li2 was added to the canvas after li1. If you want to change this display order, you can modify the zIndex of li1:

```js
// ul1 -> li1
//     -> li2
// ul2 -> li3

li1.style.zIndex = 1; // li1 在 li2 之上
```

For example, even though li2 has a much larger zIndex than ul2, it can only be under ul2 because ul1 is smaller than ul2, [example](/en/examples/scenegraph#z-index)

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*FfZhRYJ_rogAAAAAAAAAAAAAARQnAQ" alt="z-index" width="500">

For compatibility with older versions, we also provide the following methods:

| name      | parameters | return value | remarks |
| --------- | ---------- | ------------ | ------- |
| setZIndex | `number`   | -            | -       |
| toFront   | -          | -            | -       |
| toBack    | -          | -            | -       |

```javascript
const group = new Group();

group.setZIndex(100);
// or group.setAttribute('zIndex', 100);
// or group.style.zIndex = 100;
```

### visibility

To control the visibility of the graph, see. https://developer.mozilla.org/en-US/docs/Web/CSS/visibility

For compatibility with older versions, the following methods are also provided.

| name | parameters | return value | remarks |
| ---- | ---------- | ------------ | ------- |
| hide | -          | -            | -       |
| show | -          | -            | -       |

Therefore the following write-ups are equivalent.

```javascript
const group = new Group();

group.style.visibility = 'hidden';
// or group.setAttribute('visibility', 'hidden');
// or group.hide();

group.style.visibility = 'visible';
// or group.setAttribute('visibility', 'visible');
// or group.show();
```

| [Initial value](/en/api/css/css-properties-values-api#initial-value) | Applicable elements | [Inheritable](/en/api/css/inheritance) | Animatable | [Computed value](/en/api/css/css-properties-values-api#computed-value) |
| -------------------------------------------------------------------- | ------------------- | -------------------------------------- | ---------- | ---------------------------------------------------------------------- |
| 'visible'                                                            | all                 | yes                                    | no         | [\<keywords\>](/en/api/css/css-properties-values-api#keywords)         |

There are two points to note about visibility.

1. Hidden graphics can still be picked up, so use [pointerEvents](/en/api/basic/display-object#pointerevents)
2. Hidden elements still need to participate in enclosing box operations, i.e. they still occupy space. If you want to remove the element completely, you should use [removeChild](/en/api/basic/display-object#addremove-nodese)

### clipPath

Use clipping to create a displayable region of an element, with the parts inside the region shown and the parts outside the region hidden. See CSS's [clip-path](https://developer.mozilla.org/zh-CN/docs/Web/CSS/clip-path). The value of this property can be any shape, such as Circle, Rect, etc. The same clipping region can be shared by multiple shapes. Finally, the crop region also affects the pickup area of the shapes, [example](/en/examples/event#shapes).

For example, if we want to create a picture that is cropped into a circle, so that the cropping area is just in the center of the picture (size 200 \* 200), we can set the world coordinates of the circle in the cropping area to `[100, 100]`. [example](/en/examples/shape#clip).

```js
const image = new Image({
  style: {
    x: 0,
    y: 0,
    width: 200,
    height: 200,
    clipPath: new Circle({
      style: {
        cx: 100,
        cy: 100,
        r: 50,
      },
    }),
  },
});
```

It is also possible to set the cropping area after creating the drawing, so the above writeup is equivalent to:

```js
const image = new Image({
  style: {
    //...
  },
});

image.style.clipPath = new Circle({
  style: {
    cx: 100,
    cy: 100,
    r: 50,
  },
});
// or
image.setClip(
  new Circle({
    style: {
      cx: 100,
      cy: 100,
      r: 50,
    },
  }),
);
```

When we want to clear the cropping area, we can set it to `null`.

```js
image.style.clipPath = null;
// or
image.setClip(null);
```

#### Caveats

The crop area graphic itself is also supported to modify the property, and affected by it, the cropped graphic will be redrawn immediately. For example, with [animation system](/en/api/animation/waapi) we can transform the cropped area graphic to achieve the following effect, [example](/en/examples/shape#clip).

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*Iy4RQZgT3EUAAAAAAAAAAAAAARQnAQ)

```js
// Apply animation to clipped areas
clipPathCircle.animate(
  [{ transform: 'scale(1)' }, { transform: 'scale(1.2)' }],
  {
    duration: 1500,
    iterations: Infinity,
  },
);
```

We do not yet support composite clipped areas, such as custom graphics and Group.

### Offset Path

In [path-animation](/en/api/animation/waapi#path-animation), we can use `offsetPath` to specify the trajectory of a drawing, applying a transformation to the `offsetDistance` property.

```js
const circle = new Circle({
  style: {
    offsetPath: new Line({
      style: {
        // There is no need to set other drawing properties that are not related to trajectories
        x1: 100,
        y1: 100,
        x2: 300,
        y2: 100,
      },
    }),
    r: 10,
  },
});

const animation = circle.animate(
  [{ offsetDistance: 0 }, { offsetDistance: 1 }],
  {
    duration: 3000,
    easing: 'ease-in-out',
    iterations: Infinity,
  },
);
```

#### offsetPath

Specify path trajectory, currently support [Line](/en/api/basic/line) [Path](/en/api/basic/path) and [Polyline](/en/api/basic/polyline) these three graphics.

#### offsetDistance

The distance to travel from the start of the path, in the range of `[0-1]`, where 0 is the start of the path and 1 is the end.

| [Initial value](/en/api/css/css-properties-values-api#initial-value) | Applicable elements | [Inheritable](/en/api/css/inheritance) | Animatable | [Computed value](/en/api/css/css-properties-values-api#computed-value) |
| -------------------------------------------------------------------- | ------------------- | -------------------------------------- | ---------- | ---------------------------------------------------------------------- |
| '0'                                                                  | all                 | no                                     | yes        | [\<number\>](/en/api/css/css-properties-values-api#number)             |

### Cursor style

We can change the style of a graphic when the mouse hovers over it, by modifying the CSS style of the container.

The values supported by the `cursor` property can be found at https://developer.mozilla.org/zh-CN/docs/Web/CSS/cursor

```js
const circle = new Circle({
  style: {
    //...
    cursor: 'pointer',
  },
});
```

### Responding to interaction events

We can set how the graph responds to interaction events, such as displaying the mouse style when hitting a pickup, or increasing the pickup area.

#### pointerEvents

To set how the graph responds to interaction events, see. https://developer.mozilla.org/en-US/docs/Web/CSS/pointer-events

简而言之，[fill](/en/api/basic/display-object#fill) [stroke](/en/api/basic/display-object#stroke) 和 [visibility](/en/api/basic/display-object#visibility) 都可以独立或组合影响拾取判定行为。目前支持以下关键词：

- `'auto'` Default value, equivalent to `'visiblepainted'`.
- `'none'` Will never be the target of a response event.
- `'visiblepainted'` The following conditions are met before the event is responded to.
  - [visibility](/en/api/basic/display-object#visibility) takes `'visible'` which means the graph is visible.
  - Trigger while [fill](/en/api/basic/display-object#fill) takes a value other than `'none'` in the graphics fill area. Or [stroke](/en/api/basic/display-object#stroke) takes a value other than `'none'` when triggered in the drawing stroke area.
- `'visiblefill'` The following conditions are met before the event is responded to.
  - [visibility](/en/api/basic/display-object#visibility) takes `'visible'` which means the graph is visible an not affected by the value of [fill](/en/api/basic/display-object#fill).
- `'visiblestroke'` The following conditions are met before the event is responded to.
  - [visibility](/en/api/basic/display-object#visibility) takes `'visible'` which means the graph is visible an not affected by the value of [stroke](/en/api/basic/display-object#stroke).
- `'visible'` The following conditions are met before the event is responded to.
  - [visibility](/en/api/basic/display-object#visibility) takes `'visible'`.
  - Triggered in drawing fill or stroke area, not affected by [fill](/en/api/basic/display-object#fill) and [stroke](/en/api/basic/display-object#stroke) values.
- `'painted'` The following conditions are met before the event is responded to.
  - Trigger while [fill](/en/api/basic/display-object#fill) takes a value other than `'none'` in the graphics fill area. Or [stroke](/en/api/basic/display-object#stroke) takes a value other than `'none'` when the drawing stroke area is triggered. Not affected by the value of [visibility](/en/api/basic/display-object#visibility).
- `'fill'` The following conditions are met before the event is responded to.
  - Triggered in graphics fill area, not affected by [fill](/en/api/basic/display-object#fill) and [visibility](/en/api/basic/display-object#visibility) values.
- `'stroke'` The following conditions are met before the event is responded to.
  - Triggered in graphics fill area, not affected by [stroke](/en/api/basic/display-object#stroke) and [visibility](/en/api/basic/display-object#visibility) values.
- `'all'` The events are responded to whenever the fill and stroke areas of the drawing are entered. So it will not be affected by [fill](/en/api/basic/display-object#fill) [stroke](/en/api/basic/display-object#stroke) [visibility](/en/api/ basic/display-object#visibility) is affected by the value of

In this [example](/en/examples/shape#circle), we set the property to `stroke`, so the filled area will not respond to events.

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*2a6jSpYP0LoAAAAAAAAAAAAAARQnAQ" alt="pointer-events stroke">

In this [example](/en/examples/style#inheritance), we can easily control the interactivity based on the inheritance mechanism.

```js
// The entire canvas does not respond to interaction events
canvas.document.documentElement.style.pointerEvents = 'none';
```

| [Initial value](/en/api/css/css-properties-values-api#initial-value) | Applicable elements | [Inheritable](/en/api/css/inheritance) | Animatable | [Computed value](/en/api/css/css-properties-values-api#computed-value) |
| -------------------------------------------------------------------- | ------------------- | -------------------------------------- | ---------- | ---------------------------------------------------------------------- |
| 'auto'                                                               | all                 | yes                                    | no         | [\<keywords\>](/en/api/css/css-properties-values-api#关键词)           |

#### increasedLineWidthForHitTesting

When [lineWidth](/en/api/basic/display-object#linewidth) is small, the interactable area becomes smaller, sometimes we want to increase this area to make the "thin line" easier to be picked up. Note that this property does not affect the rendering effect.

In the [example](/en/examples/shape#polyline) below, we set this property to `50`, so that the line width is equal to `50 + the original line width` when picking up, making it easier to pick up when close:

 <img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*0ISzTIiefZ0AAAAAAAAAAAAAARQnAQ">

```js
line.style.increasedLineWidthForHitTesting = 50;
```

Also like [lineWidth](/en/api/basic/display-object#linewidth), this property also extends to the sides, and in the image below the unfilled [Path](/en/api/basic/path) internal pickup area has been enlarged.

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*ude1Qo6PVNYAAAAAAAAAAAAAARQnAQ">

| [Initial value](/en/api/css/css-properties-values-api#initial-value) | Applicable elements | [Inheritable](/en/api/css/inheritance) | Animatable | [Computed value](/en/api/css/css-properties-values-api#computed-value)                                                        |
| -------------------------------------------------------------------- | ------------------- | -------------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------- |
| '0'                                                                  | all                 | no                                     | no         | [\<percentage\>](/en/api/css/css-properties-values-api#percentage) [\<length\>](/en/api/css/css-properties-values-api#length) |

## Transformation operations

We offer a range of transformation methods.

### Translation

For translation operations, we provide APIs for moving absolute/relative distances in local/world coordinate systems.

| method name      | parameters                                         | return value       | remarks                                                          |
| ---------------- | -------------------------------------------------- | ------------------ | ---------------------------------------------------------------- |
| translate        | `[number, number]` or `number, number` or `number` | -                  | Move relative to current position in **world coordinate system** |
| translateLocal   | `[number, number]` or `number, number` or `number` | -                  | Move relative to current position in **local coordinate system** |
| setPosition      | `[number, number]` or `number, number` or `number` | -                  | Sets the position in the **world coordinate system**.            |
| setLocalPosition | `[number, number]` or `number, number`or `number`  | -                  | Set the position under the **local coordinate system**           |
| getPosition      | -                                                  | `[number, number]` | Get the position in the **world coordinate system**              |
| getLocalPosition | -                                                  | `[number, number]` | Get the position in the **local coordinate system**              |

`translate/translateLocal/setPosition/setLocalPosition` supports the following input forms, where if you want to modify only the X-axis direction, you can pass only one number.

```js
circle.translate([100, 0]); // [number, number]
circle.translate(100, 0); // number, number
circle.translate(100); // number
```

### Scaling

Unlike panning, we can't provide a method like `setScale` to set scaling in the world coordinate system, so scaling in the global coordinate system is read-only, which in Unity is called [lossyScale](https://forum.unity.com/threads/solved-why-is-transform-lossyscale-readonly.363594/)。

| method name   | parameters                                         | return value       | remarks                                                                            |
| ------------- | -------------------------------------------------- | ------------------ | ---------------------------------------------------------------------------------- |
| scaleLocal    | `[number, number]` or `number, number` or`number`  | -                  | Continued scaling with respect to the current scale in **local coordinate system** |
| setLocalScale | `[number, number]` or `number, number` or `number` | -                  | Set the scaling in **local coordinate system**                                     |
| getScale      | -                                                  | `[number, number]` | Get the scaling in **world coordinate system**                                     |
| getLocalScale | -                                                  | `[number, number]` | Get the scaling in **local coordinate system**                                     |

`scaleLocal/setLocalScale` supports the following input forms, where only one number can be passed if the horizontal/vertical scaling is equal.

```js
circle.scaleLocal([2, 2]); // [number, number]
circle.scaleLocal(2, 2); // number, number
circle.scaleLocal(2); // number
```

If you want to flip along the X / Y axis, you can pass in a negative value, e.g. flip along the Y axis.

```js
circle.setLocalScale(-1, 1);
```

### Rotation

In 3D scenes, rotations can be represented by matrices, axis angles, Euler angles and quaternions, which are interconvertible with each other. Although, considering future scalability, we use quaternions in the G internal implementation.

| method name         | parameters | return value | remarks                                                                                                 |
| ------------------- | ---------- | ------------ | ------------------------------------------------------------------------------------------------------- |
| rotateLocal         | `number`   | -            | In the **local coordinate system**, rotate by a certain Eulerian angle, clockwise positive, in `degree` |
| rotate              | `number`   | -            | In **world coordinate system**, rotate by a certain Eulerian angle                                      |
| setEulerAngles      | `number`   | -            | In **world coordinate system**, rotate by a certain Eulerian angle                                      |
| setLocalEulerAngles | `number`   | -            | Set the Euler angles in the **local coordinate system**.                                                |
| setLocalRotation    | `quat`     | -            | Sets the number of quaternions in the **local coordinate system**.                                      |
| setRotation         | `quat`     | -            | Sets the number of quaternions in the **world coordinate system**.                                      |
| getEulerAngles      | -          | `number`     | Get the Euler angles in **world coordinate system**                                                     |
| getLocalEulerAngles | -          | `number`     | Get the Euler angles in **local coordinate system**                                                     |
| getLocalRotation    | -          | `quat`       | Get the quaternion in **local coordinate system**                                                       |
| getRotation         | -          | `quat`       | Get the quaternion in **world coordinate system**                                                       |

### Skew

In 2D scenes, stretching can be performed to distort each point on an element in a certain direction at a certain angle. See [CSS eponymous transform function](https://developer.mozilla.org/zh-CN/docs/Web/CSS/transform-function#skew).

| method name  | parameters | return values | remarks                                                                                                                    |
| ------------ | ---------- | ------------- | -------------------------------------------------------------------------------------------------------------------------- |
| setLocalSkew | `vec2`     | -             | The angle in `rad` that distorts the element along the horizontal/vertical coordinates in the **local coordinate system**. |
| getLocalSkew | -          | `vec2`        | Gets the distortion angle in `rad` under the **local coordinate system**.                                                  |

### Set the scaling and rotation center

Using the [transformOrigin](/en/api/basic/display-object#transformorigin) property, you can also use `setOrigin`.

| method name | parameters                                                                                       | return value | remarks                                                             |
| ----------- | ------------------------------------------------------------------------------------------------ | ------------ | ------------------------------------------------------------------- |
| setOrigin   | `[number, number]` or `[number, number, number]` or `number, number` or `number, number, number` | -            | Set the scaling and rotation center in the local coordinate system. |
| getOrigin   | `[number, number, number]`                                                                       | -            | Get the scaling and rotation center in the local coordinate system. |

Set the center of scaling and rotation in the local coordinate system, [example](/en/examples/scenegraph#origin).

The default value is `[0, 0]`.

In the following example, we have placed a circle with a radius of 100 at `[100, 100]`.

```js
const circle = new Circle({
  style: {
    cx: 100,
    cy: 100,
    r: 100,
  },
});
```

If we want the circle to be scaled with the center of the circle as the center of transformation, and it is the enclosing box that changes.

```js
circle.setOrigin(100, 100);
circle.scale(0.5);
circle.getBounds(); // { center: [100, 100], halfExtents: [50, 50] }
```

But if we want the circle to be scaled by its own upper left corner of the bounding box:

```js
circle.setOrigin(0, 0);
circle.scale(0.5);
circle.getBounds(); // { center: [50, 50], halfExtents: [50, 50] }
```

In the following [example](/en/examples/scenegraph#origin), we have created a rectangle whose default anchor point is the upper left corner of the enclosing box in the local coordinate system. If we want it to rotate at the center of the enclosing box, we need to set the transformation center to be offset by half the length and width relative to the anchor point, i.e., `[150, 100]`.

```js
const rect = new Rect({
  id: 'rect',
  style: {
    width: 300,
    height: 200,
  },
});
rect.setOrigin(150, 100); // Set the rotation and scaling center to the center point of its own bounding box
```

For example, if we want to modify the transformation center of a circle to the upper left corner instead of the center of the circle, we can do so.

```js
const circle = new Circle({
  style: {
    cx: 100,
    cy: 100,
    r: 100,
  },
});

circle.setOrigin(0, 0);
// or
circle.style.transformOrigin = 'left top';
// or
circle.style.transformOrigin = '0px 0px';
// or
circle.style.transformOrigin = '0% 0%';
```

The difference between the two is that origin is defined relative to the anchor point, while transformOrigin is defined relative to the bounding box.

## Get Bounding box

Based on different [bounding box definitions](/en/api/basic/display-object#bounding-box), we provide the following methods to obtain them.

### getGeometryBounds(): AABB | null

Gets the geometric bouding box of the base drawing, which is independent of other drawing properties (e.g. [lineWidth](/en/api/basic/display-object#linewidth), [filter](/en/api/basic/display-object#filter), [shadowBlur](/en/api/basic/display-object#shadowblur), etc.), except for defining the required style properties (e.g. r for Circle, width/height for Rect).

```js
const circle = new Circle({
  style: {
    cx: 100, // Coordinates in the local coordinate system do not affect Geometry Bounds
    cy: 100, // Coordinates in the local coordinate system do not affect Geometry Bounds
    r: 100,
    lineWidth: 20, // Style properties do not affect Geometry Bounds
    shadowBlur: 10, // Style properties do not affect Geometry Bounds
  },
});
circle.getGeometryBounds(); // { center: [0, 0], halfExtents: [100, 100] }
```

Group returns null because there is no geometry definition.

```js
const group = new Group();
group.getGeometryBounds(); // null
```

### getBounds(): AABB | null

This should be the most common way of calculating the Geometry Bounds of itself and its children in the world coordinate system.

```js
const circle = new Circle({
  style: {
    cx: 100, // Applying transformations in the world coordinate system
    cy: 100,
    r: 100,
  },
});
circle.getBounds(); // { center: [100, 100], halfExtents: [100, 100] }
```

### getRenderBounds(): AABB | null

Merge the Render Bounds of itself and its children in the world coordinate system, based on the Geometry Bounds, affected by the following style properties: [lineWidth](/en/api/basic/display-object#linewidth), [filter](/en/api/basic/display-object#filter), [shadowBlur](/en/api/basic/display-object#shadowblur), etc.

```js
const circle = new Circle({
  style: {
    cx: 100, // Applying transformations in the world coordinate system
    cy: 100,
    r: 100,
    lineWidth: 20,
  },
});
// r + lineWidth / 2
circle.getRenderBounds(); // { center: [100, 100], halfExtents: [110, 110] }
```

### getLocalBounds(): AABB | null

The only difference in getBounds is that it is calculated under the local coordinate system of the parent node.

### getBBox(): Rect

Compatible with [SVG method of the same name](https://developer.mozilla.org/en-US/docs/Web/API/SVGGraphicsElement/getBBox), the calculation is equivalent to getBounds, except that the return value type is different, the latter returns AABB. This method returns a [DOMRect](https://developer.mozilla.org/zh-CN/docs/Web/API/DOMRect).

```js
interface DOMRect {
  top: number;
  left: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}
```

### getBoundingClientRect(): DOMRect

Get the Geometry Bounds in the browser coordinate system, apply the transformation in the world coordinate system, and then add the offset of the canvas relative to the browser.

## Node Operations

In the scene graph, we need to construct parent-child relationships, get parent-child nodes quickly, and sometimes query the list of nodes of a certain type in the subtree. Based on the inheritance relationship, each DisplayObject has [Node](/en/api/builtin-objects/node) and [Element](/en/api/builtin-objects/element) capabilities.

### Simple Node Query

| method/property name | method/property | return value            | remarks                                                    |
| -------------------- | --------------- | ----------------------- | ---------------------------------------------------------- |
| parentNode           | property        | `DisplayObject \| null` | Parent node (if any)                                       |
| parentElement        | property        | `DisplayObject \| null` | Parent node (if any)                                       |
| childNodes           | property        | `DisplayObject[]`       | Child Node List                                            |
| children             | property        | `DisplayObject[]`       | Child Node List                                            |
| firstChild           | property        | `DisplayObject \| null` | Returns the first node in the list of child nodes (if any) |
| lastChild            | property        | `DisplayObject \| null` | Returns the last node in the list of child nodes (if any)  |
| nextSibling          | property        | `DisplayObject \| null` | Return the next sibling node (if any)                      |
| previousSibling      | property        | `DisplayObject \| null` | Return the previous sibling node (if any)                  |
| contains             | method          | `boolean`               | Whether the subtree contains a node (entry)                |
| getRootNode          | method          | `Node`                  | Returns the root node of the current node                  |
| ownerDocument        | property        | `Document`              | Back to the canvas entrance Document                       |
| isConnected          | property        | `boolean`               | Whether the node is added to the canvas                    |

### Advanced Search

Referring to the CSS selector, we provide the following query that looks at the **entire subtree** of the current node, and not just the direct list of children, but all descendant nodes.

| method name            | parameters            | return value             | remarks                                                      |
| ---------------------- | --------------------- | ------------------------ | ------------------------------------------------------------ |
| getElementById         | `(id: string)`        | `DisplayObject \| null`  | Query child nodes by `id`                                    |
| getElementsByName      | `(name: string)`      | `DisplayObject[]`        | Query the list of child nodes by `name`                      |
| getElementsByClassName | `(className: string)` | `DisplayObject[]`        | Query the list of child nodes by `className`                 |
| getElementsByTagName   | `(tagName: string)`   | `DisplayObject[]`        | Query the list of child nodes by `tagName`                   |
| querySelector          | `(selector: string)`  | `DisplayObject \｜ null` | Query the first child node that satisfies the condition      |
| querySelectorAll       | `(selector: string)`  | `DisplayObject[]`        | Query the list of all child nodes that satisfy the condition |
| find                   | `(filter: Function)`  | `DisplayObject \｜ null` | Query the first child node that satisfies the condition      |
| findAll                | `(filter: Function)`  | `DisplayObject[]`        | Query the list of all child nodes that satisfy the condition |

We demonstrate how to use these query methods using the above example of the solar system.

```javascript
solarSystem.getElementsByName('sun');
// sun

solarSystem.getElementsByTagName('circle');
solarSystem.getElementsByTagName(Shape.CIRCLE);
// [sun, earth, moon]

solarSystem.querySelector('[name=sun]');
// sun

solarSystem.querySelectorAll('[r=25]');
// [moon]
```

Sometimes the query criteria are not well described by CSS selectors, so you can use custom query methods: find/findAll. they can be compared to querySelector/querySelectorAll. the difference is that the former requires passing in a filter, for example the following is equivalent.

```js
solarSystem.querySelector('[name=sun]');
solarSystem.find((element) => element.name === 'sun');

solarSystem.querySelectorAll('[r=25]');
solarSystem.findAll((element) => element.style.r === 25);
```

### Add/Remove Nodes

The following add/remove node capabilities come from the inherited [Element](/en/api/builtin-objects/element) base class.

| method name     | parameters                                            | return value    | remarks                                                                                                 |
| --------------- | ----------------------------------------------------- | --------------- | ------------------------------------------------------------------------------------------------------- |
| appendChild     | `child: DisplayObject`                                | `DisplayObject` | Adds a child node and returns the added node                                                            |
| insertBefore    | `child: DisplayObject` or `reference?: DisplayObject` | `DisplayObject` | Add a child node, before some child node (if any), and return the added node                            |
| append          | `...nodes: DisplayObject[]`                           |                 | Add a group of nodes in bulk at the end of the child node list of the current node                      |
| prepend         | `...nodes: DisplayObject[]`                           |                 | Add a group of nodes in bulk to the head of the current node's child node list                          |
| after           | `...nodes: DisplayObject[]`                           |                 | Add some sibling nodes in bulk after the current node                                                   |
| before          | `...nodes: DisplayObject[]`                           |                 | Add some sibling nodes in bulk before the current node                                                  |
| removeChild     | `child: DisplayObject`                                | `DisplayObject` | Delete the child node and return the node that was deleted.                                             |
| removeChildren  |                                                       |                 | Delete and destroy all child nodes.                                                                     |
| remove          | `destroy = true`                                      | `DisplayObject` | Remove itself from the parent node (if any), `destroy` indicates whether to destroy                     |
| replaceChild    | `child: DisplayObject`                                | `DisplayObject` | Replace a child node of the current node with the specified node, and return the replaced node          |
| replaceWith     | `...nodes: DisplayObject[]`                           |                 | In the list of children of the parent node, replace the node with the list of nodes passed in           |
| replaceChildren | `...nodes: DisplayObject[]`                           |                 | Replace all children of the node. If no parameters are passed, all children of the node will be cleared |

There are two ways to remove a child node from a parent node and destroy it.

```js
// parent -> child
parent.removeChild(child);

// or
child.remove();
```

There are three ways to delete all child nodes.

```js
parent.removeChildren();

// or
[...parent.children].forEach((child) => parent.removeChild(child));
[...parent.children].forEach((child) => child.remove());

// or
parent.replaceChildren();
```

The following points are noted when adding/removing nodes.

1. The ChildInserted and Inserted events are triggered sequentially when a node is added.
2. Removed and ChildRemoved events will be triggered sequentially, and [destroy](/en/api/basic/display-object#destroy) will be called by default to destroy itself. If the node is only temporarily removed from the scene graph and may be added back later, you can use `remove(false)`.

### Clone node

The method signature is `cloneNode(deep?: boolean): this`, with optional arguments for whether a deep copy is needed, and returns the new node obtained by cloning.

In the following example, we create a circle, set its radius and position. The new node is copied with the same style properties and position.

```js
circle.style.r = 20;
circle.setPosition(10, 20);

const clonedCircle = circle.cloneNode();
clonedCircle instanceof Circle; // true
clonedCircle.style.r; // 20
clonedCircle.getPosition(); // [10, 20]
```

Caveats:

- Deep copy support, i.e. itself and the whole subtree
- The cloned node does not retain the parent-child relationship of the original node and needs to be added to the canvas using `appendChild` before it will be rendered
- Consistent with the [DOM API](https://developer.mozilla.org/en-US/docs/Web/API/Node/cloneNode#notes), event listeners on the original drawing are not copied

In this [example](/en/examples/scenegraph#clone), we demonstrate the above features.

- The style properties of the original node can be changed at any time, and the copy obtained will be up-to-date, and the new node will also need to be added to the scene graph before it will be rendered
- However, since no event listeners will be copied, only the original node can be dragged
- In non-deep copy mode, Text (Drag me Text) is not copied as a child of Circle

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*PwEYSI_ijPEAAAAAAAAAAAAAARQnAQ)

### Get/Set attribute values

| method name  | parameters                   | return values | remarks                                     |
| ------------ | ---------------------------- | ------------- | ------------------------------------------- |
| getAttribute | `(name: string)`             | `null \| any` | Get attribute value based on attribute name |
| setAttribute | `(name: string, value: any)` | -             | Set attribute value                         |

⚠️ Compatible with the old `attr(name: string, value?: any)`, get and set attribute values.

⚠️ Compatible with [HTMLElement Style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style):

- style.[getPropertyValue](https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleDeclaration/getPropertyValue)
- style.[setProperty](https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleDeclaration/setProperty)
- style.[removeProperty](https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleDeclaration/removeProperty)

The following usage equivalents.

```js
const circle = new Circle({
  style: {
    // or using attrs
    r: 10,
    fill: 'red',
  },
});

// get attribute value
circle.getAttribute('fill'); // red
circle.attr('fill'); // red
circle.style.fill; // red
circle.style.getPropertyValue('fill');

// set attribute value
circle.setAttribute('r', 20);
circle.attr('r', 20);
circle.style.r = 20;
circle.style.setProperty('r', 20);
```

### Get the parsed attribute value

Some properties such as [Rect](/en/api/basic/rect) support units for width / height, if you want to get the [calculated value](/en/api/css/css-typed-om#cssunitvalue), you can use `parsedStyle`.

```js
rect.style.width = '100px';
rect.parsedStyle.width; // CSSUnitValue { unit: 'px', value: 100 }
```

Note that currently, when using [animation](/en/api/animation/waapi), we also convert the values of the attributes to be interpolated, so if you want to get the absolute values in px, you need to use `parsedStyle` [example](/en/examples/animation#onframe).

```js
animation.onframe = () => {
  rect.style.width; // '100px'
  rect.parsedStyle.width; // CSSUnitValue { unit: 'px', value: 100 }
};
```

### Destroy

Calling `destroy()` will destroy the node. Destroyed nodes will not be added to the canvas rendering again. The [destroyed](/en/api/basic/display-object#destroyed) attribute allows you to determine if a node has been destroyed.

```js
circle.destroy();
```

When this method is invoked, the following actions are performed in sequence.

1. Trigger Destroy event
2. Call `remove()` to remove itself from the scene graph, so it will trigger the Removed and ChildRemoved events
3. Remove all event listeners and animations on this node
4. Set the [destroyed](/en/api/basic/display-object#destroyed) flag to true

### Status

The following properties allow you to determine the current state of the drawing, such as whether it has been added to the canvas, whether it has been destroyed, etc.

#### isConnected

用于判断一个图形是否已经被加入到画布中。

https://developer.mozilla.org/zh-CN/docs/Web/API/Node/isConnected

```js
circle.isConnected; // false
canvas.appendChild(circle); // add to canvas
circle.isConnected; // true
```

#### ownerDocument

Used to determine if a drawing has been added to the canvas.

https://developer.mozilla.org/en-US/docs/Web/API/Node/ownerDocument

```js
circle.ownerDocument; // null
canvas.appendChild(circle); // add to canvas
circle.ownerDocument; // canvas.document
```

#### destroyed

Used to determine if a graph has been destroyed.

By calling `destroy()` to actively destroy itself, or the parent node by `destroyChildren()` to actively remove and destroy all children, etc.

```js
circle.destroyed; // false
circle.destroy();
circle.destroyed; // true
```

### Lifecycle Event Listening

In the [event system](/en/api/event), we can add event listeners to nodes added to the canvas using a DOM Event API-like approach.

In addition to interactive events such as click and mouseenter, we also provide a series of built-in node lifecycle events, such as listening for node additions and deletions, which also have full propagation paths (bubbling, capturing), [example](/en/examples/event#builtin).

```js
import { ElementEvent, MutationEvent } from '@antv/g';

child.on(ElementEvent.INSERTED, (e: MutationEvent) => {
  e.target; // child
  e.relatedNode; // parent
});
child.on(ElementEvent.REMOVED, (e) => {
  e.target; // child
  e.relatedNode; // parent
});
child.on(ElementEvent.ATTR_MODIFIED, (e) => {
  e.target; // child
  e.attrName;
  e.prevValue;
  e.newValue;
});

parent.appendChild(child);
```

We currently support the following scenario map related events.

- `INSERTED` Triggered when added as a child node
- `REMOVED` Triggered when removed as a child node
- `MOUNTED` Triggered when first entering the canvas
- `UNMOUNTED` Triggered when removed from the canvas
- `ATTR_MODIFIED` Triggered when modifying properties
- `DESTROY` Triggered on destruction

## Animation

Referring to the Web Animations API, you can use animate to complete the keyframe animation, the following is a ScaleIn animation effect.

```js
circle.animate(
  [
    {
      transform: 'scale(0)',
    },
    {
      transform: 'scale(1)',
    },
  ],
  {
    duration: 500,
    easing: 'cubic-bezier(0.250, 0.460, 0.450, 0.940)',
    iterations: Infinity,
  },
);
```

See [animation system](/en/api/animation/waapi) for more details on usage.

## Dataset API

https://developer.mozilla.org/en-US/docs/Learn/HTML/Howto/Use_data_attributes

`data-*` attributes allow us to store extra information on standard.

```js
group.dataset.type = 'a';
group.getAttribute('data-type'); // 'a'
```

It should be noted that the part after the `data-` prefix needs to use camel case when accessing through `dataset`:

```js
group.setAttribute('data-a-b-c');
group.dataset.aBC;

// Wrong
group.dataset.abc;
group.dataset.abC;
```
