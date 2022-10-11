---
title: Lottie 动画
order: 2
---

除了使用 [Web Animations API]() 描述动画，我们还支持播放 Lottie 格式，为此我们提供了一个类似 [lottie-web](https://github.com/airbnb/lottie-web/) 的播放器。在内部我们会将其中定义的图形和 Keyframe 动画转换成我们的[基础图形]() 和动画描述，同时提供简单的动画控制方法。

# 使用方式

首先安装播放器：

```bash
npm install @antv/g-lottie-player --save
```

然后使用播放器提供的 [loadAnimation](/zh/docs/api/animation/lottie#createanimation) 方法创建一个 [LottieAnimation](/zh/docs/api/animation/lottie#lottieanimation) 对象，传入 Lottie JSON：

```js
import { loadAnimation } from '@antv/g-lottie-player';

const ballAnimation = loadAnimation(bouncy_ball, { loop: true });
```

最后在合适的时机渲染到画布：

```js
canvas.addEventListener(CanvasEvent.READY, () => {
    const wrapper = ballAnimation.render(canvas);
});
```

# API

播放器提供以下 API。

## loadAnimation

参考 [lottie-web](https://github.com/airbnb/lottie-web/blob/6faae912910b2d7be6c5422ef4621f3933c19d60/player/js/animation/AnimationManager.js#L227) 的同名方法，用于加载 Lottie 文件创建 [LottieAnimation](/zh/docs/api/animation/lottie#lottieanimation)。

参数如下：

-   `data` Lottie JSON
-   `options` 配置项

## LottieAnimation

通过 [loadAnimation](/zh/docs/api/animation/lottie#loadanimation) 可以创建该对象，进而对动画过程进行控制。

### render

渲染到画布，和动画一样需要在[画布初始化完成后](/zh/docs/api/canvas#ready)进行：

```js
animation.render(canvas);
```

支持以下参数：

-   [画布](/zh/docs/api/canvas)
-   配置项

### play

### pause

### stop

### togglePause

### goToAndStop

### setSpeed

### setDirection

### destroy

销毁全部内部对象，当然同时也会终止动画。

```js
animation.destroy();
```

### size

返回 Lottie 文件尺寸：

```js
animation.size(); // { width: 1080, height: 260 }
```

### version

返回 Lottie 文件中包含的 [Bodymovin](https://aescripts.com/bodymovin/) 版本

```js
animation.version();
```

# 支持特性

## Shapes

支持 [Shape Layer](https://lottiefiles.github.io/lottie-docs/layers/#shape-layer) 中定义的以下[元素](https://lottiefiles.github.io/lottie-docs/shapes/#shape-element)：

-   [x] Rectangle
-   [x] Ellipse
-   [x] Path
-   [x] Group
-   [ ] PolyStar

### Rectangle

会转换成 [Rect](/zh/docs/api/basic/rect) 进行渲染。

https://lottiefiles.github.io/lottie-docs/shapes/#rectangle

### Ellipse

会转换成 [Ellipse](/zh/docs/api/basic/ellipse) 进行渲染。

https://lottiefiles.github.io/lottie-docs/shapes/#ellipse

### Path

会转换成 [Path](/zh/docs/api/basic/path) 进行渲染。

https://lottiefiles.github.io/lottie-docs/shapes/#path

### [WIP] PolyStar

https://lottiefiles.github.io/lottie-docs/shapes/#polystar

### Group

会转换成 [Group](/zh/docs/api/basic/group) 进行渲染。

https://lottiefiles.github.io/lottie-docs/shapes/#group

### Transform

https://lottiefiles.github.io/lottie-docs/concepts/#transform

支持以下特性：

-   [anchor]() 对应 `a` 字段
-   [translation]() 对应 `p` 字段
-   [scaling]() 对应 `s` 字段
-   [rotation]() 对应 `r` 字段

暂不支持以下特性：

-   [skew]() 对应 `sk` 字段
-   [skewAxis]() 对应 `sa` 字段

在该[示例](/zh/examples/ecosystem#lottie-player-transform)中，深蓝色为基准矩形，我们以红色圆点为 [transformOrigin]()，旋转一定角度得到淡蓝色矩形。

<img src="https://gw.alipayobjects.com/mdn/rms_dfc253/afts/img/A*Nlj4SYJXKccAAAAAAAAAAAAAARQnAQ" alt="transform" width="400">

### Style

支持以下样式属性：

-   [x] Fill
-   [x] Stroke
-   [x] Gradients

#### Fill

https://lottiefiles.github.io/lottie-docs/shapes/#fill

填充色，同时支持以下特性：

-   [fillOpacity](/zh/docs/api/basic/display-object#fillopacity) 对应 `o` 字段

暂不支持以下特性：

-   [FillRule](https://lottiefiles.github.io/lottie-docs/constants/#fillrule)

#### Stroke

https://lottiefiles.github.io/lottie-docs/shapes/#stroke

描边色，同时支持以下特性：

-   [strokeOpacity](/zh/docs/api/basic/display-object#strokeopacity) 对应 `o` 字段
-   [strokeWidth](/zh/docs/api/basic/display-object#strokewidth) 对应 `w` 字段
-   [lineCap](/zh/docs/api/basic/display-object#linecap) 对应 `lc` 字段
-   [lineJoin](/zh/docs/api/basic/display-object#linejoin) 对应 `lj` 字段
-   [miterLimit](/zh/docs/api/basic/display-object#miterlimit) 对应 `ml` 字段
-   [lineDash](/zh/docs/api/basic/display-object#linedash) 对应 `d` 字段

#### Gradients

https://lottiefiles.github.io/lottie-docs/shapes/#gradients

支持[线性](/zh/docs/api/css/css-properties-values-api#linear-gradient)和[放射](/zh/docs/api/css/css-properties-values-api#radial-gradient)渐变。

暂不支持以下特性：

-   对渐变应用动画
-   Highlight length & angle (`h` 和 `a` 字段)

### Modifiers

#### [WIP] Repeater

#### [WIP] Trim Path

## Layers

https://lottiefiles.github.io/lottie-docs/layers/#layers

### Solid Color

https://lottiefiles.github.io/lottie-docs/layers/#solid-color-layer

### Image

https://lottiefiles.github.io/lottie-docs/layers/#image-layer https://lottiefiles.github.io/lottie-docs/assets/#image

### Text

https://lottiefiles.github.io/lottie-docs/layers/#text-layer https://lottiefiles.github.io/lottie-docs/text/

### Precomposition

https://lottiefiles.github.io/lottie-docs/layers/#precomposition-layer https://lottiefiles.github.io/lottie-docs/assets/#precomposition

## Expressions

暂不支持。

https://lottiefiles.github.io/lottie-docs/expressions/
