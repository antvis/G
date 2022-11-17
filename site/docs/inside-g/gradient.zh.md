---
title: 渐变色实现
order: 2
---

# 问题背景

支持以下渐变效果，可应用在 `fill` `stroke` 属性上。不支持动画（直接应用，无渐变效果）。

可以在[示例](/zh/examples/shape#gradient)中切换 Canvas2D/SVG/WebGL 查看效果。

线性渐变：

```
stroke: 'l(0) 0:#ffffff 0.5:#7ec2f3 1:#1890ff';
```

放射状/环形渐变：

```
fill: 'r(0.5, 0.5, 0.1) 0:#ffffff 1:#1890ff';
```

纹理：

```
fill: 'p(a)https://gw.alipayobjects.com/zos/rmsportal/ibtwzHXSxomqbZCPMLqS.png';
```

# 实现细节

## Canvas2D

通过以下 API 创建：

-   [createLinearGradient](https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/createLinearGradient)
-   [createRadialGradient](https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/createRadialGradient) 由于 xyr 使用的是相对值，需要结合当前图形包围盒计算
-   [createPattern](https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/createPattern)

需要注意的是可以使用缓存减少重复创建的成本，例如以图片 URL、颜色值等为 key。

## SVG

在 defs 中可以定义 pattern、渐变，然后通过 fill 属性引用 url：

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

### 一个 Chrome 的 bug

在开发时发现 Chrome 无法正常展示 stroke 为 url 的水平直线，只要直线不是水平都能正常展示：

```html
<line x1="0" y1="0" x2="20" y2="0" stroke-width="20" stroke="url(#utrim)" />
```

有人向 Chrome 反映了这个 bug，目前修复办法只能是稍微调整一下（注意下面给 y2 加了一点点偏移）让直线不是完全水平。。。

https://stackoverflow.com/questions/14680240/did-chrome-break-svg-stroke-url

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

当然可以在 Shader 中做渐变，但问题是需要支持多个 colorStop，可以通过 attribute 实现但还是挺麻烦。https://stackoverflow.com/questions/61862262/webgl-shader-for-directional-linear-gradient

纹理支持通过 Canvas 创建，因此可以用 Canvas2D 创建 Gradient，例如 PIXI.js 就是这么做的： https://pixijs.io/examples/#/textures/gradient-basic.js

以线性渐变为例，可以创建一个定长的 OffscreenCanvas 例如 256 \* 1（高度 1 就够），多次 addColorStop 之后用这个 OffscreenCanvas 创建纹理。 https://github.com/ShukantPal/pixi-essentials/blob/master/packages/gradients/src/GradientFactory.ts

但是对于 RadialGradient，还是需要创建一个 256 _ 256，wrapTS 都设置为 clamp to edge 即可。值得一提的是纹理大小（32 _ 32）一定要小于 Canvas 大小，不然会出现走样问题。

### NPOT 问题

WebGL1 对于 NPOT(power of 2 即长宽都是 2 的平方、立方）这样的纹理是不支持 REPEAT 这样的 wrap mode 的，也不支持 mipmap。WebGL2 则没有这样的限制。

https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Using_textures_in_WebGL

> WebGL1 can only use non power of 2 textures with filtering set to NEAREST or LINEAR and it can not generate a mipmap for them. Their wrapping mode must also be set to CLAMP_TO_EDGE. On the other hand if the texture is a power of 2 in both dimensions then WebGL can do higher quality filtering, it can use mipmap, and it can set the wrapping mode to REPEAT or MIRRORED_REPEAT.

因此在一些渲染引擎中能看到：

-   PIXI.js 中不允许对 NPOT 这样的纹理进行平铺。
-   Babylon.js 会进行 resize，当然这会造成额外性能开销。https://doc.babylonjs.com/advanced_topics/webGL2#power-of-two-textures

我们暂时限制纹理必须为 POT，否则不支持平铺。
