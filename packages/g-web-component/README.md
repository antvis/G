# g-web-component

Inspired by [LUME](https://docs.lume.io/) which is built on Web Component standards, making it possible to write scenes declaratively using custom HTML elements, regardless of which view layer you prefer.

## Getting Started

Import from CDN:

```html
<script src="https://unpkg.com/@antv/g"></script>
<script src="https://unpkg.com/@antv/g-canvas"></script>
<script src="https://unpkg.com/@antv/g-web-component"></script>
```

Use NPM module:

```js
import from '@antv/g-web-component';
```

```html
<g-canvas
    renderer="canvas"
    plugins="rough-canvas-renderer"
    style="width: 800px; height: 800px; display: block"
>
    <g-rect fill="#2f54eb" radius="0 24 24" x="12" y="24" width="200" height="50">
        <g-circle fill="#adc6ff" r="16px" cx="25" cy="25"></g-circle>
        <g-text fill="#fff" x="50" y="20">我是一段文字</g-text>
    </g-rect>
</g-canvas>
```

## Custom Elements

### g-canvas

https://g-next.antv.vision/zh/docs/api/canvas

### g-circle

https://g-next.antv.vision/zh/docs/api/basic/circle

```html
<g-circle fill="#adc6ff" r="16px" cx="25" cy="25"></g-circle>
```

## Polyfill for Web Component

https://github.com/webcomponents/polyfills/tree/master/packages/webcomponentsjs
