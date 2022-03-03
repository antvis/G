---
title: g-plugin-yoga
order: -1
---

Yoga 是 Facebook 提供的跨平台布局引擎，基于 Flex，属性和 CSS Flex 完全一致。

# 安装方式

首先注册插件：

```js
import { Renderer } from '@antv/g-canvas';
import { Plugin } from '@antv/g-plugin-yoga';

const renderer = new Renderer();
renderer.registerPlugin(new Plugin());
```

通过 `display: 'flex'` 可以声明一个图形使用 Flex 布局：

```js
// 声明一个容器
const root = new Rect({
    style: {
        width: 500, // 尺寸
        height: 300,
        display: 'flex', // 声明使用 flex 布局
        justifyContent: 'center', // 居中
        x: 0,
        y: 0,
        fill: '#C6E5FF',
    },
});
canvas.appendChild(root);

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

## Layout

### position

### top / right / botton / left

### width / height

### minWidth / minHeight / maxWidth / max Height

### padding

### margin

### border

## Flex

### direction
