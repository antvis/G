---
title: DisplayObject
order: 0
redirect_from:
    - /en/docs/api/basic
---

DisplayObject is the base class of all graph like [Group](/en/docs/api/basic/group), [Circle](/en/docs/api/basic/circle), [Text](/en/docs/api/basic/text) etc.

We tried to make it as compatible as possible with [DOM Element](https://developer.mozilla.org/en-US/docs/Web/API/Element), which in addition to reducing learning costs, allows us to take advantage of the existing Web ecosystem by disguising ourselves as a DOM Element, e.g.

-   Using CSS selectors for [advanced queries](/en/docs/plugins/css-select).
-   Using Hammer.js for [gesture](/en/docs/api/event#直接使用-hammerjs)
-   Using Interact.js for [Drag'n'Drop and Resize](/en/docs/api/event#直接使用-interactjs)
-   [Taking over D3's rendering implementation](/en/docs/guide/diving-deeper/d3)
-   [Taking over Observable Plot's rendering implementation](/en/docs/guide/diving-deeper/plot)

# Inherited from

[Element](/en/docs/api/builtin-objects/element)

# id

https://developer.mozilla.org/en-US/docs/Web/API/Element/id

Globally unique identifier, can be queried by [getElementById](/en/docs/api/display-object#advanced query).

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

# name

https://developer.mozilla.org/en-US/docs/Web/API/Document/getElementsByName

Graph name, not required to be globally unique, can be queried by [getElementsByName](/en/docs/api/display-object#advanced query).

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

# className

https://developer.mozilla.org/en-US/docs/Web/API/Element/className

The class name owned by the graphic, which can be used to get/set the class name of the graphic. It can be queried later using [getElementsByClassName](/en/docs/api/display-object#advanced query).

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

You can use spaces to separate multiple class names, and then use [classList](/en/docs/api/builtin-objects/element#classlist) read-only attribute to get a list of class names.

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

# interactive

Whether to support responding to [events](/en/docs/api/event), default is `true`. Can be turned off on some graphics that do not need to support interaction.

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

It is recommended to use the [pointerEvents](/en/docs/api/basic/display-object#pointerevents) attribute, so the above prohibited interactions are equivalent to

```js
circle.style.pointerEvents = 'none';
```

# Drawing Properties

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

Property names can also be hyphenated, so the following writeups are fully equivalent, see [get/set property values](/en/docs/api/basic/display-object#获取设置属性值) for full usage.

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

## Position

The initial position of the drawing in the local coordinate system is described by different properties depending on the type of drawing, and can be reset later by [setLocalPosition](/en/docs/api/display-object#panning).

The geometric meaning of "position" is also different for different shapes, e.g.

-   Using [cx/cy](/en/docs/api/basic/circle#cx) for [Circle](/en/docs/api/circle) and [Ellipse](/en/docs/api/ellipse).
-   [Group](/en/docs/api/group) [Rect](/en/docs/api/rect)，[Image](/en/docs/api/image) 为左上角顶点位置，使用 [x/y](/en/docs/api/basic/rect#x)
-   [Text](/en/docs/api/text) 为文本锚点位置
-   [Line](/en/docs/api/line)，[Polyline](/en/docs/api/polyline)，[Polygon](/en/docs/api/polygon)，[Path](/en/docs/api/path) 为包围盒左上角顶点位置

Sometimes we need to change the geometric meaning of this `position`, for example to set the center of Rect instead of the top left corner as the `anchor`, we can use [anchor](/en/docs/api/display-object#anchor) to set it to `[0.5, 0.5]`. Note that the coordinates of the graph in the local coordinate system do not change before and after the modification.

For example, we define a circle with a radius of 100, and since the anchor defaults to `[0.5, 0.5]`, we get the coordinates of the circle in the local coordinate system as `[100, 100]`, i.e., the location of the center of the circle.

```js
const circle = new Cirle({
    style: {
        cx: 100,
        cy: 100,
        r: 100,
    },
});
circle.getLocalPosition(); // [100, 100]，此时为圆心所在位置
```

If we change the anchor point to `[0, 0]`, the position of the circle in the local coordinate system remains the same, `[100, 100]`, except that this coordinate is no longer the center of the circle, but the upper left corner of the enclosing box of the circle, so that visually the circle is shifted down to the right by a distance of `[100, 100]`.

```js
circle.style.anchor = [0, 0];
circle.getLocalPosition(); // [100, 100]，此时为圆包围盒左上角位置
```

### anchor

The position of the origin (anchor) of the graph, based on [Geometry Bounds](/en/docs/api/basic/display-object#enclosing-box), is defined in the range `[0, 0] ~ [1, 1]`, where `[0, 0]` represents the upper-left corner of Geometry Bounds and `[1, 1]` represents the lower right corner.

The default anchor points for different shapes are as follows, [example](/en/examples/shape#rect).

-   The center of [Circle](/en/docs/api/circle) and [Ellipse](/en/docs/api/ellipse) is `[0.5, 0.5]`
-   The top left corner of [Rect](/en/docs/api/rect), [Image](/en/docs/api/image), [Line](/en/docs/api/line), [Polyline](/en/docs/api/polyline), [Polygon](/en/docs/api/polygon) and [Path](/en/docs/api/path) is `[0, 0]`.
-   We should always use [textBaseline](/en/docs/api/basic/text#textbaseline) and [textAlign](/en/docs/api/basic/text#textalign) to set the anchor of [Text](/en/docs/api/text).
-   Since [Group](/en/docs/api/text) has no geometry bounds, so its anchor is `[0, 0]`.

In addition to using arrays, you can also use space-separated array strings, so the following two ways of writing them are equivalent.

```js
circle.style.anchor = [0.5, 0.5];
circle.style.anchor = '0.5 0.5';
```

| [Initial value](/en/docs/api/css/css-properties-values-api#initial-value) | Applicable elements | [Inheritable](/en/docs/api/css/inheritance) | Animatable | [Computed value](/en/docs/api/css/css-properties-values-api#computed-value) |
| --- | --- | --- | --- | --- |
| `'0 0'` | all | no | no | `<array>` |

### transform

We provide shortcuts for transformations in local coordinate systems, while keeping in line with [CSS Transform](https://developer.mozilla.org/zh-CN/docs/Web/CSS/transform), supporting the following [transform-function transformations function](https://developer.mozilla.org/zh-CN/docs/Web/CSS/transform-function).

-   Scaling
    -   scale(x, y)
    -   scaleX(x)
    -   scaleY(x)
    -   scaleZ(z)
    -   scale3d(x, y, z)
-   Translation, 0 can be used without units, unitless is treated as px, the percentage is relative to the current graph bounding box
    -   translate(0, 0) translate(0, 30px) translate(100%, 100%)
    -   translateX(0)
    -   translateY(0)
    -   translateZ(0)
    -   translate3d(0, 0, 0)
-   Rotation, support for deg rad turn, these angular units
    -   rotate(0.5turn) rotate(30deg) rotate(1rad)
-   Stretch, support deg rad turn these angular units
    -   skew(ax, ay)
    -   skewX(a)
    -   skewY(a)
-   Matrix
    -   matrix()
    -   matrix3d()
-   none

| [Initial value](/en/docs/api/css/css-properties-values-api#initial-value) | Applicable elements | [Inheritable](/en/docs/api/css/inheritance) | Animatable | [Computed value](/en/docs/api/css/css-properties-values-api#computed-value) |
| --- | --- | --- | --- | --- |
| `'none'` | all | no | yes | `<transform>` |

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

### transformOrigin

Rotation and scaling centers, also called transform origin, are defined relative to Bounds.

Similar to CSS [transform-origin](https://developer.mozilla.org/zh-CN/docs/Web/CSS/transform-origin), the following string writing is supported, separated by spaces.

-   One value
    -   Length in px, e.g. 10px
    -   Length in %, e.g. 50%
    -   The keywords left, center, right, top, bottom are expressed as percentages, e.g. left equals 0%, center equals 50%.
-   Two values
    -   The first is the length in px or %, or one of the left, center, or right keywords
    -   The second is the length in px or %, or one of the top, center, or bottom keywords

Therefore the following write-ups are equivalent.

```js
// r = 100
circle.style.transformOrigin = 'left';
circle.style.transformOrigin = 'left center'; // AABB horizontal left edge, vertical midpoint
circle.style.transformOrigin = '0 50%'; // The distance to the left edge of the AABB is 0 horizontally and 50% height from the top vertically
circle.style.transformOrigin = '0 100px'; // The distance to the left edge of the AABB is 0 horizontally and 100px vertically from the top
```

⚠️ Writing with three values is not supported at the moment.

As with [anchor](/en/docs/api/basic/display-object#anchor), the default value varies from graph to graph.

-   `'center'` in [Circle](/en/docs/api/circle) and [Ellipse](/en/docs/api/ellipse).
-   `'left top'` in [Group](/en/docs/api/text), [Rect](/en/docs/api/rect)，[Image](/en/docs/api/image), [Line](/en/docs/api/line), [Polyline](/en/docs/api/polyline), [Polygon](/en/docs/api/polygon) and [Path](/en/docs/api/path).
-   [Text](/en/docs/api/text) 为文本锚点位置，应该使用 [textBaseline](http://localhost:8000/en/docs/api/basic/text#textbaseline) 与 [textAlign](/en/docs/api/basic/text#textalign) 这两个属性设置，因此设置此属性无效

| [Initial value](/en/docs/api/css/css-properties-values-api#initial-value) | Applicable elements | [Inheritable](/en/docs/api/css/inheritance) | Animatable | [Computed value](/en/docs/api/css/css-properties-values-api#computed-value) |
| --- | --- | --- | --- | --- |
| - | all | no | no | `<transform-origin>` |

## Fill

### opacity

The overall transparency of the graph, with values in the range `[0, 1]`, supports both `number` and `string` types, so the following two ways of writing it are equivalent.

```js
circle.style.opacity = 0.5;
circle.style.opacity = '0.5';
```

| [Initial value](/en/docs/api/css/css-properties-values-api#initial-value) | Applicable elements | [Inheritable](/en/docs/api/css/inheritance) | Animatable | [Computed value](/en/docs/api/css/css-properties-values-api#computed-value) |
| --- | --- | --- | --- | --- |
| '1' | all | no | yes | [\<number\>](/en/docs/api/css/css-properties-values-api#number) |

### fillOpacity

The fill color transparency, in the range `[0, 1]`, supports both `number` and `string` types, so the following two ways of writing are equivalent.

```js
circle.style.fillOpacity = 0.5;
circle.style.fillOpacity = '0.5';
```

| [Initial value](/en/docs/api/css/css-properties-values-api#initial-value) | Applicable elements | [Inheritable](/en/docs/api/css/inheritance) | Animatable | [Computed](/en/docs/api/css/css-properties-values-api#computed-value) |
| --- | --- | --- | --- | --- |
| '1' | all | yes | yes | [\<number\>](/en/docs/api/css/css-properties-values-api#number) |

### fill

Fill color, supports `string` type, see [\<paint\>](/en/docs/api/css/css-properties-values-api#paint)：

```js
circle.style.fill = 'red';
circle.style.fill = 'rgb(255, 0, 0)';
```

| [Initial value](/en/docs/api/css/css-properties-values-api#initial-value) | Applicable elements | [Inheritable](/en/docs/api/css/inheritance) | Animatable | [Computed value](/en/docs/api/css/css-properties-values-api#computed-value) |
| --- | --- | --- | --- | --- |
| 'none' | all | no | yes | [\<paint\>](/en/docs/api/css/css-properties-values-api#paint) |

## Stroke

### strokeOpacity

Stroke transparency, which takes values in the range `[0, 1]`, supports both `number` and `string` types, so the following two ways of writing it are equivalent.

```js
circle.style.strokeOpacity = 0.5;
circle.style.strokeOpacity = '0.5';
```

| [Initial value](/en/docs/api/css/css-properties-values-api#initial-value) | Applicable elements | [Inheritable](/en/docs/api/css/inheritance) | Animatable | [Computed value](/en/docs/api/css/css-properties-values-api#computed-value) |
| --- | --- | --- | --- | --- |
| '1' | all | yes | yes | [\<number\>](/en/docs/api/css/css-properties-values-api#number) |

### stroke

Stroke color, supports `string` type, see [\<paint\>](/en/docs/api/css/css-properties-values-api#paint)：

```js
circle.style.stroke = 'red';
circle.style.stroke = 'rgb(255, 0, 0)';
```

| [Initial value](/en/docs/api/css/css-properties-values-api#initial-value) | Applicable elements | [Inheritable](/en/docs/api/css/inheritance) | Animatable | [Computed value](/en/docs/api/css/css-properties-values-api#computed-value) |
| --- | --- | --- | --- | --- |
| 'none' | all | no | yes | [\<paint\>](/en/docs/api/css/css-properties-values-api#paint) |

### strokeWidth

Alias of [lineWidth](/en/docs/api/basic/display-object#linewidth), and [SVG attribute name](https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/ stroke-width).

### strokeDasharray

Alias of [lineDash](/en/docs/api/basic/display-object#linedash), and [SVG attribute name](https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/ stroke-dasharray) to be consistent.

### strokeDashoffset

Alias of [lineDashOffset](/en/docs/api/basic/display-object#linedash), and [SVG Attribute Name](https://developer.mozilla.org/zh-CN/docs/Web/SVG/ Attribute/stroke-dashoffset) to be consistent.

### lineWidth

The width of the stroke. Unlike the familiar [CSS box model](https://developer.mozilla.org/en-US/docs/Web/CSS/box-sizing), half of the width of the border is inside the graphic and half is outside the graphic. For example, the width of the enclosing box for the circle below is: `r + lineWidth / 2 = 110`

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*f0-CTpClWkMAAAAAAAAAAAAAARQnAQ" width="300">

supports `number` and `string` types, the former defaulting to length values in `px`, with the following writing equivalents.

```js
circle.style.lineWidth = 1;
circle.style.lineWidth = '1';
circle.style.lineWidth = '1px';
```

| [Initial value](/en/docs/api/css/css-properties-values-api#initial-value) | Applicable elements | [Inheritable](/en/docs/api/css/inheritance) | Animatable | [Computed value](/en/docs/api/css/css-properties-values-api#computed-value) |
| --- | --- | --- | --- | --- |
| '1' | all | yes | yes | [\<percentage\>](/en/docs/api/css/css-properties-values-api#percentage) [\<length\>](/en/docs/api/css/css-properties-values-api#length) |

### lineCap

Endpoint style, supporting the following values.

-   'butt' Default value. The end of the line segment ends in a square.
-   'round' The line segment ends in a circle.
-   'square' The line segment ends in a square, but adds a rectangular area with the same width as the line segment and half the height of the line segment's thickness.

https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/lineCap

### lineJoin

Supporting the following values.

-   'miter' Default. An additional diamond-shaped area is formed by extending the outer edges of the connected sections so that they intersect at a point. The effect of this setting can be seen with the [miterLimit](/en/docs/api/basic/display-object#miterlimit) property.
-   'round' Draws the shape of the corner by filling an additional, circular sector with the center of the circle at the end of the connected section. The radius of the rounded corner is the width of the line segment.
-   'bevel' An additional triangular-base area is filled in at the end of the connected sections, each with its own separate rectangular corner.

https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/lineJoin

### miterLimit

The default value for SVG and Canvas2D is different, the former is 4 and the latter is 10. We set [Path](/en/docs/api/basic/path) [Polyline](/en/docs/api/basic/polyline) [Polygon](/en/docs/api/basic/polygon) to 4 and the rest to 10. api/basic/polygon) These three graphs are set to 4, and the rest are set to 10.

https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/miterLimit

### lineDash

Use `number[]` to describe the alternate line segments and spacing. Reference can be made to: https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/setLineDash

Currently only the form `[dash, gap]` is supported, if there is only one element in the array, i.e. `[dash]` is equivalent to `[dash, dash]`.

Applying animation to it can achieve [handwriting animation effect](/en/docs/api/animation#stroke-animation).

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*8NOsQoWLm2IAAAAAAAAAAAAAARQnAQ" width="400" alt="stroke animation">

| [Initial value](/en/docs/api/css/css-properties-values-api#initial-value) | Applicable elements | [Inheritable](/en/docs/api/css/inheritance) | Animatable | [Computed value](/en/docs/api/css/css-properties-values-api#computed-value) |
| --- | --- | --- | --- | --- |
| - | all | yes | yes |  |

### lineDashOffset

Dashed line offset, type `number`, transform it to achieve [marching ants animation](/en/docs/api/animation#marching-ant-animation)

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*TTyTTISXlKAAAAAAAAAAAAAAARQnAQ" width="400" alt="marching ants animation">

| [Initial value](/en/docs/api/css/css-properties-values-api#initial-value) | Applicable elements | [Inheritable](/en/docs/api/css/inheritance) | Animatable | [Computed value](/en/docs/api/css/css-properties-values-api#computed-value) |
| --- | --- | --- | --- | --- |
| '0' | all | yes | yes | [\<percentage\>](/en/docs/api/css/css-properties-values-api#percentage) [\<length\>](/en/docs/api/css/css-properties-values-api#length) |

## Shadow

Add shadow effect at the bottom of the shape, support configuring shadow color, blur radius and horizontal/vertical offset distance. [example](/en/examples/shape#circle).

Shadows do not affect the graph's [Geometry Bounds](/en/docs/api/basic/concept#bounding-box), e.g. in the following figure, after adding a shadow to a circle with a radius of 100, the geometry wrapping box size remains the same.

```js
circle.getBounds(); // { halfExtents: [100, 100] }
circle.style.shadowBlur = 20;
circle.getBounds(); // { halfExtents: [100, 100] }
```

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*shbSR55j_iQAAAAAAAAAAAAAARQnAQ" width="200" alt="outer shadow">

Of course outer shadows increase the [Render Bounds](/en/docs/api/basic/concept#bounding-box), inner shadows do not.

Finally, shadows can have a very big impact on rendering performance.

### shadowType

We currently support two kinds of shadow.

-   `'outer'` Outer Shading, which is also the default value for this property. The shadow appears on the outside of the drawing fill or stroke.
-   `'inner'` Internal shading. As the name implies the shadows are inside the graph, as shown in the figure below.

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*0uHfQa00ZeYAAAAAAAAAAAAAARQnAQ" width="200" alt="inner shadow">

### shadowColor

Shade color, supports `string` type, for example `'#1890FF'`. Gradient or pattern writing is not supported.

| [Initial value](/en/docs/api/css/css-properties-values-api#initial-value) | Applicable elements | [Inheritable](/en/docs/api/css/inheritance) | Animatable | [Computed value](/en/docs/api/css/css-properties-values-api#computed-value) |
| --- | --- | --- | --- | --- |
| - | all | no | yes | [\<color\>](/en/docs/api/css/css-properties-values-api#color) |

### shadowBlur

The blurring degree of the shading effect, `number` type, negative numbers are not allowed. Larger means more blurred, 0 means no blurring effect.

| [Initial value](/en/docs/api/css/css-properties-values-api#initial-value) | Applicable elements | [Inheritable](/en/docs/api/css/inheritance) | Animatable | [Computed value](/en/docs/api/css/css-properties-values-api#computed-value) |
| --- | --- | --- | --- | --- |
| - | all | no | yes | [\<number\>](/en/docs/api/css/css-properties-values-api#number) |

### shadowOffsetX

Horizontal offset, supports `number` or `string` types, e.g. negative numbers move shadows to the left, positive numbers to the right.

| [Initial value](/en/docs/api/css/css-properties-values-api#initial-value) | Applicable elements | [Inheritable](/en/docs/api/css/inheritance) | Animatable | [Computed value](/en/docs/api/css/css-properties-values-api#computed-value) |
| --- | --- | --- | --- | --- |
| - | all | no | yes | [\<percentage\>](/en/docs/api/css/css-properties-values-api#percentage) [\<length\>](/en/docs/api/css/css-properties-values-api#length) |

### shadowOffsetY

Vertical offset, e.g. a negative number moves the shadow up, a positive number down.

| [Initial value](/en/docs/api/css/css-properties-values-api#initial-value) | Applicable elements | [Inheritable](/en/docs/api/css/inheritance) | Animatable | [Computed value](/en/docs/api/css/css-properties-values-api#computed-value) |
| --- | --- | --- | --- | --- |
| - | all | no | yes | [\<percentage\>](/en/docs/api/css/css-properties-values-api#percentage) [\<length\>](/en/docs/api/css/css-properties-values-api#length) |

## Filter

Filters can perform some processing on the generated image, such as blurring, highlighting, boosting contrast, etc. The following implementations are available on the web side.

-   CSS Filter: https://developer.mozilla.org/en-US/docs/Web/CSS/filter
-   Canvas Filter: https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/filter
-   SVG Filter: https://developer.mozilla.org/zh-CN/docs/Web/SVG/Element/filter
-   Post Processing in WebGL.

Referring to the CSS Filter syntax, we support applying one or more filter effects to a shape, [example](/en/examples/shape#filter).

```js
circle.style.filter = 'blur(5px)';
circle.style.filter = 'blur(5px) brightness(0.4)'; // Stackable
```

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*3MxRTpAT77gAAAAAAAAAAAAAARQnAQ" alt="filters" width="300">

Filters can currently be used in the g-canvas/svg/webgl renderer with the following caveats.

-   Due to poor Canvas Filter support, mainly [Safari does not support](https://caniuse.com/mdn-api_canvasrenderingcontext2d_filter), filters are not displayed properly in Safari using g-canvas
-   g-canvas and g-svg differ slightly in some filter effects
-   Can be applied to all base graphs and Groups
-   This property does not support animation at this time

### blur

Applies a Gaussian blur to the input image. where radius defines the standard deviation value of the Gaussian function, or how many pixels on the screen blend into each other so that larger values will produce more blur, with a default value of 0. This parameter can be specified as a CSS length, but does not accept percentage values.

As with shadows, blurring also does not affect the size of the geometry bounds for graphics.

```js
circle.style.filter = 'blur(5px)';
```

The following figure shows the blurring effect of 2px 4px and 10px in order, [example](/en/examples/shape#filter).

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*rYA_TLechgYAAAAAAAAAAAAAARQnAQ" width="300" alt="blur filter">

### brightness

Applies a linear multiplier to the input image to make it lighter or darker, with a default value of 1. A value of 0% will create an all-black image. A value of 100% will leave the input unchanged. Other values are linear multipliers of the effect. Values greater than 100% provide brighter results.

```js
circle.style.filter = 'brightness(2)';
circle.style.filter = 'brightness(200%)';
```

The following figure shows the bright effects of 0 100% and 200% in order, [example](/en/examples/shape#filter).

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*LG_pQ6GzA3wAAAAAAAAAAAAAARQnAQ" width="300" alt="brightness filter">

### drop-shadow

To display the shadows under the image, you can set the shadow color, offset and blur effect by passing in the following parameters in order.

-   offset-x Describes the horizontal offset distance of the shadow in px
-   offset-y Describes the vertical offset distance of the shadow in px
-   blur-radius The larger the value, the more ambiguous it is, in px, no negative numbers allowed
-   color

The shading does not affect the size of the geometry bounding box of the graph.

```js
circle.style.filter = 'drop-shadow(16px 16px 10px black)';
```

The following figure shows the effect of the above configuration in turn, [example](/en/examples/shape#filter).

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*shbSR55j_iQAAAAAAAAAAAAAARQnAQ" width="300" alt="drop-shadow filter">

### contrast

Adjusts the contrast of the image. When the value is 0%, the image becomes completely black. When the value is 100%, the image does not change at all.

```js
circle.style.filter = 'contrast(2)';
circle.style.filter = 'contrast(200%)';
```

The following figure shows the contrast effect of 0, 1 and 10 in order，[example](/en/examples/shape#filter).

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*gc-1QJYr2awAAAAAAAAAAAAAARQnAQ" width="300" alt="contrast filter">

### grayscale

Converts the image to a gray picture. When the value is 100%, the image turns completely gray. When the value is 0%, the image does not change at all.

```js
circle.style.filter = 'grayscale(1)';
circle.style.filter = 'grayscale(100%)';
```

The following figure shows the grayscale effect of 0 50% and 100% in order, [example](/en/examples/shape#filter).

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*OadOQLl_bH0AAAAAAAAAAAAAARQnAQ" alt="grayscale filter" width="300">

### saturate

Saturation is applied to the image. When the value is 0%, the image is not saturated at all. When the value is 100%, there is no change in the image.

```js
circle.style.filter = 'saturate(1)';
circle.style.filter = 'saturate(100%)';
```

The following figure shows the saturation effect at 0 50% and 100% in order, [example](/en/examples/shape#filter).

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*8J4IRJTJcVUAAAAAAAAAAAAAARQnAQ" alt="saturate filter" width="300">

### sepia

Applies sepia processing to the image (nostalgic style). When the value is 100%, the image becomes completely sepia. When the value is 0%, the image does not change at all.

```js
circle.style.filter = 'sepia(1)';
circle.style.filter = 'sepia(100%)';
```

The following figure shows the results of 0 50% and 100% processing in order, [example](/en/examples/shape#filter).

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*79UARqYrimcAAAAAAAAAAAAAARQnAQ" alt="saturate filter" width="300">

### hue-rotate

Applying hue rotation to the input image sets the value of the color ring angle at which the image will be adjusted. The image does not change when the value is 0deg.

```js
circle.style.filter = 'hue-rotate(30deg)';
circle.style.filter = 'hue-rotate(180deg)';
```

The following figure shows the effect of 0, 90deg and 180deg processing in turn, [example](/en/examples/shape#filter).

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*k8rsSbW4WRwAAAAAAAAAAAAAARQnAQ" alt="saturate filter" width="300">

### invert

Inverts the color of the input image. amount defines the percentage of conversion, 100% means complete inversion, 0% means no change in the image.

```js
circle.style.filter = 'invert(1)';
circle.style.filter = 'invert(100%)';
```

The following figure shows in turn the effect of 0, 50% and 100% inversions, [example](/en/examples/shape#filter).

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*N1OjR6pR0CMAAAAAAAAAAAAAARQnAQ" alt="saturate filter" width="300">

## zIndex

Similar to CSS's `z-index` property, used to control the rendering order, it needs to be noted that

1. Only affects the rendering order, and does not change the node structure in the scene graph.
2. Effective only in the current context.
3. The default display order is the order in which the scenes are added, with those added later on top of the previously added elements.

| [Initial value](/en/docs/api/css/css-properties-values-api#initial-value) | Applicable elements | [Inheritable](/en/docs/api/css/inheritance) | Animatable | [Computed value](/en/docs/api/css/css-properties-values-api#computed-value) |
| --- | --- | --- | --- | --- |
| '0' | all | no | no | [\<number\>](/en/docs/api/css/css-properties-values-api#number) |

For example, in the scene below, li2 is displayed on top of li1 by default because li2 was added to the canvas after li1. If you want to change this display order, you can modify the zIndex of li1:

```js
// ul1 -> li1
//     -> li2
// ul2 -> li3

li1.style.zIndex = 1; // li1 在 li2 之上
```

For example, even though li2 has a much larger zIndex than ul2, it can only be under ul2 because ul1 is smaller than ul2, [example](/en/examples/scenegraph#z-index)

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*FfZhRYJ_rogAAAAAAAAAAAAAARQnAQ" alt="z-index" width="500">

## clipPath

Use clipping to create a displayable region of an element, with the parts inside the region shown and the parts outside the region hidden. See CSS's [clip-path](https://developer.mozilla.org/zh-CN/docs/Web/CSS/clip-path). The value of this property can be any shape, such as Circle, Rect, etc. The same clipping region can be shared by multiple shapes. Finally, the crop region also affects the pickup area of the shapes, [example](/en/examples/event#shapes).

For example, if we want to create a picture that is cropped into a circle, so that the cropping area is just in the center of the picture (size 200 \* 200), we can set the local coordinates of the circle in the cropping area to `[100, 100]`. [example](/en/examples/shape#clip).

```js
const image = new Image({
    style: {
        width: 200,
        height: 200,
        clipPath: new Circle({
            style: {
                cx: 100, // In the local coordinate system of the cropped figure
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

### Cautions

The crop area graphic itself is also supported to modify the property, and affected by it, the cropped graphic will be redrawn immediately. For example, with [animation system](/en/docs/api/animation) we can transform the cropped area graphic to achieve the following effect, [example](/en/examples/shape#clip).

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*Iy4RQZgT3EUAAAAAAAAAAAAAARQnAQ)

```js
// Apply animation to clipped areas
clipPathCircle.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.2)' }], {
    duration: 1500,
    iterations: Infinity,
});
```

We do not yet support composite cropping areas, such as custom graphics and Group.

## 运动轨迹

在[路径动画](/en/docs/api/animation#路径动画)中，我们可以使用 `offsetPath` 指定一个图形的运动轨迹，配合[动画系统](/en/docs/api/animation#路径动画)对 `offsetDistance` 属性应用变换：

```js
const circle = new Circle({
    style: {
        offsetPath: new Line({
            // 创建运动轨迹
            style: {
                // 不需要设置其他与轨迹无关的绘图属性
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
    [
        { offsetDistance: 0 }, // 变换
        { offsetDistance: 1 },
    ],
    {
        duration: 3000,
        easing: 'ease-in-out',
        iterations: Infinity,
    },
);
```

### offsetPath

指定路径轨迹，目前支持 [Line](/en/docs/api/basic/line) [Path](/en/docs/api/basic/path) 和 [Polyline](/en/docs/api/basic/polyline) 这三种图形。

### offsetDistance

从路径起点出发行进的距离，取值范围为 `[0-1]`，0 代表路径起点，1 代表终点。

| [Initial value](/en/docs/api/css/css-properties-values-api#initial-value) | Applicable elements | [Inheritable](/en/docs/api/css/inheritance) | Animatable | [Computed value](/en/docs/api/css/css-properties-values-api#computed-value) |
| --- | --- | --- | --- | --- |
| '0' | 所有 | 否 | 是 | [\<number\>](/en/docs/api/css/css-properties-values-api#number) |

## 鼠标样式

当鼠标悬停在图形上时，我们可以改变它的样式，通过修改容器的 CSS 样式实现。

`cursor` 属性支持的值可以参考：https://developer.mozilla.org/zh-CN/docs/Web/CSS/cursor

```js
const circle = new Circle({
    style: {
        //... 省略其他属性
        cursor: 'pointer',
    },
});
```

## 响应交互事件

我们可以设置图形如何响应交互事件，例如命中拾取时展示鼠标样式，或者增大拾取区域。

### pointerEvents

设置图形如何响应交互事件。目前支持以下关键词：

-   auto 响应事件
-   none 不响应事件

后续会增加 `fill` `stroke` 等更多关键词。

在该 [示例](/en/examples/style#inheritance) 中，基于继承机制我们能很方便的控制可交互性：

```js
// 整个画布不响应交互事件
canvas.document.documentElement.style.pointerEvents = 'none';
```

| [Initial value](/en/docs/api/css/css-properties-values-api#initial-value) | Applicable elements | [Inheritable](/en/docs/api/css/inheritance) | Animatable | [Computed value](/en/docs/api/css/css-properties-values-api#computed-value) |
| --- | --- | --- | --- | --- |
| 'auto' | 所有 | 是 | 否 | [\<keywords\>](/en/docs/api/css/css-properties-values-api#关键词) |

### increasedLineWidthForHitTesting

当 [lineWidth](/en/docs/api/basic/display-object#linewidth) 较小时，可交互区域也随之变小，有时我们想增大这个区域，让“细线”更容易被拾取到。注意该属性并不会影响渲染效果。

在下面的 [示例](/en/examples/shape#polyline) 中，我们设置该属性为 `50`，在进行拾取时线宽相当于 `50 + 原始线宽`，这样靠近时就更容易拾取到了： <img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*0ISzTIiefZ0AAAAAAAAAAAAAARQnAQ">

```js
line.style.increasedLineWidthForHitTesting = 50;
```

另外和 [lineWidth](/en/docs/api/basic/display-object#linewidth) 一样，该属性同样会向两侧延展，下图中无填充的 [Path](/en/docs/api/basic/path) 内部拾取区域也变大了：

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*ude1Qo6PVNYAAAAAAAAAAAAAARQnAQ">

| [Initial value](/en/docs/api/css/css-properties-values-api#initial-value) | Applicable elements | [Inheritable](/en/docs/api/css/inheritance) | Animatable | [Computed value](/en/docs/api/css/css-properties-values-api#computed-value) |
| --- | --- | --- | --- | --- |
| '0' | 所有 | 否 | 否 | [\<percentage\>](/en/docs/api/css/css-properties-values-api#percentage) [\<length\>](/en/docs/api/css/css-properties-values-api#length) |

# 变换操作

我们提供了一系列变换方法。

## 平移

对于平移操作，我们提供了局部/世界坐标系下，移动绝对/相对距离的 API：

| 名称 | 参数 | 返回值 | 备注 |
| --- | --- | --- | --- |
| translate | `[number, number]`<br />`number, number`<br />`number` | 无 | 在 **世界坐标系** 下，相对当前位置移动 |
| translateLocal | `[number, number]`<br />`number, number`<br />`number` | 无 | 在 **局部坐标系** 下，相对当前位置移动 |
| setPosition | `[number, number]`<br />`number, number`<br />`number` | 无 | 设置 **世界坐标系** 下的位置 |
| setLocalPosition | `[number, number]`<br />`number, number`<br />`number` | 无 | 设置 **局部坐标系** 下的位置 |
| getPosition | 无 | `[number, number]` | 获取 **世界坐标系** 下的位置 |
| getLocalPosition | 无 | `[number, number]` | 获取 **局部坐标系** 下的位置 |

其中 translate/translateLocal/setPosition/setLocalPosition 支持以下入参形式，其中如果只想修改 X 轴方向，可以只传一个数字：

```js
circle.translate([100, 0]); // [number, number]
circle.translate(100, 0); // number, number
circle.translate(100); // number
```

## 缩放

和平移不同，我们无法提供 `setScale` 这样设置世界坐标系下缩放的方法，因此全局坐标系下缩放是只读的，这在 Unity 中称之为 [lossyScale](https://forum.unity.com/threads/solved-why-is-transform-lossyscale-readonly.363594/)。

| 名称 | 参数 | 返回值 | 备注 |
| --- | --- | --- | --- |
| scaleLocal | `[number, number]`<br />`number, number`<br />`number` | 无 | 在 **局部坐标系** 下，相对当前缩放比例继续缩放 |
| setLocalScale | `[number, number]`<br />`number, number`<br />`number` | 无 | 设置 **局部坐标系** 下的缩放比例 |
| getScale | 无 | `[number, number]` | 获取 **世界坐标系** 下的缩放比例 |
| getLocalScale | 无 | `[number, number]` | 获取 **局部坐标系** 下的缩放比例 |

其中 scaleLocal/setLocalScale 支持以下入参形式，其中如果水平/垂直方向缩放比例相等时，可以只传一个数字：

```js
circle.scaleLocal([2, 2]); // [number, number]
circle.scaleLocal(2, 2); // number, number
circle.scaleLocal(2); // number
```

如果想实现沿 X / Y 轴翻转，可以传入负值，例如沿 Y 轴翻转：

```js
circle.setLocalScale(-1, 1);
```

## 旋转

在 3D 场景中，旋转可以用矩阵、轴角、欧拉角和四元数表示，它们彼此之间可以互相转换。虽然考虑到未来的扩展性，在 G 内部实现中我们使用了四元数。

| 名称 | 参数 | 返回值 | 备注 |
| --- | --- | --- | --- |
| rotateLocal | `number` | 无 | 在 **局部坐标系** 下，旋转一定的欧拉角，顺时针方向为正，单位为 `degree` |
| rotate | `number` | 无 | 在 **世界坐标系** 下，旋转一定的欧拉角 |
| setEulerAngles | `number` | 无 | 设置 **世界坐标系** 下的欧拉角 |
| setLocalEulerAngles | `number` | 无 | 设置 **局部坐标系** 下的欧拉角 |
| setLocalRotation | `quat` | 无 | 设置 **局部坐标系** 下的四元数 |
| setRotation | `quat` | 无 | 设置 **世界坐标系** 下的四元数 |
| getEulerAngles | 无 | `number` | 获取 **世界坐标系** 下的欧拉角 |
| getLocalEulerAngles | 无 | `number` | 获取 **局部坐标系** 下的欧拉角 |
| getLocalRotation | 无 | `quat` | 获取 **局部坐标系** 下的四元数 |
| getRotation | 无 | `quat` | 获取 **世界坐标系** 下的四元数 |

## 拉伸

在 2D 场景中，可以进行拉伸，在一定方向上以一定角度扭曲元素上的每个点。可参考 [CSS 同名变换函数](https://developer.mozilla.org/zh-CN/docs/Web/CSS/transform-function#skew)。

| 名称         | 参数   | 返回值 | 备注                                                            |
| ------------ | ------ | ------ | --------------------------------------------------------------- |
| setLocalSkew | `vec2` | 无     | 在 **局部坐标系** 下，沿着横/纵坐标扭曲元素的角度，单位为 `rad` |
| getLocalSkew | 无     | `vec2` | 获取 **局部坐标系** 下的扭曲角度，单位为 `rad`                  |

## 设置缩放和旋转中心

除了使用 [transformOrigin](/en/docs/api/basic/display-object#transformorigin) 属性，还可以手动计算相对于 [anchor](/en/docs/api/basic/display-object#anchor) 位置的偏移量，再通过 `setOrigin` 重新设置变换中心。

| 名称 | 参数 | 返回值 | 备注 |
| --- | --- | --- | --- |
| setOrigin | `[number, number]` 或 `[number, number, number]` 或 `number, number` 或 `number, number, number` | 无 | 设置局部坐标系下的缩放和旋转中心 |
| getOrigin | `[number, number, number]` | 无 | 获取局部坐标系下的缩放和旋转中心 |

设置局部坐标系下的缩放和旋转中心，[示例](/en/examples/scenegraph#origin)

数值为相对于[锚点](/en/docs/api/basic/display-object#anchor)的偏移量，默认值为 `[0, 0]`，因此就是锚点位置。

在下面的例子中，我们在 `[100, 100]` 处放置了一个半径为 100 的圆：

```js
const circle = new Circle({
    style: {
        cx: 100,
        cy: 100,
        r: 100,
    },
});
```

如果我们想让圆以圆心作为变换中心进行缩放，由于此时锚点就是圆心，因此缩放前后锚点在世界坐标系下位置不变，发生变化的是包围盒：

```js
circle.setOrigin(0, 0);
circle.scale(0.5);
circle.getPosition(); // [100, 100]
circle.getBounds(); // { center: [100, 100], halfExtents: [50, 50] }
```

但假如我们想让这个圆以自身包围盒左上角进行缩放，即相对于当前锚点（圆心）偏移 `[-100, -100]`。缩放之后锚点也会发生偏移，圆在世界坐标系下的位置自然也来到了 `[50, 50]`。同理，包围盒的中心点发生了移动：

```js
circle.setOrigin(-100, -100);
circle.scale(0.5);
circle.getPosition(); // [50, 50]
circle.getBounds(); // { center: [50, 50], halfExtents: [50, 50] }
```

在下面的[示例](/en/examples/scenegraph#origin)中，我们创建了一个矩形，它的默认锚点为局部坐标系下包围盒的左上角。如果我们想让它以包围盒中心进行旋转，就需要设置变换中心相对于锚点偏移长宽各一半，即 `[150, 100]`：

```js
const rect = new Rect({
    id: 'rect',
    style: {
        width: 300,
        height: 200,
    },
});
rect.setOrigin(150, 100); // 设置旋转与缩放中心为自身包围盒中心点
```

例如我们想修改一个圆的变换中心到左上角而非圆心，可以这样做：

```js
const circle = new Circle({
    style: {
        cx: 100,
        cy: 100,
        r: 100,
    },
});

circle.setOrigin(-100, -100); // 相对于锚点（圆心）偏移 [-100, -100]
// 或者
circle.style.transformOrigin = 'left top'; // 包围盒左上角
// 或者
circle.style.transformOrigin = '0px 0px';
// 或者
circle.style.transformOrigin = '0% 0%';
```

两者的区别在于 origin 相对于锚点定义，而 transformOrigin 相对于包围盒定义。

# 获取包围盒

基于不同的[包围盒定义](/en/docs/api/basic/display-object#包围盒)，我们提供了以下获取方法。

## getGeometryBounds(): AABB | null

获取基础图形的几何包围盒，除了定义所需的样式属性（例如 Circle 的 r，Rect 的 width/height），它不受其他绘图属性（例如 lineWidth，fitler，shadowBlur 等）影响：

```js
const circle = new Circle({
    style: {
        cx: 100, // 局部坐标系下的坐标不会影响 Geometry Bounds
        cy: 100, // 局部坐标系下的坐标不会影响 Geometry Bounds
        r: 100,
        lineWidth: 20, // 样式属性不会影响 Geometry Bounds
        shadowBlur: 10, // 样式属性不会影响 Geometry Bounds
    },
});
circle.getGeometryBounds(); // { center: [0, 0], halfExtents: [100, 100] }
```

Group 由于没有几何定义，因此会返回 null：

```js
const group = new Group();
group.getGeometryBounds(); // null
```

## getBounds(): AABB | null

合并自身以及子节点在世界坐标系下的 Geometry Bounds。这应当是最常用的计算方式：

```js
const circle = new Circle({
    style: {
        cx: 100, // 应用世界坐标系下的变换
        cy: 100,
        r: 100,
    },
});
circle.getBounds(); // { center: [100, 100], halfExtents: [100, 100] }
```

## getRenderBounds(): AABB | null

合并自身以及子节点在世界坐标系下的 Render Bounds，在 Geometry Bounds 基础上，受以下样式属性影响： lineWidth，shadowBlur，filter：

```js
const circle = new Circle({
    style: {
        cx: 100, // 应用世界坐标系下的变换
        cy: 100,
        r: 100,
        lineWidth: 20, // 考虑样式属性
    },
});
// r + lineWidth / 2
circle.getRenderBounds(); // { center: [100, 100], halfExtents: [110, 110] }
```

## getLocalBounds(): AABB | null

getBounds 的唯一区别是在父节点的局部坐标系下计算。

## getBBox(): Rect

兼容 [SVG 同名方法](https://developer.mozilla.org/en-US/docs/Web/API/SVGGraphicsElement/getBBox)，计算方式等同于 getBounds，区别仅在于返回值类型不同，后者返回的是 AABB，而该方法返回一个 [DOMRect](https://developer.mozilla.org/zh-CN/docs/Web/API/DOMRect)：

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

## getBoundingClientRect(): DOMRect

获取浏览器坐标系下的 Geometry Bounds，应用世界坐标系下的变换后，再加上画布相对于浏览器的偏移量。

# 节点操作

在场景图中，我们需要构建父子关系，快速获取父子节点，有时还需要在子树中查询某一类型的节点列表。基于继承关系，每个 DisplayObject 都拥有 [Node](/en/docs/api/builtin-objects/node) 和 [Element](/en/docs/api/builtin-objects/element) 能力。

## 简单节点查询

| 名称            | 属性/方法 | 返回值            | 备注                           |
| --------------- | --------- | ----------------- | ------------------------------ | ------------------------------------ |
| parentNode      | 属性      | `DisplayObject    | null`                          | 父节点（如有）                       |
| parentElement   | 属性      | `DisplayObject    | null`                          | 父节点（如有）                       |
| childNodes      | 属性      | `DisplayObject[]` | 子节点列表                     |
| children        | 属性      | `DisplayObject[]` | 子节点列表                     |
| firstChild      | 属性      | `DisplayObject    | null`                          | 返回子节点列表中第一个节点（如有）   |
| lastChild       | 属性      | `DisplayObject    | null`                          | 返回子节点列表中最后一个节点（如有） |
| nextSibling     | 属性      | `DisplayObject    | null`                          | 返回后一个兄弟节点（如有）           |
| previousSibling | 属性      | `DisplayObject    | null`                          | 返回前一个兄弟节点（如有）           |
| contains        | 方法      | `boolean`         | 子树中是否包含某个节点（入参） |
| getRootNode     | 方法      | `Node`            | 返回当前节点的根节点           |
| ownerDocument   | 属性      | `Document`        | 返回画布入口 Document          |
| isConnected     | 属性      | `boolean`         | 节点是否被添加到画布中         |

## 高级查询

参考 CSS 选择器，我们提供了以下查询方法，查询范围是当前节点的**整棵子树**，并不仅仅是直接的子节点列表，而是所有子孙节点。

| 名称 | 参数 | 返回值 | 备注 |
| --- | --- | --- | --- | --- |
| getElementById | `(id: string)` | `DisplayObject | null` | 通过 `id` 查询子节点 |
| getElementsByName | `(name: string)` | `DisplayObject[]` | 通过 `name` 查询子节点列表 |
| getElementsByClassName | `(className: string)` | `DisplayObject[]` | 通过 `className` 查询子节点列表 |
| getElementsByTagName | `(tagName: string)` | `DisplayObject[]` | 通过 `tagName` 查询子节点列表 |
| querySelector | `(selector: string)` | `DisplayObject ｜ null` | 查询满足条件的第一个子节点 |
| querySelectorAll | `(selector: string)` | `DisplayObject[]` | 查询满足条件的所有子节点列表 |
| find | `(filter: Function)` | `DisplayObject ｜ null` | 查询满足条件的第一个子节点 |
| findAll | `(filter: Function)` | `DisplayObject[]` | 查询满足条件的所有子节点列表 |

下面我们以上面太阳系的例子，演示如何使用这些查询方法。

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

有时查询条件不好用 CSS 选择器描述，此时可以使用自定义查询方法：find/findAll。它们可以类比成 querySelector/querySelectorAll。不同之处在于前者需要传入一个 filter，例如以下写法等价：

```js
solarSystem.querySelector('[name=sun]');
solarSystem.find((element) => element.name === 'sun');

solarSystem.querySelectorAll('[r=25]');
solarSystem.findAll((element) => element.style.r === 25);
```

## 添加/删除节点

以下添加/删除节点能力来自继承的 [Element](/en/docs/api/builtin-objects/element) 基类。

| 名称 | 参数 | 返回值 | 备注 |
| --- | --- | --- | --- |
| appendChild | `child: DisplayObject` | `DisplayObject` | 添加子节点，返回添加的节点 |
| insertBefore | `child: DisplayObject`<br/>`reference?: DisplayObject` | `DisplayObject` | 添加子节点，在某个子节点之前（如有），返回添加的节点 |
| append | `...nodes: DisplayObject[]` |  | 在当前节点的子节点列表末尾批量添加一组节点 |
| prepend | `...nodes: DisplayObject[]` |  | 在当前节点的子节点列表头部批量添加一组节点 |
| after | `...nodes: DisplayObject[]` |  | 在当前节点之后批量添加一些兄弟节点 |
| before | `...nodes: DisplayObject[]` |  | 在当前节点之前批量添加一些兄弟节点 |
| removeChild | `child: DisplayObject`<br/>`destroy = true` | `DisplayObject` | 删除子节点，返回被删除的节点。`destroy` 表示是否要销毁 |
| removeChildren | `destroy = true` |  | 删除全部子节点。`destroy` 表示是否要销毁 |
| remove | `destroy = true` | `DisplayObject` | 从父节点（如有）中移除自身，`destroy` 表示是否要销毁 |
| replaceChild | `child: DisplayObject` | `DisplayObject` | 用指定的节点替换当前节点的一个子节点，并返回被替换掉的节点 |
| replaceWith | `...nodes: DisplayObject[]` |  | 在父节点的子节点列表中，用传入的节点列表替换该节点 |
| replaceChildren | `...nodes: DisplayObject[]` |  | 替换该节点的所有子节点。不传参数时则会清空该节点的所有子节点 |

从父节点中删除子节点并销毁有以下两种方式：

```js
// parent -> child
parent.removeChild(child);

// 等价于
child.remove();
```

删除所有子节点有以下三种方式：

```js
parent.removeChildren();

// 等价于
[...parent.children].forEach((child) => parent.removeChild(child));
[...parent.children].forEach((child) => child.remove());

// 等价于
parent.replaceChildren();
```

在添加/删除节点时有以下注意点：

1. 添加节点时会依次触发 ChildInserted 和 Inserted 事件
2. 删除节点时会依次触发 Removed 和 ChildRemoved 事件，默认会调用 [destroy](/en/docs/api/basic/display-object#销毁) 销毁自身。如果只是暂时从场景图中移除，后续还可能继续添加回来，可以使用 `remove(false)`

## 克隆节点

方法签名为 `cloneNode(deep?: boolean): this`，可选参数为是否需要深拷贝，返回克隆得到的新节点。

在下面的例子中，我们创建了一个圆，设置了它的半径与位置。拷贝得到的新节点拥有同样的样式属性与位置：

```js
circle.style.r = 20;
circle.setPosition(10, 20);

const clonedCircle = circle.cloneNode();
clonedCircle instanceof Circle; // true
clonedCircle.style.r; // 20
clonedCircle.getPosition(); // [10, 20]
```

注意事项：

-   支持深拷贝，即自身以及整棵子树
-   克隆的新节点不会保留原始节点的父子关系，需要使用 `appendChild` 将其加入画布才会被渲染
-   与 [DOM API](https://developer.mozilla.org/en-US/docs/Web/API/Node/cloneNode#notes) 保持一致，不会拷贝原图形上的事件监听器

在这个[示例](/en/examples/scenegraph#clone)中，我们展示了以上特性：

-   可以随时更改原始节点的样式属性，得到的拷贝都会是最新的，新节点同样需要被加入到场景图中才会被渲染
-   但由于不会拷贝事件监听器，因此只有原始节点可以进行拖拽
-   非深拷贝模式下，Text（Drag me 文本） 作为 Circle 的子节点不会被拷贝

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*PwEYSI_ijPEAAAAAAAAAAAAAARQnAQ)

## 获取/设置属性值

| 名称         | 参数                         | 返回值 | 备注       |
| ------------ | ---------------------------- | ------ | ---------- | -------------------- |
| getAttribute | `(name: string)`             | `null  | any`       | 根据属性名获取属性值 |
| setAttribute | `(name: string, value: any)` | 无     | 设置属性值 |

⚠️ 兼容旧版 `attr(name: string, value?: any)`，获取以及设置属性值。

⚠️ 兼容 [HTMLElement Style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style)，因此可以使用以下方法：

-   style.[getPropertyValue](https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleDeclaration/getPropertyValue)
-   style.[setProperty](https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleDeclaration/setProperty)
-   style.[removeProperty](https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleDeclaration/removeProperty)

以下用法等价：

```js
const circle = new Circle({
    style: {
        // 或者使用 attrs
        r: 10,
        fill: 'red',
    },
});

// 获取属性值
circle.getAttribute('fill'); // red
circle.attr('fill'); // red
circle.style.fill; // red
circle.style.getPropertyValue('fill');

// 设置属性值
circle.setAttribute('r', 20);
circle.attr('r', 20);
circle.style.r = 20;
circle.style.setProperty('r', 20);
```

## 获取解析后的属性值

部分属性例如 [Rect](/en/docs/api/basic/rect) 的 width / height 是支持单位的，如果想获取计算后的值，可以使用 `parsedStyle`：

```js
rect.style.width = '100px';
rect.parsedStyle.width; // { unit: 'px', value: 100 }
```

返回的 `ParsedElement` 格式如下：

```js
// 长度单位
export type LengthUnit = 'px' | '%' | 'em';
// 角度单位
export type AngleUnit = 'deg' | 'rad' | 'turn';
export type Unit = LengthUnit | AngleUnit | '';

export interface ParsedElement {
    unit: Unit;
    value: number;
}
```

需要注意的是，目前在使用[动画](/en/docs/api/animation)时，我们也会将待插值的属性值进行转换，因此如果想获取以 px 为单位的绝对值，需要使用 `parsedStyle` [示例](/en/examples/animation#onframe)：

```js
animation.onframe = () => {
    rect.style.width; // '100px'
    rect.parsedStyle.width; // { unit: 'px', value: 100 }
};
```

## 销毁

调用 `destroy()` 将销毁节点。被销毁的节点将无法被再次加入画布渲染。通过 [destroyed](/en/docs/api/basic/display-object#destroyed) 属性可以判断一个节点是否已经被销毁。

```js
circle.destroy();
```

在调用用该方法时，会依次执行以下操作：

1. 触发 Destroy 事件
2. 调用 `remove()` 将自身从场景图中移除，因此会触发 Removed 和 ChildRemoved 事件
3. 移除该节点上的所有事件监听器
4. 将 [destroyed](/en/docs/api/basic/display-object#destroyed) 标志置为 true

## 状态

通过以下属性可以判断图形当前的状态，例如是否被加入到画布中，是否已经被销毁等。

### isConnected

用于判断一个图形是否已经被加入到画布中。

https://developer.mozilla.org/zh-CN/docs/Web/API/Node/isConnected

```js
circle.isConnected; // false
canvas.appendChild(circle); // add to canvas
circle.isConnected; // true
```

### ownerDocument

指向画布的入口 Document。如果还未加入到画布中，返回 null。

https://developer.mozilla.org/en-US/docs/Web/API/Node/ownerDocument

```js
circle.ownerDocument; // null
canvas.appendChild(circle); // add to canvas
circle.ownerDocument; // canvas.document
```

### destroyed

用于判断一个图形是否已经被销毁。

通过调用 `destroy()` 主动销毁自身，或者父节点通过 `removeChildren()` 主动移除并销毁所有子节点等：

```js
circle.destroyed; // false
circle.destroy();
circle.destroyed; // true
```

## 生命周期事件监听

在[事件系统](/en/docs/api/event)中，我们可以使用类似 DOM Event API 的方式给添加到画布中的节点增加事件监听器。

除了例如 click、mouseenter 这样的交互事件，我们还提供了一系列内置的节点生命周期事件，例如可以监听节点的添加和删除事件，这些事件同样有完整的传播路径（冒泡、捕获），[示例](/en/examples/event#builtin)：

```js
import { ElementEvent, MutationEvent } from '@antv/g';

// 监听子节点添加事件
parent.on(ElementEvent.CHILD_INSERTED, (e) => {
    e.target; // parent
    e.detail.child; // child
});
child.on(ElementEvent.INSERTED, (e: MutationEvent) => {
    e.target; // child
    e.relatedNode; // parent
});
parent.on(ElementEvent.CHILD_REMOVED, (e) => {
    e.target; // parent
    e.detail.child; // child
});
child.on(ElementEvent.REMOVED, (e) => {
    e.target; // child
    e.relatedNode; // parent
});
child.on(ElementEvent.ATTR_MODIFIED, (e) => {
    e.target; // child
    e.attrName; // 属性名
    e.prevValue; // 旧值
    e.newValue; // 新值
});

parent.appendChild(child);
```

目前我们支持如下场景图相关事件：

-   CHILD_INSERTED 作为父节点有子节点添加时触发
-   INSERTED 作为子节点被添加时触发
-   CHILD_REMOVED 作为父节点有子节点移除时触发
-   REMOVED 作为子节点被移除时触发
-   MOUNTED 首次进入画布时触发
-   UNMOUNTED 从画布中移除时触发
-   ATTR_MODIFIED 修改属性时触发
-   DESTROY 销毁时触发

# 可见性与渲染次序

## 隐藏/显示

| 名称 | 参数 | 返回值 | 备注     |
| ---- | ---- | ------ | -------- |
| hide | 无   | 无     | 隐藏节点 |
| show | 无   | 无     | 展示节点 |

另外我们也可以通过 `visibility` 属性控制：

```javascript
const group = new Group();

group.hide();
// or group.setAttribute('visibility', 'hidden');

group.show();
// or group.setAttribute('visibility', 'visible');
```

| [Initial value](/en/docs/api/css/css-properties-values-api#initial-value) | Applicable elements | [Inheritable](/en/docs/api/css/inheritance) | Animatable | [Computed value](/en/docs/api/css/css-properties-values-api#computed-value) |
| --- | --- | --- | --- | --- |
| 'visible' | 所有 | 是 | 否 | [\<keywords\>](/en/docs/api/css/css-properties-values-api#关键词) |

关于可见性有两点需要注意：

1. 当图形隐藏时不会被拾取
2. 隐藏的元素仍然需要参与包围盒运算，即仍会占据空间。如果想完全移出元素，应该使用 [removeChild](/en/docs/api/basic/display-object#添加删除节点)

## 渲染次序

类似 CSS，我们可以通过 `zIndex` 属性控制渲染次序，有两点需要注意：

| 名称      | 参数     | 返回值 | 备注          |
| --------- | -------- | ------ | ------------- |
| setZIndex | `number` | 无     | 设置 `zIndex` |
| toFront   | 无       | 无     | 置顶          |
| toBack    | 无       | 无     | 置底          |

```javascript
const group = new Group();

group.setZIndex(100);
// or group.setAttribute('zIndex', 100);
// or group.style.zIndex = 100;
```

# 动画

参考 Web Animation API，可以使用 animate 完成 keyframe 动画，下面是一个 ScaleIn 动画效果：

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

更多用法详见[动画系统](/en/docs/api/animation)
