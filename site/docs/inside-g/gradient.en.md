---
title: Gradient Implementation
order: 2
---

# Background

The following gradient effects are supported and can be applied to the `fill` and `stroke` properties. Animations are not supported (they are applied directly, with no gradient effect).

You can switch between Canvas2D/SVG/WebGL in the [example](/en/examples/shape/circle/#gradient) to see the effect.

Linear gradient:

```
stroke: 'l(0) 0:#ffffff 0.5:#7ec2f3 1:#1890ff';
```

Radial/circular gradient:

```
fill: 'r(0.5, 0.5, 0.1) 0:#ffffff 1:#1890ff';
```

Texture:

```
fill: 'p(a)https://gw.alipayobjects.com/zos/rmsportal/ibtwzHXSxomqbZCPMLqS.png';
```

# Implementation Details

## Canvas2D

Created via the following APIs:

- [createLinearGradient](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/createLinearGradient)
- [createRadialGradient](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/createRadialGradient) Since x, y, and r use relative values, they need to be calculated based on the current shape's bounding box.
- [createPattern](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/createPattern)

It's worth noting that caching can be used to reduce the cost of repeated creation, for example, by using image URLs, color values, etc., as keys.

## SVG

In `defs`, you can define patterns and gradients, and then reference them by URL in the `fill` attribute:

```html
<defs>
    <pattern
        patternUnits="userSpaceOnUse"
        id="_pattern_3_4"
        width="3"
        height="3"
    >
        <image
            href="https://gw.alipayobjects.com/zos/rmsportal/ibtwzHXSxomqbZCPMLqS.png"
        >
        </image>
    </pattern>

    <radialGradient cx="0.5" cy="0.5" r="0.5" id="_pattern_2_5">
        <stop offset="0" stop-color="#ffffff"></stop>
        <stop offset="1" stop-color="#1890ff"></stop>
    </radialGradient>

    <linearGradient x1="0" y1="0" x2="1" y2="0" id="_pattern_1_6">
        <stop offset="0" stop-color="#ffffff"></stop>
        <stop offset="0.5" stop-color="#7ec2f3"></stop>
        <stop offset="1" stop-color="#1890ff"></stop>
    </linearGradient>
</defs>
```

### A Chrome bug

During development, it was discovered that Chrome cannot correctly display horizontal lines with a `stroke` set to a URL. As long as the line is not horizontal, it displays correctly:

```html
<line x1="0" y1="0" x2="20" y2="0" stroke-width="20" stroke="url(#utrim)" />
```

Someone reported this bug to Chrome. The current fix is to slightly adjust the line (note the small offset added to y2 below) so that it is not perfectly horizontal...

<https://stackoverflow.com/questions/14680240/did-chrome-break-svg-stroke-url>

```html
<line
    x1="0"
    y1="0"
    x2="100%"
    y2="0.01"
    stroke-width="20"
    stroke="url(#utrim)"
/>
```

## WebGL

Of course, you can create gradients in a Shader, but the problem is that you need to support multiple colorStops. This can be achieved through attributes, but it's still quite cumbersome. <https://stackoverflow.com/questions/61862262/webgl-shader-for-directional-linear-gradient>

Textures can be created from a Canvas, so you can use Canvas2D to create a Gradient. For example, PIXI.js does it this way: <https://pixijs.io/examples/#/textures/gradient-basic.js>

Taking a linear gradient as an example, you can create a fixed-size OffscreenCanvas, for example, 256 * 1 (a height of 1 is sufficient). After multiple `addColorStop` calls, use this OffscreenCanvas to create a texture. <https://github.com/ShukantPal/pixi-essentials/blob/master/packages/gradients/src/GradientFactory.ts>

However, for a RadialGradient, you still need to create a 256 * 256 canvas, and set `wrapS` and `wrapT` to `clamp to edge`. It is worth mentioning that the texture size (e.g., 32 * 32) must be smaller than the Canvas size, otherwise aliasing problems will occur.

### NPOT issue

WebGL1 does not support wrap modes like `REPEAT` for NPOT (non-power-of-two) textures, nor does it support mipmaps. WebGL2 does not have this limitation.

<https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Using_textures_in_WebGL>

> WebGL1 can only use non power of 2 textures with filtering set to NEAREST or LINEAR and it can not generate a mipmap for them. Their wrapping mode must also be set to CLAMP_TO_EDGE. On the other hand if the texture is a power of 2 in both dimensions then WebGL can do higher quality filtering, it can use mipmap, and it can set the wrapping mode to REPEAT or MIRRORED_REPEAT.

Therefore, in some rendering engines, you can see:

- In PIXI.js, tiling is not allowed for NPOT textures.
- Babylon.js will resize them, which of course causes additional performance overhead. <https://doc.babylonjs.com/advanced_topics/webGL2#power-of-two-textures>

For now, we are restricting textures to be POT (power-of-two); otherwise, tiling is not supported.
