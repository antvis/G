# @antv/g-plugin-annotation

Inspired by:

-   http://fabricjs.com/
-   https://konvajs.org/

# Getting Started

Install and register this plugin:

```js
import { Plugin } from '@antv/g-plugin-annotation';

const plugin = new Plugin();
canvasRenderer.registerPlugin(plugin);
```

# Features

## Customization

Refer to: http://fabricjs.com/fabric-intro-part-4#customization

```js
new Circle({
    style: {
        hasBorders: false,
        borderColor: 'red',
        cornerColor: 'green',
        cornerSize: 6,
    },
});
```
