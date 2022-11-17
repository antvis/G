---
title: g-plugin-canvaskit-renderer
order: 3
---

Use [Skia](https://skia.org/docs/user/api/) to draw 2D graphics. Load [Canvaskit](https://github.com/google/skia/tree/main/modules/canvaskit) in WASM format asynchronously at runtime, and wrap [WebGL2RenderingContext](https://developer .mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext) into `SkSurface`, which in turn is drawn by the `<canvas>` element on the page.

Skia offers more features than the Canvas2D API, such as text paragraph layout, [Lottie animation](https://skia.org/docs/user/modules/skottie/), and more. In addition to Chrome and Android, some cross-platform solutions such as [Flutter](https://docs.flutter.dev/resources/architectural-overview), [Weex](https://github.com/alibaba/) weex) also use it as the underlying rendering engine.

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*_usaTqSm6vYAAAAAAAAAAAAAARQnAQ" width="200" alt="skottie lego">
<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*919sR5Oxx_kAAAAAAAAAAAAAARQnAQ" width="300" alt="canvaskit particles">

## Usage

The [g-canvaskit](/en/api/renderer/canvaskit) renderer is built-in by default, so there is no need to introduce it manually.

```js
import { Renderer as CanvaskitRenderer } from '@antv/g-canvaskit';
// Create the CanvasKit renderer, which has the plugin built in
const canvaskitRenderer = new CanvaskitRenderer();
```

## API

### playAnimation

The [Lottie](https://airbnb.design/introducing-lottie/) animation was created with the [Bodymovin](https://github.com/bodymovin/bodymovin) plugin for After Effects and exported to JSON format.

The full method signature is as follows, which contains the following parameters.

-   name Animation name, required
-   jsonStr Lottie description file in JSON format, required
-   bounds The display area, which accepts data in the format `[left, top, width, height]`, is optional. Not filled will try to use the size defined in the description file, i.e. `[0, 0, width, height]`
-   assets Additional resource files, optional

Returns a `ManagedSkottieAnimation` object

```js
playAnimation(name: string, jsonStr: string, bounds?: InputRect, assets?: any): ManagedSkottieAnimation;
```

First create the renderer and get the g-plugin-canvaskit-renderer via [getPlugin](/en/api/renderer/renderer#getplugin).

```js
import { Renderer } from '@antv/g-canvaskit';

const canvaskitRenderer = new Renderer({
    wasmDir: '/',
});
const plugin = canvaskitRenderer.getPlugin('canvaskit-renderer');
```

Then wait for the canvas initialization to complete and load the Lottie animation description file.

```js
(async () => {
    const cdn = 'https://storage.googleapis.com/skia-cdn/misc/';

    const [_, jsonstr] = await Promise.all([
        canvas.ready,
        fetch(cdn + 'lego_loader.json').then((response) => response.text()),
    ]);

    const animation = plugin.playAnimation(
        'sk_legos',
        jsonstr,
        [-50, 0, 350, 300],
    );
})();
```

If you want to remove the animation, you can call the `delete()` method on the returned animation object.

```js
animation.delete();
```

### createParticles

For example, particle effects such as fireworks, flames, etc. require generating and animating a large number of "particles", which are usually programmed in the GPU through the shader, e.g. interpolation calculations to change the position of each particle should be done in the GPU instead of the CPU.

CanvasKit provides a Skia-based programming language [SkSL(Skia's shading language)](https://skia.org/docs/user/sksl/) implementation, which is syntactically very close to GLSL and is used in the shader to control particle generation and animation. and animation in the shader, which is a certain threshold for developers who have not been exposed to shader programming.

In this [example](/en/examples/plugins#canvaskit-particles), we have implemented some particle effects.

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*919sR5Oxx_kAAAAAAAAAAAAAARQnAQ" width="300" alt="canvaskit particles">

First create the renderer and get the [g-plugin-canvaskit-renderer](/en/api/renderer/renderer#getplugin) plugin via [getPlugin](/en/plugins/canvaskit-renderer).

```js
import { Renderer } from '@antv/g-canvaskit';

const canvaskitRenderer = new Renderer({
    wasmDir: '/',
});
const plugin = canvaskitRenderer.getPlugin('canvaskit-renderer');
```

Then call the plugin's [createParticles](/en/plugins/canvaskit-renderer#createparticles) to create the particle effect, transform the canvas to adjust the position of the particles in the callback function at each frame, and finally start the particle generation with [start]().

```js
const textParticles = plugin.createParticles(JSON.stringify(text), (canvas) => {
    canvas.translate(250, 250);
});
textParticles.start(Date.now() / 1000.0, true);
```

Finally, let's look at the key particle effect definitions.

-   MaxCount
-   Drawable The type of particle, usually `'SkCircleDrawable'`, can be modified in size
-   Code SkSL code to control the life cycle of the particles, such as how the position and color should change in each frame
-   Bindings

```js
const text = {
    MaxCount: 2000,
    Drawable: {
        Type: 'SkCircleDrawable',
        Radius: 1,
    },
    Code: [
        'void effectSpawn(inout Effect effect) {',
        '  effect.rate = 1000;',
        '}',
        '',
        'void spawn(inout Particle p) {',
        '  p.lifetime = mix(1, 3, rand(p.seed));',
        '  float a = radians(mix(250, 290, rand(p.seed)));',
        '  float s = mix(10, 30, rand(p.seed));',
        '  p.vel.x = cos(a) * s;',
        '  p.vel.y = sin(a) * s;',
        '  p.pos += text(rand(p.seed)).xy;',
        '}',
        '',
        'void update(inout Particle p) {',
        '  float4 startColor = float4(1, 0.196, 0.078, 1);',
        '  float4 endColor   = float4(1, 0.784, 0.078, 1);',
        '  p.color = mix(startColor, endColor, p.age);',
        '}',
        '',
    ],
    Bindings: [
        {
            Type: 'SkTextBinding',
            Name: 'text',
            Text: 'AntV',
            FontSize: 96,
        },
    ],
};
```

If you want to remove the particle effect, you can call the `delete()` method on the returned object.

```js
particles.delete();
```
