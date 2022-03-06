---
title: g-plugin-yoga-wasm
order: -1
---

[Yoga](https://yogalayout.com/) 是 Facebook 提供的跨平台布局引擎，基于 Flex，属性和 CSS Flex 完全一致，因此也可以阅读 [MDN flex 布局的基本概念](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_Flexible_Box_Layout/Basic_Concepts_of_Flexbox) 获取更多概念知识。

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*B_DmQ6lzHcIAAAAAAAAAAAAAARQnAQ" width="300px">

该插件提供的基于 Yoga 的布局能力与 [g-plugin-yoga](/zh/docs/plugins/yoga) 完全一致。区别仅在于使用 [yoga-layout-wasm](https://github.com/pinqy520/yoga-layout-wasm)，在运行时加载 WASM。

# 安装方式

首先注册插件：

```js
import { Renderer } from '@antv/g-canvas';
import { Plugin } from '@antv/g-plugin-yoga-wasm';

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
container.appendChild(node1);
container.appendChild(node2);
```

# API

与 [g-plugin-yoga](/zh/docs/plugins/yoga) 完全一致。
