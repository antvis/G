---
title: 第一节：定义场景
order: 1
---

在该系列教程中，我们将逐步实现一个简单的可视化场景，展示节点和边，并让它们具备拖拽、拾取等基本交互能力。

在本节中，我们将学习如何使用[场景图](/zh/guide/diving-deeper/scenegraph)描述场景。

我们的场景十分简单，包含两个节点，用 [Circle](/zh/api/basic/circle) 实现，连接它们的一条边用 [Line](/zh/api/basic/line) 实现，其中每个节点上的文本使用 [Text](/zh/api/basic/text) 实现。

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*5irUQKZPTVoAAAAAAAAAAAAAARQnAQ)

[完整 CodeSandbox 例子](https://codesandbox.io/s/ru-men-jiao-cheng-qs3zn?file=/index.js)

## 创建节点

首先我们从 `@antv/g` 中引入基础图形 [Circle](/zh/api/basic/circle)，我们的节点用它来实现：

```javascript
import { Circle } from '@antv/g';
```

然后我们需要定义该图形的一系列属性：

```javascript
// 节点1
const node1 = new Circle({
    style: {
        r: 100, // 半径
        fill: '#1890FF', // 填充色
        stroke: '#F04864', // 描边颜色
        lineWidth: 4, // 描边宽度
    },
});
```

同样我们可以创建第二个节点。

## 给节点添加文本

我们想在节点上展示描述性文本，同样我们从 `@antv/g` 中引入基础图形 [Text](/zh/api/basic/text)：

```javascript
import { Text } from '@antv/g';

const text1 = new Text({
    style: {
        text: 'Node1', // 文本内容
        fontFamily: 'Avenir', // 字体
        fontSize: 22, // 字号
        fill: '#fff', // 文本颜色
        textAlign: 'center', // 水平居中
        textBaseline: 'middle', // 垂直居中
    },
});
```

文本应该是节点的子节点，在场景图中，这种父子关系通过 `appendChild` 构建：

```javascript
node1.appendChild(text1);
```

我们只需要设置节点的位置，它的所有子节点（文本）也会跟着移动：

```javascript
node1.setPosition(200, 200);
```

## 创建边

我们从 `@antv/g` 中引入基础图形 [Line](/zh/api/basic/line)，将两个端点连接起来：

```javascript
import { Line } from '@antv/g';

const edge = new Line({
    style: {
        x1: 200,
        y1: 200,
        x2: 400,
        y2: 200,
        stroke: '#1890FF',
        lineWidth: 2,
    },
});
```

至此我们的场景就定义完毕了，在下一节中我们将使用渲染器将场景渲染出来。
