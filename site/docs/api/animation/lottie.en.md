---
title: Lottie
order: 2
---

In addition to describing animations using the [Web Animations API](/en/api/animation/waapi), we also support playback of Lottie formats, for which we provide a player like [lottie-web](https://github.com/airbnb/lottie- web/) player. Internally we will convert the graphics and Keyframe animations defined there into our [basic graphics](/en/api/basic/display-object) and animation descriptions, while providing simple animation control methods.

## Usage

Install player first:

```bash
npm install @antv/g-lottie-player --save
```

Then use the [loadAnimation](/en/api/animation/lottie#createanimation) method provided by the player to create a [LottieAnimation](/en/api/animation/lottie#lottieanimation) object, passing in the Lottie JSON.

```js
import { loadAnimation } from '@antv/g-lottie-player';

const ballAnimation = loadAnimation(bouncy_ball, { loop: true });
```

Finally, render to canvas at the right time.

```js
canvas.addEventListener(CanvasEvent.READY, () => {
    const wrapper = ballAnimation.render(canvas);
});
```

## API

### loadAnimation

Reference [lottie-web](https://github.com/airbnb/lottie-web/blob/6faae912910b2d7be6c5422ef4621f3933c19d60/player/js/animation/ AnimationManager.js#L227) method of the same name for loading Lottie files to create [LottieAnimation](/en/api/animation/lottie#lottieanimation).

The parameters are as follows.

-   `data` Lottie JSON
-   `options` configuration item
    -   `loop` is of type `boolean | number`. If or not loop is enabled, the default value is `true` which means infinite loop. When `number` is passed in, it means the number of loops.
    -   `autoplay` is of type `boolean`. The default value is `false` to start autoplay immediately after loading.

For example, to create an infinitely looping, immediately playable animation.

```js
import { loadAnimation } from '@antv/g-lottie-player';

const ballAnimation = loadAnimation(bouncy_ball, {
    loop: true,
    autoplay: true,
});
```

### LottieAnimation

This object can be created by [loadAnimation](/en/api/animation/lottie#loadanimation) to control the animation process.

#### render

Renders to [canvas](/en/api/canvas) and returns a [Group](/en/api/basic/group) as a container, which can subsequently be transformed to.

```js
const wrapper = animation.render(canvas);

wrapper.scale(0.5);
wrapper.translate(100, 100);
```

The following two parameters are supported to be passed in.

-   Canvas. This will be added to the canvas under the root node
-   Any element that has been added to the canvas

It is worth noting that, like animation, it needs to be done [after canvas initialization is complete](/en/api/canvas#ready).

#### play

Start the animation.

```js
animation.play();
```

#### pause

Pause the animation.

```js
animation.pause();
```

#### togglePause

Pause if it is playing and vice versa.

```js
animation.togglePause();
```

#### stop

Stop the animation.

```js
animation.stop();
```

#### goTo

Jump to the specified moment or frame.

The parameters are as follows.

-   `value` specifies the millisecond moment or frame
-   `isFrame` indicates whether `value` is passed in as a frame, the default value is `false`.

```js
// Jump to the 2000ms moment of the timeline
animation.goTo(2000);

// Jump to frame 10
animation.goTo(10, true);
```

#### getDuration

Returns the duration, in milliseconds or frames.

The parameters are as follows.

-   `inFrames` if or not in frames, default is `false`

```js
animation.getDuration(); // 2000
animation.getDuration(true); // 120
```

#### setSpeed

Controls the playback speed, default is `1`. Greater than `1` means speed up, less than `1` means speed down.

```js
// 2x
animation.setSpeed(2);
```

#### setDirection

`1` means forward, `-1` means reverse. Default forward play.

```js
animation.setSpeed(1);
animation.setSpeed(-1);
```

#### destroy

Destroys all internal objects and, of course, terminates the animation at the same time.

```js
animation.destroy();
```

#### size

Return to Lottie file size.

```js
animation.size(); // { width: 1080, height: 260 }
```

#### version

Returns the version of [Bodymovin](https://aescripts.com/bodymovin/) contained in the Lottie file

```js
animation.version();
```

## Features

### Shapes

支持 [Shape Layer](https://lottiefiles.github.io/lottie-docs/layers/#shape-layer) 中定义的以下[元素](https://lottiefiles.github.io/lottie-docs/shapes/#shape-element)：

-   [x] Rectangle
-   [x] Ellipse
-   [x] Path
-   [x] Group
-   [ ] PolyStar

#### Rectangle

It will be converted to [Rect](/en/api/basic/rect) for rendering.

https://lottiefiles.github.io/lottie-docs/shapes/#rectangle

#### Ellipse

It will be converted to [Ellipse](/en/api/basic/ellipse) for rendering.

https://lottiefiles.github.io/lottie-docs/shapes/#ellipse

#### Path

It will be converted to [Path](/en/api/basic/path) for rendering.

https://lottiefiles.github.io/lottie-docs/shapes/#path

#### [WIP] PolyStar

https://lottiefiles.github.io/lottie-docs/shapes/#polystar

#### Group

It will be converted to [Group](/en/api/basic/group) for rendering.

https://lottiefiles.github.io/lottie-docs/shapes/#group

#### Transform

https://lottiefiles.github.io/lottie-docs/concepts/#transform

The following features are supported.

-   [anchor]() corresponds to the `a` field
-   [translation]() corresponds to the `p` field
-   [scaling]() for the `s` field
-   [rotation]() corresponds to the `r` field

The following features are not supported at this time.

-   [skew]() corresponds to the `sk` field
-   [skewAxis]() corresponds to the `sa` field

In this [example](/en/examples/ecosystem#lottie-player-transform), the dark blue is the base rectangle, and we use the red dot as the [transformOrigin]() to rotate it by a certain angle to get the light blue rectangle.

<img src="https://gw.alipayobjects.com/mdn/rms_dfc253/afts/img/A*Nlj4SYJXKccAAAAAAAAAAAAAARQnAQ" alt="transform" width="400">

#### [WIP] Offset Path

https://lottiefiles.github.io/lottie-docs/concepts/#animated-position

#### Style

The following style attributes are supported.

-   [x] Fill
-   [x] Stroke
-   [x] Gradients

##### Fill

https://lottiefiles.github.io/lottie-docs/shapes/#fill

Fill color, while supporting the following features.

-   [fillOpacity](/en/api/basic/display-object#fillopacity) 对应 `o` 字段
-   [fillRule](/en/api/basic/display-object#fillrule) 对应 `r` 字段

##### Stroke

https://lottiefiles.github.io/lottie-docs/shapes/#stroke

Stroke color, while supporting the following features.

-   [strokeOpacity](/en/api/basic/display-object#strokeopacity) 对应 `o` 字段
-   [strokeWidth](/en/api/basic/display-object#strokewidth) 对应 `w` 字段
-   [lineCap](/en/api/basic/display-object#linecap) 对应 `lc` 字段
-   [lineJoin](/en/api/basic/display-object#linejoin) 对应 `lj` 字段
-   [miterLimit](/en/api/basic/display-object#miterlimit) 对应 `ml` 字段
-   [lineDash](/en/api/basic/display-object#linedash) 对应 `d` 字段

##### Gradients

https://lottiefiles.github.io/lottie-docs/shapes/#gradients

Support [linear](/en/api/css/css-properties-values-api#linear-gradient) and [radial](/en/api/css/css-properties-values-api#radial-gradient) gradients.

The following features are not supported at this time.

-   Apply animations to gradients
-   Highlight length & angle (`h` and `a` fields)

#### Modifiers

##### [WIP] Repeater

##### [WIP] Trim Path

### Layers

https://lottiefiles.github.io/lottie-docs/layers/#layers

#### Solid Color

https://lottiefiles.github.io/lottie-docs/layers/#solid-color-layer

#### Image

https://lottiefiles.github.io/lottie-docs/layers/#image-layer https://lottiefiles.github.io/lottie-docs/assets/#image

#### [WIP] Text

https://lottiefiles.github.io/lottie-docs/layers/#text-layer https://lottiefiles.github.io/lottie-docs/text/

#### Precomposition

https://lottiefiles.github.io/lottie-docs/layers/#precomposition-layer https://lottiefiles.github.io/lottie-docs/assets/#precomposition

#### [WIP] Merge Paths

https://lottie-animation-community.github.io/docs/specs/layers/shapes/#merge-paths-property

#### Clipping Mask

Internally, it will be converted to [clipPath](/en/api/basic/display-object#clippath) to be applied to the target element and support path animation on it.

Caution.

-   Limited by the SVG implementation. Currently only a single Clipping Mask is supported, and only the first one will take effect if multiple are declared
-   [Mask Mode Type](https://lottie-animation-community.github.io/docs/specs/properties/mask-mode-types/) only supports the `Add` operator

https://lottie-animation-community.github.io/docs/specs/layers/common/#clipping-masks

### Layer Effects

Post-processing effects for Layer are not supported at this time.

https://lottiefiles.github.io/lottie-docs/effects/#layer-effects

### Expressions

Expressions are not supported at this time.

https://lottiefiles.github.io/lottie-docs/expressions/
