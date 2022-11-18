---
title: CSS Layout API
order: 5
---

基于样式系统，我们可以提供常用的布局算法，让用户避免相同场景的重复计算，主要参考 CSS Layout API 。

https://drafts.css-houdini.org/css-layout-api

https://github.com/w3c/css-houdini-drafts/blob/main/css-layout-api/EXPLAINER.md

布局算法以 `@antv/g-layout-xxx` 形式命名，用户在运行时：

1. 选择自己需要的布局算法，通过样式系统提供的 `CSS.registerLayout` API 完成注册
2. 容器元素通过 `display` 属性使用，容器内元素不再需要使用 x/y/z 属性或者 [setPosition]() 等 API 手动定位。定位工作由容器选择的布局算法承担

使用方式如下：

```js
import { CSS, Group, Circle } from '@antv/g';
import { Layout as BlockFlowLayout } from '@antv/g-layout-blockflow';
import { Layout as FlexLayout } from '@antv/g-layout-flex';
import { Layout as MasonryLayout } from '@antv/g-layout-masonry';
import { Layout as GridLayout } from '@antv/g-layout-grid';

// 注册布局算法
CSS.registerLayout('block', BlockFlowLayout);
CSS.registerLayout('flex', FlexLayout);
CSS.registerLayout('masonry', MasonryLayout);
CSS.registerLayout('grid', GridLayout);

// 使用 BlockFlow 布局
const blockGroup = new Group({
    style: {
        display: 'block', // 通过 display 属性使用
        width: '400px',
        height: '400px',
    },
});
// 容器内元素无需手动定位，由容器负责
blockGroup.appendChild(
    new Circle({
        style: {
            r: 100,
        },
    }),
);
canvas.appendChild(blockGroup);
```
