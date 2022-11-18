---
title: g-plugin-svg-renderer
order: 5
---

提供基于 SVG 的渲染能力。

## 安装方式

`g-svg` 渲染器默认内置，因此无需手动引入。

```js
import { Renderer as SvgRenderer } from '@antv/g-svg';
// 创建 SVG 渲染器，其中内置了该插件
const svgRenderer = new SvgRenderer();
```

## 扩展点

该插件暴露以下扩展点。

### ElementLifeCycleContribution

该扩展点提供 SVG 元素从创建、更新到销毁的生命周期。

```js
export interface ElementLifeCycleContribution {
    createElement: (object: DisplayObject) => SVGElement;
    shouldUpdateElementAttribute: (
        object: DisplayObject,
        attributeName: string,
    ) => boolean;
    updateElementAttribute: (object: DisplayObject, $el: SVGElement) => void;
    destroyElement: (object: DisplayObject, $el: SVGElement) => void;
}
```

不同渲染器插件可以实现以上接口，使用自定义方式管理每个图形的生命周期。例如下面的代码展示了两个基于 SVG 的渲染器插件，前者为 [g-svg](/zh/api/renderer/svg) 内置，提供默认 SVG 元素的渲染能力，后者在此基础上借助 rough.js 实现手绘风格渲染。

```js
// g-plugin-svg-renderer
@singleton({ token: ElementLifeCycleContribution })
export class DefaultElementLifeCycleContribution
    implements ElementLifeCycleContribution {}

// g-plugin-svg-rough-renderer
@singleton({ token: ElementLifeCycleContribution })
export class RoughElementLifeCycleContribution
    implements ElementLifeCycleContribution {}
```

#### createElement

该方法根据传入的基础图形，使用 DOM API 创建对应的 SVGElement。在触发 [ElementEvent.MOUNTED](/zh/api/basic/display-object#生命周期事件监听) 事件时调用。

#### shouldUpdateElementAttribute

重绘在 SVG 中表现为属性更新，但部分属性（例如 [visibility](/zh/api/basic/display-object#隐藏显示)，[z-index](/zh/api/basic/display-object#zindex) 等）的更新我们有统一的内部实现，并不打算开放自定义能力。因此需要有一个判断方法决定是否触发属性更新。

当图形首次挂载触发 [ElementEvent.MOUNTED](/zh/api/basic/display-object#生命周期事件监听) 以及后续属性更新触发 [ElementEvent.ATTR_MODIFIED](/zh/api/basic/display-object#生命周期事件监听) 事件时调用。

#### updateElementAttribute

通过属性更新判断方法后，执行更新属性逻辑。

#### destroyElement

当图形从画布中移除触发 [ElementEvent.UNMOUNTED](/zh/api/basic/display-object#生命周期事件监听) 时调用该方法。
