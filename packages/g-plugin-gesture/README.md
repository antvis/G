# @antv/g-plugin-gesture

## Getting Started

Create and register plugin in renderer.

```js
import { Renderer } from '@antv/g-canvas';
import { Plugin } from '@antv/g-plugin-gesture';

const plugin = new Plugin();
const renderer = new Renderer();
renderer.registerPlugin(plugin);
```

Enable gesture with `gestureEnabled` in style.

```js
const circle = new Circle({
    style: {
        cx: 200,
        cy: 200,
        r: 100,
        fill: 'blue',
        gestureEnabled: true,
    },
});
```

Then we can listen gesture event such as `press` on plugin:

```js
canvas.addEventListener('press', (e) => {
    console.log(e.target);
});
```
