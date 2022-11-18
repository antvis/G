---
title: g-plugin-yoga
order: -1
---

[Yoga](https://yogalayout.com/) 是 Facebook 提供的跨平台布局引擎，基于 Flex，属性和 CSS Flex 完全一致，因此也可以阅读 [MDN flex 布局的基本概念](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_Flexible_Box_Layout/Basic_Concepts_of_Flexbox) 获取更多概念知识。

示例：

-   [容器相关配置](/zh/examples/plugins#yoga-container)
-   [子元素相关配置](/zh/examples/plugins#yoga-child)
-   [自适应布局](/zh/examples/plugins#yoga-available-space)
-   [文本换行](/zh/examples/plugins#yoga-text)
-   [对相关属性应用动画](/zh/examples/plugins#yoga-animation)

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*B_DmQ6lzHcIAAAAAAAAAAAAAARQnAQ" width="300px">

该插件使用 [yoga-layout-prebuilt](https://www.npmjs.com/package/yoga-layout-prebuilt)，包体积较大，后续我们会使用自己开发的轻量版布局引擎。

## 安装方式

首先注册插件：

```js
import { Renderer } from '@antv/g-canvas';
import { Plugin } from '@antv/g-plugin-yoga';

const renderer = new Renderer();
renderer.registerPlugin(new Plugin());
```

通过 `display: 'flex'` 可以声明一个图形使用 Flex 布局。目前我们仅支持 [Rect](/zh/api/basic/rect) 和 [Group](/zh/api/basic/group) 两类图形作为 Flex 容器：

```js
// 声明一个容器
const container = new Rect({
    style: {
        width: 500, // 尺寸
        height: 300,
        display: 'flex', // 声明使用 flex 布局
        justifyContent: 'center', // 居中
        alignItems: 'center', // 居中
        x: 0,
        y: 0,
        fill: '#C6E5FF',
    },
});
canvas.appendChild(container);

// 声明子元素，不需要手动设置位置，由布局引擎计算
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

## 支持属性

不同的属性支持的单位也不同，例如 `number` 类型的绝对像素值、`'100%'` 字符串类型的百分比以及特殊含义的 `'auto'`。

### 声明 Flex 容器

使用 `display: 'flex'` 可以声明一个 Flex 容器，容器内所有直系子元素按照布局引擎计算结果进行布局，暂时仅支持 [Rect](/zh/api/basic/rect) 和 [Group](/zh/api/basic/group) 作为容器：

```js
// 或者使用 Group
// const container = new Group({
const container = new Rect({
    style: {
        width: 500, // 尺寸
        height: 300,
        display: 'flex', // 声明使用 flex 布局
        justifyContent: 'center', // 居中
        alignItems: 'center', // 居中
        x: 0, // 容器局部坐标系下位置
        y: 0,
        fill: '#C6E5FF', // 其他样式属性
    },
});
```

容器内子元素无类型限制，例如下图中可以看到 [Image](/zh/api/basic/image) 也可以按照计算结果正常布局。

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*B_DmQ6lzHcIAAAAAAAAAAAAAARQnAQ" width="300px">

另外容器支持嵌套，例如上图中 Node1 自身也是一个 Flex 容器，因此其中的文本可以水平垂直居中。

### Layout

Layout 属性用于设置自身在容器中的布局效果，例如相对于已有结果进行调整。

#### position

支持以下取值，可以配合 top / right / botton / left 使用，和 CSS 完全一致：

-   `relative` 默认值，相对于正常布局位置
-   `absolute` 相对于父容器进行绝对定位

下左图中 Node1 使用 `relative`，下右图使用 `absolute` 进行绝对定位：

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*B_DmQ6lzHcIAAAAAAAAAAAAAARQnAQ" width="300px">

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*AcD0R4SLDe8AAAAAAAAAAAAAARQnAQ" width="300px">

#### top / right / botton / left

<tag color="green" text="可应用动画">可应用动画</tag>

支持绝对值与百分比，例如 `{ top: 10 }`、`{ top: '50%' }`。当传入百分比字符串时，相对于父元素的尺寸。

例如下图中 Node1 使用 `absolute` 进行绝对定位，`top` 和 `left` 设置为 10：

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*2zZaS6PlrOcAAAAAAAAAAAAAARQnAQ" width="300px">

下图中 Node1 使用 `absolute` 进行绝对定位，`top` 取 `'50%'`，即父元素高度的一半：

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*zSqHQJWIH1UAAAAAAAAAAAAAARQnAQ" width="300px">

下图中 Node1 使用 `absolute` 进行绝对定位，`top` 取 `-50`：

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*xj7YT4DOTOEAAAAAAAAAAAAAARQnAQ" width="300px">

#### width / height

<tag color="green" text="可应用动画">可应用动画</tag>

设置自身宽高尺寸。默认值为 `'auto'`。

支持百分比和绝对值，取百分比时相对于父元素尺寸。

例如下图中 Node1 设置了一个稍大一些的长宽：

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*GzGKRarp_EEAAAAAAAAAAAAAARQnAQ" width="300px">

#### minWidth / minHeight / maxWidth / maxHeight

最大最小约束，优先级高于其他属性。可以配合 [flexGrow](/zh/plugins/yoga#flexgrow) 使用。

默认值为 NaN，即无约束。支持百分比和绝对值，取百分比时相对于父元素尺寸，例如 `{ minWidth: 50% }`。

例如下图 Node1 设置了 `{ flexGrow: 1, maxWidth: 50% }`，因此它最多只能占据父元素宽度的一半：

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*cUDJSI8WKNIAAAAAAAAAAAAAARQnAQ" width="300px">

#### padding

<tag color="green" text="可应用动画">可应用动画</tag>

数据类型为 `[number | string, number | string, number | string, number | string]`，一次性设置上右下左的 padding。

支持以下取值，可参考 [CSS padding 属性](https://developer.mozilla.org/zh-CN/docs/Web/CSS/padding)：

-   绝对像素值，不支持负值，例如 `10`
-   百分比字符串，不支持负值，例如 `'50%'`，取百分比时相对于**自身的宽度**

例如以下两种写法等价：

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

<tag color="green" text="可应用动画">可应用动画</tag>

数据类型为 `number | string`，统一设置上右下左的 padding。

#### paddingTop / paddingRight / paddingBottom / paddingLeft

<tag color="green" text="可应用动画">可应用动画</tag>

单独设置上右下左的 padding。

#### margin

<tag color="green" text="可应用动画">可应用动画</tag>

```ts
type PixelsOrPercentage = number | string;
type YogaSize = PixelsOrPercentage | 'auto';
```

数据类型为 `[YogaSize, YogaSize, YogaSize, YogaSize]`，一次性设置上右下左的 margin。

支持以下取值，可参考 [CSS margin 属性](https://developer.mozilla.org/zh-CN/docs/Web/CSS/margin)：

-   绝对像素值，支持负值，例如 `10` `-50`
-   百分比字符串，支持负值，例如 `'50%'` `'-20%'`，取百分比时相对于**父元素的宽度**
-   `'auto'`，让布局引擎选择合适的外边距，可实现元素居中

例如下图中 Node1 分别设置了 `marginRight: 10` 和 `marginLeft: -50`：

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*6qPTRKwDtqsAAAAAAAAAAAAAARQnAQ" width="300px">
<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*qrzWT6TchH0AAAAAAAAAAAAAARQnAQ" width="300px">

下图展示了 `marginTop: '50%'` 的效果，以父元素宽度（500）为基准：

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*Kh90SJPkqr4AAAAAAAAAAAAAARQnAQ" width="200px">

下图展示了 `margin: [0, 'auto', 0, 'auto']` 的效果，让元素水平居中：

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*GCpwRa6aFsIAAAAAAAAAAAAAARQnAQ" width="300px">

#### marginAll

<tag color="green" text="可应用动画">可应用动画</tag>

数据类型为 `YogaSize`，统一设置上右下左的 margin。详见 [margin](/zh/plugins/yoga#margin)。

#### marginTop / marginRight / marginBottom / marginLeft

<tag color="green" text="可应用动画">可应用动画</tag>

单独设置上右下左的 margin。详见 [margin](/zh/plugins/yoga#margin)。

#### border

暂不支持。

### Flex

#### flexDirection

来自 [MDN 的说明](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_Flexible_Box_Layout/Basic_Concepts_of_Flexbox#flexbox_%E7%9A%84%E4%B8%A4%E6%A0%B9%E8%BD%B4%E7%BA%BF)

> 使用 flex 布局时，首先想到的是两根轴线：主轴和交叉轴。主轴由 `flexDirection` 定义，另一根轴垂直于它。

支持以下取值：

-   row 默认值
-   row-reverse
-   column
-   column-reverse

下左图为默认效果，下右图为 `column`：

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*wHajQJ_BzhAAAAAAAAAAAAAAARQnAQ" width="300px">

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*LfmcToFtFr4AAAAAAAAAAAAAARQnAQ" width="300px">

#### flexWrap

来自 [MDN 的说明](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_Flexible_Box_Layout/Basic_Concepts_of_Flexbox#%E7%94%A8flex-wrap%E5%AE%9E%E7%8E%B0%E5%A4%9A%E8%A1%8Cflex%E5%AE%B9%E5%99%A8)：

> 虽然 flexbox 是一维模型，但可以使我们的 flex 项目应用到多行中。 在这样做的时候，您应该把每一行看作一个新的 flex 容器。 任何空间分布都将在该行上发生，而不影响该空间分布的其他行。

支持以下取值：

-   wrap
-   no-wrap 默认值
-   wrap-reverse

在该[示例](/zh/examples/plugins#yoga-container)中，可以点击 `appendChild` 按钮向容器中添加子元素。下左图展示了容器默认 `no-wrap` 的效果（注意由于不允许换行，子元素在宽度上被压缩了），下右图设置为 `wrap` 自动换行：

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*BUfETp4tDZAAAAAAAAAAAAAAARQnAQ" width="300px">

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*qOimRKvKZ8UAAAAAAAAAAAAAARQnAQ" width="300px">

#### flexGrow

<tag color="green" text="可应用动画">可应用动画</tag>

该属性是处理子元素在主轴上增加空间的问题。当 Flex 容器首次分配完子元素空间之后，如果还有剩余空间，它会按照这些子元素的 flexGrow 属性进行二次分配。

默认值为 0，支持大于等于 0 的取值，作为分配剩余空间的权重。

例如下图中，Node1 和 Node2 都设置了初始大小 `{ width: 100, height: 100 }`，但 Node1 额外设置了 `{ flexGrow: 1 }`，因此它将占据容器主轴上的全部剩余空间（总宽度 500 - Node2 宽度 100 = 400），效果上看就被“拉长”了：

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*YCtYQL8IPwcAAAAAAAAAAAAAARQnAQ" width="300px">

如果想让 Node1 和 Node2 平分空间，可以在 Node2 上也设置 `{ flexGrow: 1 }`。

可以在该[示例](/zh/examples/plugins#yoga-available-space)中调整以观察效果。特别适合实现“自适应”布局，当容器宽度发生修改时，剩余空间也跟着改变。

另外，剩余空间的分配也会考虑到子元素上 [min/maxWidth/Height](/zh/plugins/yoga#minwidth--minheight--maxwidth--maxheight) 这样的约束条件，在该[示例](/zh/examples/plugins#yoga-available-space)中，Node1 同时设置了 `{ maxWidth: 200 }`，因此即使容器还有更多剩余空间，也不会分配给它（注意下图右侧容器的空白部分）：

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*fbvlTpdHR0IAAAAAAAAAAAAAARQnAQ" width="500px">

同样，当剩余空间不足时，`minWidth` 也能做为一个下限，例如下图中 Node1 最小宽度设置为 50，因此即使容器宽度仅有 100，也将保证它的展示宽度：

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*VpsQR72y3dsAAAAAAAAAAAAAARQnAQ" width="400px">

#### flexShrink

<tag color="green" text="可应用动画">可应用动画</tag>

该属性是处理子元素收缩的问题。如果容器中没有足够排列元素的空间，那么可以把子元素的 flexShrink 属性设置为正整数来缩小它所占空间到 flexBasis 以下。与 flexGrow 属性一样，可以赋予不同的值来控制子元素收缩的程度，即给 flexShrink 属性赋予更大的数值可以比赋予小数值的同级元素收缩程度更大。

默认值为 1，支持大于等于 0 的取值。

例如下图当容器宽度不足以容纳 Node1 和 Node2 设置的初始宽度时，会按照 flexShrink 进行缩放，两个字节点都设置为 1 因此缩放程度一致：

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*kf8jQKLjAA4AAAAAAAAAAAAAARQnAQ" width="300px">

#### flexBasis

<tag color="green" text="可应用动画">可应用动画</tag>

来自 [MDN 的说明](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_Flexible_Box_Layout/Basic_Concepts_of_Flexbox#flex_%E5%85%83%E7%B4%A0%E4%B8%8A%E7%9A%84%E5%B1%9E%E6%80%A7)

> 在考虑这几个属性的作用之前，需要先了解一下 可用空间 available space 这个概念。

[Yoga 示例](https://yogalayout.com/docs/flex/)

定义了该元素在主轴上的默认空间大小。

默认值为 NaN。

### Alignment

来自 [MDN 的说明](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_Flexible_Box_Layout/Basic_Concepts_of_Flexbox#%E5%85%83%E7%B4%A0%E9%97%B4%E7%9A%84%E5%AF%B9%E9%BD%90%E5%92%8C%E7%A9%BA%E9%97%B4%E5%88%86%E9%85%8D)

> flexbox 的一个关键特性是能够设置 flex 元素沿主轴方向和交叉轴方向的对齐方式，以及它们之间的空间分配。

#### justifyContent

该属性用来使元素在主轴方向上对齐。

支持以下枚举值：

-   flex-start 默认值
-   flex-end
-   center
-   space-between
-   space-around
-   space-evenly

在该[示例](/zh/examples/plugins#yoga-container)中，展示了 `center` / `space-between` / `space-around` 的效果：

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*3KUrRZ8gjg0AAAAAAAAAAAAAARQnAQ" width="300px">

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*384ITr4DRm8AAAAAAAAAAAAAARQnAQ" width="300px">

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*0rFhR7wNbr8AAAAAAAAAAAAAARQnAQ" width="300px">

#### alignItems

该属性可以使元素在交叉轴方向对齐。

支持以下枚举值：

-   stretch 默认值
-   auto
-   baseline
-   center
-   flex-start
-   flex-end
-   space-between
-   space-around

下图为 `center` 效果：

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*es0mTatBlHEAAAAAAAAAAAAAARQnAQ" width="300px">

#### alignSelf

用于子元素覆盖容器中已有的 [alignItems](/zh/plugins/yoga#alignitems) 的值：

在下图中，容器设置的 `alignItems` 为默认值 `stretch`，但 Node1 可以通过 `alignSelf: center` 让自身脱离原本 Node2 和 Node3 的布局效果：

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*G5HKSpnYVkAAAAAAAAAAAAAAARQnAQ" width="300px">

#### alignContent

容器如何分配子元素周围空间，只有当 [flexWrap](/zh/plugins/yoga#flexwrap) 取值为 `wrap` 时生效：

支持以下枚举值：

-   stretch
-   center
-   flex-start 默认值
-   flex-end
-   space-between
-   space-around

在该[示例](/zh/examples/plugins#yoga-container)中，依次展示了 `center` / `space-between` / `space-around` 效果：

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*P8hPS6i7iPcAAAAAAAAAAAAAARQnAQ" width="300px">

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*8w0rR7--k28AAAAAAAAAAAAAARQnAQ" width="300px">

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*VI4HRaZlQe4AAAAAAAAAAAAAARQnAQ" width="300px">

## 其他常见问题

### Flex 容器是否支持嵌套？

支持，每个容器内单独计算布局并影响内部的子元素。

### 支持非 Rect / Group 图形作为 Flex 容器吗？

暂不支持。如果容器本身不需要被渲染，应该使用 Group。以上例子为了更好地展示容器尺寸，我们选择了 Rect。

### Flex 容器内子元素还支持使用 `setPosition/setLocalPosition()` 调整位置吗？

一旦容器使用了 Flex，它内部的子元素都应该使用 Flex 相关属性进行定位。虽然不禁止使用 `setPosition`，但它显然会和布局引擎的计算结果冲突。

### 支持除绝对值之外的百分比吗？

支持。但不同属性使用百分比的参考值并不相同。

例如 [width/height](/zh/plugins/yoga#width--height) 相对于父元素的宽高：

```js
{
    width: '100%',
    height: '50%'
}
```

### 是否支持文本自动换行？

目前 [Text](/zh/api/basic/text) 已经支持多行文本，自动换行，但需要用户手动设置 `wordWrapWidth`，超出后换行。

在 Flex 布局中，当文本作为子元素时，无需用户手动设置文本行宽，只需要开启 `wordWrap`，配合 `width` 即可：

```js
const text = new Text({
    style: {
        fontFamily: 'PingFang SC',
        fontSize: 32,
        fill: '#1890FF',
        text: '这是测试文字，这是测试文字，这是测试文字，这是测试文字',
        wordWrap: true, // 开启自动换行
        width: '100%', // 行宽
    },
});
```

在该[示例](/zh/examples/plugins#yoga-text)中，可以随时改变需要换行文本的行宽，下图为 `width: '100%'` 的效果：

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*IH1fSJN9fsMAAAAAAAAAAAAAARQnAQ" width="300px">

### 新增的属性是否支持动画？

Flex 布局新增了很多新属性，例如 [padding](/zh/plugins/yoga#padding) [margin](/zh/plugins/yoga#margin) 等，在 CSS 中是可以对这些属性进行动画的。

目前支持了部分属性，在该[示例](/zh/examples/plugins#yoga-animation)中可以查看：

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

### 3D 图形是否可以使用布局？

需要指定一个平面，然后才能应用 Yoga 这样的 2D 布局引擎。

例如 [react-three-flex](https://github.com/pmndrs/react-three-flex) 中使用 `xy` `yz` `xz`。
