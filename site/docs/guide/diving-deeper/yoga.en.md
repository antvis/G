---
title: 使用 Yoga 布局引擎
order: 13
---

[Yoga](https://yogalayout.com/) 是 Facebook 提供的跨平台布局引擎，基于 Flex，属性和 CSS Flex 完全一致，因此也可以阅读 [MDN flex 布局的基本概念](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_Flexible_Box_Layout/Basic_Concepts_of_Flexbox) 获取更多概念知识。

通过 [g-plugin-yoga](/zh/plugins/yoga) 插件的支持，我们可以给已有 2D 图形增加 Flex 属性。

在该[示例](/zh/examples/plugins#yoga-text)中，我们创建了一个常见的自适应布局效果：

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*IH1fSJN9fsMAAAAAAAAAAAAAARQnAQ" width="300px">

## 注册插件

创建一个渲染器并注册插件：

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

## 创建 Flex 容器

我们使用 [Rect](/zh/api/basic/rect) 创建一个淡蓝色背景容器。

首先通过 `display: 'flex'` 将它声明为一个 Flex 容器。目前我们仅支持 [Rect](/zh/api/basic/rect) 和 [Group](/zh/api/basic/group) 作为 Flex 容器，详见[声明 Flex 容器](/zh/plugins/yoga#声明-flex-容器)。

然后使用 [flexDirection](/zh/plugins/yoga#flexdirection) 属性让子元素竖向排列。

最后使用 [padding](/zh/plugins/yoga#padding) 在四周留白：

```js
const root = new Rect({
  id: 'root',
  style: {n
    fill: '#C6E5FF',
    width: 500,
    height: 300,
    x: 50,
    y: 50,
    display: 'flex', // 声明为 Flex 容器
    flexDirection: 'column',
    padding: [10, 10, 10, 10],
  },
});
canvas.appendChild(root);
```

## 创建顶部 Header

接下来我们往容器中添加第一个元素，一个固定高度的 Header。

注意宽度我们使用了百分比 `width: '100%'`，即父元素（淡蓝色容器）的宽度。

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

## 创建下方自适应区域

固定 Header 之后，我们希望下方区域占满容器的剩余空间。

这里我们创建了一个 [Group](/zh/api/basic/group)，没有继续使用 [Rect](/zh/api/basic/rect) 的原因是我们不希望它作为容器本身被渲染出来。

使用 [flexGrow](/zh/plugins/yoga#flexgrow) 这样它的高度会根据父容器自适应，同时声明自身也是一个 Flex 容器，后续会添加更多子元素。

```js
const bottomPanel = new Group({
    style: {
        display: 'flex',
        width: '100%',
        flexGrow: 1,
    },
});
```

## 继续划分区域

接下来我们继续划分刚创建的下方区域，这次创建一个水平方向的两栏布局。

```js
bottomPanel.appendChild(leftPanel);
bottomPanel.appendChild(rightPanel);
```

## 元素居中

居中也是一个常见的需求，例如顶部 Header 中使用 [justifyContent](/zh/plugins/yoga#justifycontent) 和 [alignItems](/zh/plugins/yoga#alignitems) 实现：

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
