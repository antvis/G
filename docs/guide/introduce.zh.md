---
title: 介绍
order: 0
---

- G 是一款易用、高效、强大的 2D 可视化渲染引擎，提供 Canvas、SVG 等多种渲染方式的实现。目前，已有多个顶级的可视化开源项目基于 G 开发，比如图形语法库 [G2](https://antv.alipay.com/g2)、图可视化库 [G6](https://antv.alipay.com/g6) 等。

## 特性

- 强大、可扩展的渲染能力，并内置常用的基础图形。
- 极致的渲染性能，支持大数据量的可视化场景。
- 完整模拟浏览器 DOM 的事件，与原生事件的表现无差异。
- 流畅的动画实现，以及丰富的配置接口。
- 同时提供 Canvas 和 SVG 版本的实现，且两者的 API 基本保持一致。

## 安装

```bash
# Canvas version

$ npm install @antv/g-canvas --save

# SVG version
$ npm install @antv/g-svg --save
```

## 使用

![](https://cdn.nlark.com/yuque/0/2019/png/103291/1572431709730-2e84bca7-e4e0-47b9-b7a5-11844ba6b331.png)

```html
<div id="c1"></div>
```

```js
import { Canvas } from '@antv/g-canvas';

const canvas = new Canvas({
  container: 'c1',
  width: 500,
  height: 500,
  renderer: 'svg',
});

const group = canvas.addGroup();
group.addShape('circle', {
  attrs: {
    x: 100,
    y: 100,
    r: 50,
    fill: 'red',
    stroke: 'blue',
    lineWidth: 5,
  },
});
```

## 链接

- [官网](https://antv.alipay.com/g)
- [图形语法 G2](https://antv.alipay.com/g2)
- [图可视化 G6](https://antv.alipay.com/g6)
- [CodeSandbox 模板](https://codesandbox.io/s/g-reproducible-demo-1quml) for bug reports
