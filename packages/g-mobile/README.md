# g-mobile

定义了基于 Canvas2D 的上下文，内置以下插件：

-   `ContextRegisterPlugin` 提供小程序环境下的上下文服务
-   [g-plugin-canvas-renderer](https://g-next.antv.vision/zh/docs/plugins/canvas-renderer) 使用 Canvas2D API 上下文渲染各种图形
-   [g-plugin-canvas-picker](https://g-next.antv.vision/zh/docs/plugins/canvas-picker) 基于 Canvas2D API 实现的拾取
-   g-plugin-mobile-interaction 监听移动端环境事件，触发标准 pointer 系列事件

## 使用方式

```js
import { Canvas } from '@antv/g';
import { Renderer } from '@antv/g-mobile';

// 创建渲染器
const renderer = new Renderer();

// 创建画布
const canvas = new Canvas({
    canvas: {
        getContext: () => {
            // 模拟 DOM API，返回小程序 context，它应当和 Canvas2DRenderingContext 一致
            // @see https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLCanvasElement/getContext
            return context;
        },
        getBoundingClientRect: () => {
            // 模拟 DOM API，返回小程序 context 相对于视口的位置
            // @see https://developer.mozilla.org/zh-CN/docs/Web/API/Element/getBoundingClientRect
            return rect;
        },
    },
    renderer,
    //（可选）传入原本 DOM 环境下需要通过 window 获取的属性和方法，例如 dpr、rAF 等
    // @see https://g-next.antv.vision/zh/docs/api/canvas#devicepixelratio
    devicePixelRatio: 2,
    requestAnimationFrame,
    cancelAnimationFrame,
});

// 正常创建图形并添加到画布
```
