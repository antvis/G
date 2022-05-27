# g-web-components

Inspired by [LUME](https://docs.lume.io/) which is built on Web Component standards, making it possible to write scenes declaratively using custom HTML elements, regardless of which view layer you prefer.

## Getting Started

Import from CDN:

```html
<script src="https://unpkg.com/@antv/g"></script>
<script src="https://unpkg.com/@antv/g-canvas"></script>
<script src="https://unpkg.com/@antv/g-web-components"></script>
```

Use NPM module:

```js
import from '@antv/g';
import from '@antv/g-canvas';
import from '@antv/g-web-components';
```

```html
<g-canvas renderer="canvas" width="400" height="400" plugins="rough-canvas-renderer">
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

### g-ellipse

https://g-next.antv.vision/zh/docs/api/basic/ellipse

### g-rect

https://g-next.antv.vision/zh/docs/api/basic/rect

### g-image

https://g-next.antv.vision/zh/docs/api/basic/image

### g-line

https://g-next.antv.vision/zh/docs/api/basic/line

### g-polyline

https://g-next.antv.vision/zh/docs/api/basic/polyline

### g-polygon

https://g-next.antv.vision/zh/docs/api/basic/polygon

### g-path

https://g-next.antv.vision/zh/docs/api/basic/path

### g-html

https://g-next.antv.vision/zh/docs/api/basic/html

## Polyfill for Web Component

https://github.com/webcomponents/polyfills/tree/master/packages/webcomponentsjs

## Limitations

-   Props accept only strings or booleans, eg. `radius='0 20 20'`.
