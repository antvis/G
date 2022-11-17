---
title: 使用轻量版
order: 6
---

浏览器在不断迭代新功能的过程中，体积会越来越大。尽管我们想实现一个“小浏览器”，但在体积敏感的场景下，用户仍希望使用最小功能集。这就要求我们对现有功能进行合理拆分，力图实现最小核心 + 渐进式增强的模式。

下图展示了 `@antv/g` 的 bundle 组成情况。

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*lBr-T54VZpcAAAAAAAAAAAAAARQnAQ" alt="bundle viz" width="100%">

完整版 `@antv/g` 由以下几部分组成：

-   `@antv/g-lite` 包含 [画布](/zh/api/canvas)，[基础图形](/zh/api/basic/concept)，[事件系统](/zh/api/event)，[插件系统](/zh/plugins/intro) 等核心功能
-   `@antv/g-camera-api` 提供完整相机动作和动画功能
-   `@antv/g-web-animations-api` 提供兼容 [Web Animations API](https://developer.mozilla.org/zh-CN/docs/Web/API/Web_Animations_API) 的动画系统
-   `@antv/g-css-typed-om-api` 提供 [CSS Typed OM API]()
-   `@antv/g-css-layout-api` 提供 [CSS Layout API]()
-   `@antv/g-dom-mutation-observer-api` 提供 DOM Mutation Observer API

## 使用方式

精简版使用方式和完整版在核心功能使用上完全一致，例如创建画布、基础图形、使用渲染器等：

```js
import { Canvas, Circle } from '@antv/g-lite';
import { Renderer } from '@antv/g-canvas';
```

此时调用元素的动画方法将无任何效果：

```js
circle.animate([], {});
```

需要手动引入 `@antv/g-web-animations-api` 后方可生效：

```js
import { Canvas, Circle } from '@antv/g-lite';
import '@antv/g-web-animations-api';
```

其他渐进式功能可使用类似方式按需引入。

## 功能介绍

下面详细介绍下拆分后各部分的功能。

### g-lite

包含 [画布](/zh/api/canvas)，[基础图形](/zh/api/basic/concept)，[事件系统](/zh/api/event)，[插件系统](/zh/plugins/intro) 等核心功能。

以上功能的使用方式没有变化，[示例](/zh/examples/ecosystem#lite)：

```js
import { Canvas, Circle } from '@antv/g-lite';
import { Renderer } from '@antv/g-canvas';

const canvas = new Canvas({
    container: 'container',
    width: 600,
    height: 500,
    renderer: new Renderer(),
});

const circle = new Circle({
    style: { r: 100 },
});
```

### g-camera-api

`@antv/g-lite` 中包含了一个简单的相机实现，但无法使用[相机动作](/zh/api/camera#相机动作)和[相机动画](/zh/api/camera#相机动画)：

```js
camera.pan(); // throw new Error('Method not implemented.');
camera.createLandmark(); // throw new Error('Method not implemented.');
```

引入后方可正常使用。

### g-web-animations-api

为基础图形提供兼容 [Web Animations API](https://developer.mozilla.org/zh-CN/docs/Web/API/Web_Animations_API) 的[动画能力](/zh/api/animation/waapi)。缺少该功能仍可以调用 `object.animate()` 方法，但无任何效果。

### g-css-typed-om-api

[CSS Typed OM API](https://developer.mozilla.org/en-US/docs/Web/API/CSS_Typed_OM_API) 允许使用 JS 操作解析后的属性值，它也是 CSS Houdini 的基础。以 `width: '50%'` 为例，字符串形式的属性值会被解析成 `CSS.percent(50)`，方便进行下一步的计算。

我们提供了[类似能力](/zh/api/css/css-typed-om)。

### g-css-layout-api

参考 [CSS Layout API](https://drafts.css-houdini.org/css-layout-api) 提供[布局能力](/zh/api/css/css-layout-api)。

### g-dom-mutation-observer-api

在 DOM API 中，当我们想感知 DOM 树节点的修改，例如新节点加入、属性值变更，可以使用 [MutationObserver](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver)。

在 G 中我们同样实现了这个 [API](/zh/api/builtin-objects/mutation-observer)，用来监听场景图中的变化。

### g-compat

在基础图形上提供兼容旧版本的方法，大部分在新版中都有兼容 DOM API 的实现。因此不推荐使用这些方法，后续随时可能移除：

-   getCount 获取子节点数目，新版使用 [childElementCount](/zh/api/builtin-objects/element#childelementcount)
-   getParent 获取父节点，新版使用 [parentElement](/zh/api/builtin-objects/node#parentelement)
-   getChildren 获取子节点列表，新版使用 [children](/zh/api/builtin-objects/element#children)
-   getFirst 获取第一个子节点，新版使用 [firstElementChild](/zh/api/builtin-objects/element#firstelementchild)
-   getLast 获取最后一个子节点，新版使用 [lastElementChild](/zh/api/builtin-objects/element#lastelementchild)
-   getChildByIndex 按索引获取子节点，新版使用 `this.children[index]`
-   add 添加子节点，新版使用 [appendChild](/zh/api/builtin-objects/node#appendchild)
-   setClip 设置裁剪图形，新版使用 [clipPath](/zh/api/basic/display-object#clippath)
-   getClip 获取裁剪图形，同上
-   set 在初始化配置上存储键值对
-   get 在初始化配置上读取值
-   show 展示图形，新版使用 [visibility](/zh/api/basic/display-object#visibility)
-   hide 隐藏图形，同上
-   moveTo 在世界坐标系下移动图形，新版使用 [setPosition](/zh/api/basic/display-object#平移)
-   move 同上
-   setZIndex 设置渲染次序，新版使用 [zIndex](/zh/api/basic/display-object#zindex)
