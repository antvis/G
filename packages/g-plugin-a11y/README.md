# @antv/g-plugin-a11y

Inspired by:

-   https://www.highcharts.com/blog/posts/a11y/
-   https://github.com/pixijs/pixijs/tree/dev/packages/accessibility

# Getting Started

Install and register this plugin:

```js
import { Plugin } from '@antv/g-plugin-a11y';

const plugin = new Plugin({
    enableExtractingText: true,
});
canvasRenderer.registerPlugin(plugin);
```

# Features

## enableExtractingText

Extracts all visible text content from the canvas and makes them searchable by the browser (command + F) and SEO friendly.

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*NKFsSYYofj4AAAAAAAAAAAAAARQnAQ" width="400" alt="searchable texts">

```js
const plugin = new Plugin({
    enableExtractingText: true,
});
canvasRenderer.registerPlugin(plugin);
```

We create a DOM layer called `g-a11y-text-extractor-mask` which contains text content used in current canvas:

```html
<div
    id="g-a11y-text-extractor-mask"
    style="position: absolute; inset: 0px; z-index: 99; pointer-events: none; user-select: none; overflow: hidden;"
>
    <div
        id="g-a11y-text-extractor-text-94"
        style="line-height: 1; position: absolute; white-space: pre; word-break: keep-all; color: transparent !important; transform-origin: 0px 0px; transform: translate(0px, 0px) translate(-50%, -100%) matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 320, 350, 0, 1); font-size: 10px; font-family: sans-serif;"
    >
        Humidity
    </div>
</div>
```

There are the following considerations:

-   SVG natively supports this feature, so we won't append the mask.
-   Since the minimum fontsize in Chrome is `12px`, this may cause inconsistencies.
