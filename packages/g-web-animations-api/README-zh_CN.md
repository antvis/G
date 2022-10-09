[English](./README.md) | 简体中文

实现 [Web Animations API](https://developer.mozilla.org/zh-CN/docs/Web/API/Web_Animations_API)，它参考了 CSS 和 SVG 的动画设计，以命令式的方式提供对于动画更精细的控制能力。

参考了 [web-animations-polyfill](https://github.com/web-animations/web-animations-js) 的实现。

### 使用方式

详见[使用文档](https://g-next.antv.vision/zh/docs/api/animation/waapi)。

```js
const scaleInCenter = circle.animate(
    [
        {
            transform: 'scale(0)', // 起始关键帧
        },
        {
            transform: 'scale(1)', // 结束关键帧
        },
    ],
    {
        duration: 500, // 持续时间
        easing: 'cubic-bezier(0.250, 0.460, 0.450, 0.940)', // 缓动函数
        fill: 'both', // 动画处于非运行状态时，该图形的展示效果
    },
);
```
