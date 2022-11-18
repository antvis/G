---
title: g-plugin-yoga
order: -1
---

[Yoga](https://yogalayout.com/) is a cross-platform layout engine provided by Facebook, based on Flex, with exactly the same properties as CSS Flex, so you can also read [MDN Basic Concepts of flex layout](https://developer.mozilla.org/zh- CN/docs/Web/CSS/CSS_Flexible_Box_Layout/Basic_Concepts_of_Flexbox) for more conceptual knowledge.

Examples:

-   [Container-related configuration](/en/examples/plugins#yoga-container)
-   [Sub-element related configuration](/en/examples/plugins#yoga-child)
-   [Adaptive layout](/en/examples/plugins#yoga-available-space)
-   [Text Line Feed](/en/examples/plugins#yoga-text)
-   [Apply animations to relevant properties](/en/examples/plugins#yoga-animation)

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*B_DmQ6lzHcIAAAAAAAAAAAAAARQnAQ" width="300px">

The plugin uses [yoga-layout-prebuilt](https://www.npmjs.com/package/yoga-layout-prebuilt), the package size is large, and we will subsequently use a lightweight version of our own developed layout engine.

## Usage

Create plug-ins and register them in the renderer.

```js
import { Renderer } from '@antv/g-canvas';
import { Plugin } from '@antv/g-plugin-yoga';

const renderer = new Renderer();
renderer.registerPlugin(new Plugin());
```

With `display: 'flex'` you can declare a graph to use Flex layout. Currently we only support [Rect](/en/api/basic/rect) and [Group](/en/api/basic/group) as Flex containers.

```js
// Declare a container
const container = new Rect({
    style: {
        width: 500, // Size
        height: 300,
        display: 'flex', // Declaring the use of flex layouts
        justifyContent: 'center',
        alignItems: 'center',
        x: 0,
        y: 0,
        fill: '#C6E5FF',
    },
});
canvas.appendChild(container);

// Declare child elements, no need to set the position manually, calculated by the layout engine
const node1 = new Rect({
    style: {
        fill: 'white',
        width: 100,
        height: 100,
    },
});
const node2 = new Rect({
    style: {
        fill: 'white',
        width: 100,
        height: 100,
    },
});
container.appendChild(node1);
container.appendChild(node2);
```

## Support Properties

Different properties support different units, such as absolute pixel values of type `number`, percentages of type `'100%'` string, and the special meaning of `'auto'`.

### Declare Flex containers

Use `display: 'flex'` to declare a Flex container, all the immediate children inside the container will be laid out according to the layout engine calculation, only [Rect](/en/api/basic/rect) and [Group](/en/api/basic/group) are supported as containers for now.

```js
// or using Group
// const container = new Group({
const container = new Rect({
    style: {
        width: 500,
        height: 300,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        x: 0,
        y: 0,
        fill: '#C6E5FF',
    },
});
```

There is no type restriction for child elements inside the container, for example, you can see in the following figure that [Image](/en/api/basic/image) can also be laid out normally according to the calculation result.

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*B_DmQ6lzHcIAAAAAAAAAAAAAARQnAQ" width="300px">

In addition, the container supports nesting, for example, Node1 in the above image is also a Flex container itself, so the text in it can be centered horizontally and vertically.

### Layout

The Layout property is used to set the effect of its own layout in the container, for example by adjusting it relative to existing results.

#### position

The following values are supported and can be used with top / right / botton / left, exactly as in CSS.

-   `relative` Default value, relative to the normal layout position
-   `absolute` Absolute positioning relative to the parent container

Node1 uses `relative` in the image below left and `absolute` in the image below right for absolute positioning.

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*B_DmQ6lzHcIAAAAAAAAAAAAAARQnAQ" width="300px">

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*AcD0R4SLDe8AAAAAAAAAAAAAARQnAQ" width="300px">

#### top / right / botton / left

<tag color="green" text="Animatable">Animatable</tag>

Supports absolute values with percentages, e.g. `{ top: 10 }`, `{ top: '50%' }`. Size relative to the parent element when a percentage string is passed in.

For example, in the figure below, Node1 uses `absolute` for absolute positioning, with `top` and `left` set to 10.

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*2zZaS6PlrOcAAAAAAAAAAAAAARQnAQ" width="300px">

In the following figure, Node1 is positioned absolutely using `absolute`, and `top` takes `'50%'`, which is half the height of the parent element.

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*zSqHQJWIH1UAAAAAAAAAAAAAARQnAQ" width="300px">

In the following figure, Node1 uses `absolute` for absolute positioning and `top` takes `-50`.

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*xj7YT4DOTOEAAAAAAAAAAAAAARQnAQ" width="300px">

#### width / height

<tag color="green" text="Animatable">Animatable</tag>

Set its own width and height size. The default value is `'auto'`.

Supports both percentage and absolute values, taking the percentage relative to the parent element size.

For example, in the following figure Node1 sets a slightly larger aspect.

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*GzGKRarp_EEAAAAAAAAAAAAAARQnAQ" width="300px">

#### minWidth / minHeight / maxWidth / maxHeight

Max-min constraint, priority over other attributes. Can be used with [flexGrow](/en/plugins/yoga#flexgrow).

Default value is NaN, i.e. no constraint. Support percentage and absolute values, take percentage relative to parent element size, e.g. `{ minWidth: 50% }`.

For example, the following Node1 is set to `{ flexGrow: 1, maxWidth: 50% }`, so it can only occupy up to half the width of its parent element.

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*cUDJSI8WKNIAAAAAAAAAAAAAARQnAQ" width="300px">

#### padding

<tag color="green" text="Animatable">Animatable</tag>

The data type is `[number | string, number | string, number | string, number | string]`, which sets the top-right and bottom-left padding at once.

The following values are supported and can be found in [CSS padding properties](https://developer.mozilla.org/zh-CN/docs/Web/CSS/padding).

-   Absolute pixel value, negative values are not supported, e.g. `10`
-   Percentage strings, negative values are not supported, e.g. `'50%'`, take the percentage relative to the width of **itself**

For example, the following two ways of writing are equivalent.

```js
{
    padding: [10, 0, 10, 0],
}
{
    paddingTop: 10,
    paddingRight: 0,
    paddingBottom: 10,
    paddingLeft: 0,
}
```

#### paddingAll

<tag color="green" text="Animatable">Animatable</tag>

The data type is `number | string`, and the padding is set uniformly from top right to bottom left.

#### paddingTop / paddingRight / paddingBottom / paddingLeft

<tag color="green" text="Animatable">Animatable</tag>

Set the top-right-bottom-left padding separately.

#### margin

<tag color="green" text="Animatable">Animatable</tag>

```ts
type PixelsOrPercentage = number | string;
type YogaSize = PixelsOrPercentage | 'auto';
```

The data type is `[YogaSize, YogaSize, YogaSize, YogaSize]`, which sets the top-right-bottom-left margin at once.

The following values are supported and can be found in [CSS margin properties](https://developer.mozilla.org/zh-CN/docs/Web/CSS/margin).

-   absolute pixel values, negative values are supported, e.g. `10` `-50`
-   Percentage strings, negative values are supported, e.g. `'50%'` `'-20%'`, relative to the width of the **parent element** when taking the percentage
-   `'auto'`, let the layout engine choose the right margin, can achieve the centering of the element

For example, in the following figure, Node1 has set `marginRight: 10` and `marginLeft: -50` respectively.

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*6qPTRKwDtqsAAAAAAAAAAAAAARQnAQ" width="300px">
<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*qrzWT6TchH0AAAAAAAAAAAAAARQnAQ" width="300px">

The following figure shows the effect of `marginTop: '50%'`, with the parent element width (500) as the base.

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*Kh90SJPkqr4AAAAAAAAAAAAAARQnAQ" width="200px">

The following image shows the effect of `margin: [0, 'auto', 0, 'auto']` to center the element horizontally.

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*GCpwRa6aFsIAAAAAAAAAAAAAARQnAQ" width="300px">

#### marginAll

<tag color="green" text="Animatable">Animatable</tag>

See [margin](/en/plugins/yoga#margin) for details.

#### marginTop / marginRight / marginBottom / marginLeft

<tag color="green" text="Animatable">Animatable</tag>

See [margin](/en/plugins/yoga#margin) for details.

#### border

Not supported at this time.

### Flex

#### flexDirection

From [MDN's description](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_Flexible_Box_Layout/Basic_Concepts_of_Flexbox#flexbox_%E7%9A%84%E4%B8%A4%E6%A0%B9%E8%BD%B4%E7%BA%BF)

> When using the flex layout, the first two axes that come to mind are the main axis and the cross axis. The main axis is defined by `flexDirection`, and the other axis is perpendicular to it.

The following values are supported.

-   `'row'` default value
-   `'row-reverse'`
-   `'column'`
-   `'column-reverse'`

The left image below shows the default effect, and the right image below shows the `'column''.

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*wHajQJ_BzhAAAAAAAAAAAAAAARQnAQ" width="300px">

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*LfmcToFtFr4AAAAAAAAAAAAAARQnAQ" width="300px">

#### flexWrap

From [MDN's description](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_Flexible_Box_Layout/Basic_Concepts_of_Flexbox#%E7%94%A8flex-wrap%E5%AE%9E%E7%8E%B0%E5%A4%9A%E8%A1%8Cflex%E5%AE%B9%E5%99%A8)：

> Although flexbox is a one-dimensional model, it is possible to make our flex items apply to multiple rows. When doing so, you should treat each row as a new flex container. Any spatial distribution will occur on that row, without affecting the other rows of that spatial distribution.

The following values are supported.

-   `'wrap'`
-   `'no-wrap'` default value
-   `'wrap-reverse'`

In this [example](/en/examples/plugins#yoga-container), you can add child elements to the container by clicking the `appendChild` button. The image on the left below shows the effect of the container's default `no-wrap` (note that the child element is compressed in width because line breaks are not allowed), and the image on the right below is set to `wrap` with automatic line breaks.

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*BUfETp4tDZAAAAAAAAAAAAAAARQnAQ" width="300px">

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*qOimRKvKZ8UAAAAAAAAAAAAAARQnAQ" width="300px">

#### flexGrow

<tag color="green" text="Animatable">Animatable</tag>

This property deals with child elements adding space to the main axis. After the Flex container has allocated space for the child elements for the first time, if there is any space left, it will allocate it a second time according to the flexGrow property of those child elements.

The default value is 0, and values greater than or equal to 0 are supported as weights for allocating the remaining space.

For example, in the figure below, Node1 and Node2 are both set to the initial size `{ width: 100, height: 100 }`, but Node1 is additionally set to `{ flexGrow: 1 }`, so it will take up all the remaining space on the main axis of the container (total width 500 - Node2 width 100 = 400), which has the effect of being "stretched" by.

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*YCtYQL8IPwcAAAAAAAAAAAAAARQnAQ" width="300px">

If you want Node1 and Node2 to split the space equally, you can set `{ flexGrow: 1 }` on Node2 as well.

You can adjust this [example](/en/examples/plugins#yoga-available-space) to see the effect. This is particularly suitable for implementing "adaptive" layouts, where when the container width is modified, the remaining space changes as well.

Also, the allocation of the remaining space takes into account constraints like [min/maxWidth/Height](/en/plugins/yoga#minwidth--minheight--maxwidth--maxheight) on the child elements, and in this [example](/en/ examples/plugins#yoga examples/plugins#yoga-available-space), Node1 also has `{ maxWidth: 200 }` set, so even if there is more space left in the container, it will not be allocated to it (note the blank part of the container on the right side of the image below).

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*fbvlTpdHR0IAAAAAAAAAAAAAARQnAQ" width="500px">

Likewise, `minWidth` can be used as a lower limit when there is not enough space left, for example, the minimum width of Node1 in the following figure is set to 50, so even if the container is only 100 wide, it will be guaranteed to be displayed at the following width.

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*VpsQR72y3dsAAAAAAAAAAAAAARQnAQ" width="400px">

#### flexShrink

<tag color="green" text="Animatable">Animatable</tag>

This property handles the shrinking of child elements. If there is not enough space in the container to align the elements, then the flexShrink property of a child element can be set to a positive integer to shrink the space it occupies below flexBasis. As with the flexGrow attribute, different values can be assigned to control how much the child element shrinks, i.e. giving a larger value to the flexShrink attribute can shrink it more than a smaller value given to a sibling.

The default value is 1, and values greater than or equal to 0 are supported.

For example, in the following figure, when the container is not wide enough to accommodate the initial width set by Node1 and Node2, it will be scaled according to flexShrink, which is set to 1 for both word nodes and therefore scaled to the same extent.

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*kf8jQKLjAA4AAAAAAAAAAAAAARQnAQ" width="300px">

#### flexBasis

<tag color="green" text="Animatable">Animatable</tag>

From [MDN's description](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_Flexible_Box_Layout/Basic_Concepts_of_Flexbox#flex_%E5%85%83%E7%B4%A0%E4%B8%8A%E7%9A%84%E5%B1%9E%E6%80%A7)

> Before considering the role of these properties, it is important to understand the concept of available space.

[Yoga Example](https://yogalayout.com/docs/flex/)

Defines the default space size for this element on the main axis.

The default value is NaN.

### Alignment

From [MDN's description](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_Flexible_Box_Layout/Basic_Concepts_of_Flexbox#%E5%85%83%E7%B4%A0%E9%97%B4%E7%9A%84%E5%AF%B9%E9%BD%90%E5%92%8C%E7%A9%BA%E9%97%B4%E5%88%86%E9%85%8D)

> A key feature of flexbox is the ability to set the alignment of flex elements along the major and cross-axis directions, as well as the space allocation between them.

#### justifyContent

This property is used to align elements in the major axis direction.

The following enumeration values are supported.

-   `'flex-start'` the default value
-   `'flex-end'`
-   `'center'`
-   `'space-between'`
-   `'space-around'`
-   `'space-evenly'`

In this [example](/en/examples/plugins#yoga-container), the effect of `center` / `space-between` / `space-around` is shown.

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*3KUrRZ8gjg0AAAAAAAAAAAAAARQnAQ" width="300px">

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*384ITr4DRm8AAAAAAAAAAAAAARQnAQ" width="300px">

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*0rFhR7wNbr8AAAAAAAAAAAAAARQnAQ" width="300px">

#### alignItems

This property allows elements to be aligned in the cross-axis direction.

The following enumeration values are supported.

-   `'stretch'` the default value
-   `'auto'`
-   `'baseline'`
-   `'center'`
-   `'flex-start'`
-   `'flex-end'`
-   `'space-between'`
-   `'space-around'`

The following figure shows the `center` effect.

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*es0mTatBlHEAAAAAAAAAAAAAARQnAQ" width="300px">

#### alignSelf

For child elements to override the existing [alignItems](/en/plugins/yoga#alignitems) value in the container.

In the following figure, the container sets `alignItems` to the default value of `stretch`, but Node1 can set itself out of the original Node2 and Node3 layout effect by using `alignSelf: center`.

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*G5HKSpnYVkAAAAAAAAAAAAAAARQnAQ" width="300px">

#### alignContent

How the container allocates space around child elements only takes effect if [flexWrap](/en/plugins/yoga#flexwrap) takes the value `wrap`.

The following enumeration values are supported.

-   `'stretch'`
-   `'center'`
-   `'flex-start'` the default value
-   `'flex-end'`
-   `'space-between'`
-   `'space-around'`

In this [example](/en/examples/plugins#yoga-container), the `center` / `space-between` / `space-around` effects are shown in order.

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*P8hPS6i7iPcAAAAAAAAAAAAAARQnAQ" width="300px">

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*8w0rR7--k28AAAAAAAAAAAAAARQnAQ" width="300px">

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*VI4HRaZlQe4AAAAAAAAAAAAAARQnAQ" width="300px">

## Other Frequently Asked Questions

### Does the Flex container support nesting?

Yes, the layout is calculated separately within each container and affects the inner child elements.

### Do you support non-Rect / Group graphics as Flex containers?

Not supported at the moment. If the container itself does not need to be rendered, you should use Group. above example we chose Rect to better show the container size.

### Does the Flex container also support repositioning of child elements using `setPosition/setLocalPosition()`?

Once a container uses Flex, all child elements inside it should be positioned using Flex-related properties. While the use of `setPosition` is not prohibited, it will obviously conflict with the layout engine's calculations.

### Do you support percentages other than absolute values?

Yes. However, the reference values for using percentages are not the same for different attributes.

For example [width/height](/en/plugins/yoga#width--height) relative to the width and height of the parent element.

```js
{
    width: '100%',
    height: '50%'
}
```

### Does it support automatic text line feeds?

Currently [Text](/en/api/basic/text) already supports multi-line text with automatic line break, but requires user to set `wordWrapWidth` manually to break the line when it is exceeded.

In Flex layout, when text is a child element, there is no need for user to set text line width manually, just turn on `wordWrap` with `width` and you can.

```js
const text = new Text({
    style: {
        fontFamily: 'PingFang SC',
        fontSize: 32,
        fill: '#1890FF',
        text: '这是测试文字，这是测试文字，这是测试文字，这是测试文字',
        wordWrap: true, // Turn on automatic line feeds
        width: '100%',
    },
});
```

In this [example](/en/examples/plugins#yoga-text), you can always change the line width of the text that needs a line break, as shown below for `width: '100%'`.

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*IH1fSJN9fsMAAAAAAAAAAAAAARQnAQ" width="300px">

### Does the added property support animation?

Flex layout adds many new properties, such as [padding](/en/plugins/yoga#padding) [margin](/en/plugins/yoga#margin), etc. It is possible to animate these properties in CSS.

Some of these properties are currently supported and can be viewed in this [example](/en/examples/plugins#yoga-animation).

```js
node1.animate(
    [
        { top: 0, left: 0, width: 100, marginAll: 0, paddingLeft: 0 },
        { top: 100, left: 100, width: 200, marginAll: 20, paddingLeft: 50 },
    ],
    {
        duration: 1000,
        easing: 'cubic-bezier(0.250, 0.460, 0.450, 0.940)',
        fill: 'both',
        iterations: Infinity,
        direction: 'alternate-reverse',
    },
);
```

### Is it possible to use layouts for 3D graphics?

You need to specify a plane before you can apply a 2D layout engine like Yoga.

For example, [react-three-flex](https://github.com/pmndrs/react-three-flex) uses `xy` `yz` `xz`.
