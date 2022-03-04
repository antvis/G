---
title: g-plugin-yoga
order: -1
---

[Yoga](https://yogalayout.com/) 是 Facebook 提供的跨平台布局引擎，基于 Flex，属性和 CSS Flex 完全一致，因此也可以阅读 [MDN flex 布局的基本概念](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_Flexible_Box_Layout/Basic_Concepts_of_Flexbox) 获取更多概念知识。

示例：

-   [容器相关配置](/zh/examples/plugins#yoga-container)
-   [子元素相关配置](/zh/examples/plugins#yoga-child)

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*B_DmQ6lzHcIAAAAAAAAAAAAAARQnAQ" width="300px">

该插件使用 [yoga-layout-prebuilt](https://www.npmjs.com/package/yoga-layout-prebuilt)，包体积较大，后续我们会使用自己开发的轻量版布局引擎。

# 安装方式

首先注册插件：

```js
import { Renderer } from '@antv/g-canvas';
import { Plugin } from '@antv/g-plugin-yoga';

const renderer = new Renderer();
renderer.registerPlugin(new Plugin());
```

通过 `display: 'flex'` 可以声明一个图形使用 Flex 布局。目前我们仅支持 [Rect](/zh/docs/api/basic/rect) 和 [Group](/zh/docs/api/basic/group) 两类图形作为 Flex 容器：

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
root.appendChild(node1);
root.appendChild(node2);
```

# 支持属性

单位暂时仅支持绝对像素值。

## 声明 Flex 容器

使用 `display: 'flex'` 可以声明一个 Flex 容器，容器内所有直系子元素按照布局引擎计算结果进行布局，暂时仅支持 [Rect](/zh/docs/api/basic/rect) 和 [Group](/zh/docs/api/basic/group) 作为容器：

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

容器内子元素无类型限制，例如下图中可以看到 [Image](/zh/docs/api/basic/image) 也可以按照计算结果正常布局。

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*B_DmQ6lzHcIAAAAAAAAAAAAAARQnAQ" width="300px">

另外容器支持嵌套，例如上图中 Node1 自身也是一个 Flex 容器，因此其中的文本可以水平垂直居中。

## Layout

Layout 属性用于设置自身在容器中的布局效果，例如相对于已有结果进行调整。

### position

支持以下取值，可以配合 top / right / botton / left 使用，和 CSS 完全一致：

-   `relative` 默认值，相对于正常布局位置
-   `absolute` 相对于父容器进行绝对定位

下左图中 Node1 使用 `relative`，下右图使用 `absolute` 进行绝对定位：

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*B_DmQ6lzHcIAAAAAAAAAAAAAARQnAQ" width="300px">

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*AcD0R4SLDe8AAAAAAAAAAAAAARQnAQ" width="300px">

### top / right / botton / left

下图中 Node1 使用 `absolute` 进行绝对定位，`top` 和 `left` 设置为 10：

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*2zZaS6PlrOcAAAAAAAAAAAAAARQnAQ" width="300px">

### width / height

设置自身宽高尺寸，例如下图中 Node1 设置了一个稍大一些的长宽：

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*GzGKRarp_EEAAAAAAAAAAAAAARQnAQ" width="300px">

### minWidth / minHeight / maxWidth / maxHeight

最大最小约束，优先级高于其他属性。

### padding

数据类型为 `[number, number, number, number]`，一次性设置上右下左的 padding。

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

### paddingAll

数据类型为 `number`，统一设置上右下左的 padding。

### paddingTop / paddingRight / paddingBottom / paddingLeft

单独设置上右下左的 padding。

### margin

数据类型为 `[number, number, number, number]`，一次性设置上右下左的 margin。

例如下图中 Node1 设置了 `marginRight: 10`

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*6qPTRKwDtqsAAAAAAAAAAAAAARQnAQ" width="300px">

### marginAll

数据类型为 `number`，统一设置上右下左的 margin。

### marginTop / marginRight / marginBottom / marginLeft

单独设置上右下左的 margin。

### border

暂不支持。

## Flex

### flexDirection

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

### flexWrap

来自 [MDN 的说明](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_Flexible_Box_Layout/Basic_Concepts_of_Flexbox#%E7%94%A8flex-wrap%E5%AE%9E%E7%8E%B0%E5%A4%9A%E8%A1%8Cflex%E5%AE%B9%E5%99%A8)：

> 虽然 flexbox 是一维模型，但可以使我们的 flex 项目应用到多行中。 在这样做的时候，您应该把每一行看作一个新的 flex 容器。 任何空间分布都将在该行上发生，而不影响该空间分布的其他行。

支持以下取值：

-   wrap
-   no-wrap 默认值
-   wrap-reverse

在该[示例](/zh/examples/plugins#yoga-container)中，可以点击 `appendChild` 按钮向容器中添加子元素。下左图展示了容器默认 `no-wrap` 的效果，下右图设置为 `wrap` 自动换行：

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*PWBqQ6vbk68AAAAAAAAAAAAAARQnAQ" width="300px">

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*qOimRKvKZ8UAAAAAAAAAAAAAARQnAQ" width="300px">

### [WIP] flexBasis

来自 [MDN 的说明](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_Flexible_Box_Layout/Basic_Concepts_of_Flexbox#flex_%E5%85%83%E7%B4%A0%E4%B8%8A%E7%9A%84%E5%B1%9E%E6%80%A7)

> 在考虑这几个属性的作用之前，需要先了解一下 可用空间 available space 这个概念。

[Yoga 示例](https://yogalayout.com/docs/flex/)

定义了该元素的空间大小。

### [WIP] flexShrink

该属性是处理 flex 元素收缩的问题。

### [WIP] flexGrow

该属性是处理 flex 元素在主轴上增加空间的问题

## Alignment

来自 [MDN 的说明](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_Flexible_Box_Layout/Basic_Concepts_of_Flexbox#%E5%85%83%E7%B4%A0%E9%97%B4%E7%9A%84%E5%AF%B9%E9%BD%90%E5%92%8C%E7%A9%BA%E9%97%B4%E5%88%86%E9%85%8D)

> flexbox 的一个关键特性是能够设置 flex 元素沿主轴方向和交叉轴方向的对齐方式，以及它们之间的空间分配。

### justifyContent

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

### alignItems

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

### alignSelf

用于子元素覆盖容器中已有的 [alignItems](/zh/docs/plugins/yoga#alignitems) 的值：

在下图中，容器设置的 `alignItems` 为默认值 `stretch`，但 Node1 可以通过 `alignSelf: center` 让自身脱离原本 Node2 和 Node3 的布局效果：

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*G5HKSpnYVkAAAAAAAAAAAAAAARQnAQ" width="300px">

### alignContent

容器如何分配子元素周围空间，只有当 [flexWrap](/zh/docs/plugins/yoga#flexwrap) 取值为 `wrap` 时生效：

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

# 其他常见问题

## Flex 容器是否支持嵌套？

支持，每个容器内单独计算布局并影响内部的子元素。

## 支持非 Rect / Group 图形作为 Flex 容器吗？

暂不支持。如果容器本身不需要被渲染，应该使用 Group。以上例子为了更好地展示容器尺寸，我们选择了 Rect。

## Flex 容器内子元素还支持使用 `setPosition/setLocalPosition()` 调整位置吗？

一旦容器使用了 Flex，它内部的子元素都应该使用 Flex 相关属性进行定位。虽然不禁止使用 `setPosition`，但它显然会和布局引擎的计算结果冲突。

## 支持除绝对值之外的百分比吗？

需要支持，实现中。例如使用相对于父元素百分比的宽高：

```js
{
    width: '100%',
    height: '50%'
}
```

## 文本自动换行

目前 [Text](/zh/docs/api/basic/text) 已经支持多行文本，自动换行。

当文本作为子元素时，需要支持自动换行，即无需用户手动设置文本行宽。
