# Native HTML in Canvas prototype

This demo exercises the experimental `drawElementImage()` Canvas API through G's Canvas renderer.

```ts
import { Renderer } from '@antv/g-canvas';

const renderer = new Renderer({ htmlRendering: 'native' });
```

When the browser exposes `canvas[content="drawable"]`, `requestPaint()`, and `drawElementImage()`, G mounts each `HTML` display object inside the Canvas and draws it in scene order. The demo checks native button interaction, overlap with a later `Rect`, and PNG export. In other browsers the renderer automatically uses the existing DOM overlay.

Native mode requires an `HTMLCanvasElement`. Passing an `OffscreenCanvas` while native mode is active raises an explicit error.

From the repository root, run `pnpm exec vite --config demo/native-html-canvas/vite.config.mjs` and open `http://127.0.0.1:5175/native-html-canvas.html` in a browser with the experimental API enabled.

This is a focused prototype. Complex HTML transforms, clipping, accessibility behavior under occlusion, and performance with many HTML nodes still need validation before making the mode a stable API.
