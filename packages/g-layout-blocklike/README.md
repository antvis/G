# g-layout-blocklike

## Getting Started

```js
import { CSS, Group, Circle } from '@antv/g';
import { Layout as BlockFlowLayout } from '@antv/g-layout-blocklike';

// 注册布局算法
CSS.registerLayout('block', BlockFlowLayout);

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

## Style props

### padding

### margin
