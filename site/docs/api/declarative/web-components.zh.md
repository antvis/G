---
title: 使用 Web Components
order: 0
---

[Web Components](https://developer.mozilla.org/zh-CN/docs/Web/Web_Components) 允许扩展浏览器内置的 HTML 元素并完成复用。在使用声明式写法的同时，这也是一种与视图层（React Vue Svelte 等）无关的方案。当然如果有需要，视图层也很容易基于它继续封装。

在该 [示例]() 中，我们使用 HTML 语法定义[场景图]()，避免了大量诸如 [appendChild]() 这样的命令式调用。而对于各个图形则非常类似 SVG 的用法，属性值都以字符串形式存在。

```html
<g-canvas renderer="canvas" width="400" height="400">
    <g-rect
        fill="#2f54eb"
        radius="0 24px 24px"
        x="12px"
        y="24px"
        width="200px"
        height="50px"
    >
        <g-circle fill="#adc6ff" r="16px" cx="25px" cy="25px"></g-circle>
        <g-text fill="#fff" x="50px" y="20px">我是一段文字</g-text>
    </g-rect>
</g-canvas>
```

局限性：

-   自定义元素的属性值只支持 `string` 和 `boolean`
-   事件绑定这样必须要使用命令式 API 的情况下，需要使用 `ref`

## 安装方式

同样有以下两种使用方式。

使用 CDN：

```html
<script src="https://unpkg.com/@antv/g"></script>
<script src="https://unpkg.com/@antv/g-canvas"></script>
<script src="https://unpkg.com/@antv/g-web-components"></script>
```

使用 NPM module:

```js
import '@antv/g';
import '@antv/g-canvas';
import '@antv/g-web-components';
```

安装完成之后会使用 [CustomElementRegistry.define()](https://developer.mozilla.org/zh-CN/docs/Web/API/CustomElementRegistry/define) 自动完成相关组件的注册。

## Custom Elements

目前支持以下自定义元素。大部分都可以参考对应图形的命令式 API。

### \<g-canvas\>

### \<g-circle\>

可参考 [Circle](/zh/api/basic/circle)。

### \<g-ellipse\>

可参考 [Ellipse](/zh/api/basic/ellipse)。

### \<g-rect\>

可参考 [Rect](/zh/api/basic/rect)。

需要注意 [radius](/zh/api/basic/rect#radius) 需要使用数组字符串形式：

```html
<g-rect
    radius="0 24px 24px"
    x="12px"
    y="24px"
    width="200px"
    height="50px"
></g-rect>
```

### \<g-line\>

可参考 [Line](/zh/api/basic/line)。

### \<g-path\>

可参考 [Path](/zh/api/basic/path)。

需要注意路径定义一定要使用字符串形式。

```html
<g-path
    transform="translate(0, 100px)"
    stroke="#2f54eb"
    path="M 0,40 C 5.5555555555555545,40,22.222222222222218,44.44444444444445,33.33333333333333,40 C 44.444444444444436, ..."
></g-path>
```
