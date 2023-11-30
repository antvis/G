---
title: Web Animations API
order: -4
redirect_from:
  - /en/api/animation
---

Referring to the [Web Animations API](https://developer.mozilla.org/zh-CN/docs/Web/API/Web_Animations_API), we add animation capabilities to each DisplayObject.

Currently we support Keyframe based animations, where the user needs to define a series of keyframes, each of which can contain parameters such as transformation attributes, frame offsets, easing functions, etc. G internally interpolates the values of each attribute at the current time and applies them to the target graphics (as shown below). In addition, the transformation of some special attributes will bring special animation effects, for example:

- Using `offsetDistance` in [path animation](/en/api/animation/waapi#path-animation)
- Using `lineDashOffset` in [marching ant animation](/en/api/animation/waapi#marching-ant-animation)
- Using `lineDash` in [stroke animation](/en/api/animation/waapi#stroke-animation)
- Using `path` in [morphing animation](/en/api/animation/waapi#morping)

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*kF2uS4gpDh0AAAAAAAAAAAAAARQnAQ)

For transition effects, we currently support:

- Tween, such as `linear`, `cubic-bezier` and custom easing function.
- Spring, an effect based on real physical springs.

Let's start with a Keyframe animation, implementing a [ScaleIn](https://animista.net/play/entrances/scale-in) animation [example](/en/examples/animation#lifecycle).

```js
const scaleInCenter = circle.animate(
  [
    {
      transform: 'scale(0)',
    },
    {
      transform: 'scale(1)',
    },
  ],
  {
    duration: 500,
    easing: 'cubic-bezier(0.250, 0.460, 0.450, 0.940)',
    fill: 'both',
  },
);
```

Developers familiar with CSS Transform/Animation will be familiar with it. Its CSS Animation counterpart is:

```css
.scale-in-center {
  animation: scale-in-center 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
}
@keyframes scale-in-center {
  0% {
    transform: scale(0);
  }
  100% {
    transform: scale(1);
  }
}
```

## Animation

An animation object usually consists of two parts: a target and a KeyframeEffect animation. The former is specified when it is created with `object.animate()`, and the latter consists of two parts: a set of Keyframe and EffectTiming.

https://developer.mozilla.org/en-US/docs/Web/API/Animation

### Creation

We can create an Animation object with `displayObject.animate()`.

```js
const animation = circle.animate(keyframes, options);
```

Note that the target graphic to which the animation effect is applied must first be mounted to the canvas:

```js
// wrong
const animation = circle.animate(keyframes, options);
canvas.appendChild(circle);

// correct
canvas.appendChild(circle);
const animation = circle.animate(keyframes, options);
```

#### keyframes

[KeyframeFormats](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API/Keyframe_Formats)

The most common is to declare the properties to be transformed in the keyframes, as in the following example to transform the transparency and fill color of the circle.

```js
circle.animate(
  [
    {
      // from
      opacity: 0,
      fill: '#fff',
    },
    {
      // to
      opacity: 1,
      fill: '#000',
    },
  ],
  2000,
);
```

The elements in the keyframes array are [Keyframe](/en/api/animation/waapi#keyframe).

#### options

`options` supports two types.

- [EffectTiming](/en/api/animation/waapi#effecttiming)
- `number` is equivalent to `{ duration }`

Therefore the following two ways of writing are equivalent.

```js
circle.animate(keyframes, {
  duration: 100,
});
circle.animate(keyframes, 100);
```

### Properties

#### effect

https://developer.mozilla.org/en-US/docs/Web/API/Animation/effect

Return [KeyframeEffect](/en/api/animation/waapi#keyframeeffect) object. The animation effect can be adjusted later at runtime, e.g. by modifying the easing function, etc.

```js
const effect = animation.effect;

effect.getTiming().ease = 'linear';
```

#### startTime

Get the start time of the animation.

https://developer.mozilla.org/en-US/docs/Web/API/Animation/startTime

#### currentTime

Get or set the current time of the animation relative to the timeline.

https://developer.mozilla.org/en-US/docs/Web/API/Animation/currentTime

```js
const currentTime = animation.currentTime;

// Set a new time that will affect the animation effect
animation.currentTime = newTime;
```

In this [example](/en/examples/animation#offset-path), you can change the properties at any time. Since the single execution time of this animation is 3500ms, and the jogging function is linear, the small circle will return to the position corresponding to the path, and then continue to move.

#### playState

Returns the running state of the animation. The state is changed when some manual control methods (e.g. `pause()`) are called.

https://developer.mozilla.org/en-US/docs/Web/API/Animation/playState

- `'idle'` Animation is in an unready state.
- `'running'` Animation is running.
- `'paused'` Animation is paused.
- `'finished'` Animation is finished.

#### pending

The animation is waiting for some asynchronous task to complete, such as pausing a running animation.

https://developer.mozilla.org/en-US/docs/Web/API/Animation/pending

#### ready

Returns a Promise that resolves when the animation is ready to start. https://developer.mozilla.org/en-US/docs/Web/API/Animation/ready

```js
animation.ready.then(() => {
  animation.playState; // running
  canvas.timeline.currentTime;
});
```

#### finished

Returns a Promise that resolves at the end of the animation.

https://developer.mozilla.org/en-US/docs/Web/API/Animation/finished

For example, if we want the graph to remove itself after all animations have finished.

```js
Promise.all(circle.getAnimations().map((animation) => animation.finished)).then(
  () => {
    return circle.remove();
  },
);
```

Or to complete a set of sequential animations, such as having a circle move first to the right and then down, [example](/en/examples/animation#sequence).

```js
(async () => {
  // 向右移动 100px
  const moveRight = circle.animate(
    [
      {
        transform: 'translate(0)',
      },
      {
        transform: 'translate(100px)',
      },
    ],
    {
      duration: 1000,
      easing: 'cubic-bezier(0.250, 0.460, 0.450, 0.940)',
      fill: 'both',
    },
  );
  // 等待动画完成
  await moveRight.finished;

  // 完成后向下移动
  const moveDown = circle
    .animate
    //... 省略
    ();
})();
```

#### onfinish

Set the callback function when the animation is finished, similar to [animationend](https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLElement/animationend_event) event. [example](/en/examples/animation#lifecycle)

https://developer.mozilla.org/en-US/docs/Web/API/Animation/onfinish

```js
animation.onfinish = function (e) {
  e.target; // animation
  e.target.playState; // 'finished'
};
```

The event object in the callback function is [AnimationPlaybackEvent](https://developer.mozilla.org/en-US/docs/Web/API/AnimationPlaybackEvent), which is special in that it cannot be bubbled and cannot call some methods on the object some of the methods on the object, the useful properties are as follows.

- `target` Returns the animation object.
- `currentTime`
- `timelineTime`

#### onframe

Called for animations that are running, at the end of each frame, when the properties have finished interpolating. It will not be called if the animation is paused, not started or finished. [example](/en/examples/animation#onframe)

```js
animation.onframe = function (e) {
  e.target; // animation
  e.target.playState; // 'running'
};
```

#### playbackRate

The rate of the animation playback, the default value is 1.

https://developer.mozilla.org/en-US/docs/Web/API/Animation/playbackRate

For example, if we want to manually control the running direction of an animation, or reduce the playback rate.

```js
animation.playbackRate = -1;
animation.play();

// reduce the playback rate
animation.playbackRate *= 0.9;

// accelerate the playback rate
animation.playbackRate *= 1.1;
```

### Functions

The following methods allow you to manually control the running state of the animation, such as pause, restart, end, etc. [example](/en/examples/animation#lifecycle)

#### play()

Start or resume the animation. When the animation is in the `finished` state, call it to restart the animation.

```js
animation.play();
animation.playState; // 'running'
```

#### pause()

https://developer.mozilla.org/en-US/docs/Web/API/Animation/pause

```js
animation.pause();
animation.playState; // 'paused'
```

#### finish()

Adjust the running time of the animation to the end (related to the running direction).

https://developer.mozilla.org/en-US/docs/Web/API/Animation/finish

```js
animation.finish();
animation.playState; // 'finished'
```

#### cancel()

Clear the animation and set `startTime` and `currentTime` to `null`.

https://developer.mozilla.org/en-US/docs/Web/API/Animation/cancel

#### reverse()

Flip the animation running direction, the effect is the same as setting playbackRate to -1.

https://developer.mozilla.org/en-US/docs/Web/API/Animation/reverse

#### updatePlaybackRate()

Controls the animation run rate, the default rate is 1, [example](/en/examples/animation#easing).

```js
animation.updatePlaybackRate(2); // accelerate the playback rate
animation.updatePlaybackRate(0.5); // reduce the playback rate
animation.updatePlaybackRate(-1); // reverse the playback rate
```

https://developer.mozilla.org/en-US/docs/Web/API/Animation/updatePlaybackRate

## KeyframeEffect

Animation effect, you can get the timing object corresponding to this effect by `getTiming()`. It consists of two parts: a set of Keyframe and [EffectTiming](/en/api/animation/waapi#effecttiming).

https://developer.mozilla.org/en-US/docs/Web/API/Animation/effect

### target

Returns the display object currently in animation.

https://developer.mozilla.org/en-US/docs/Web/API/KeyframeEffect/target

```js
const animation = circle.animate({
  // ...
});

animation.effect.target; // circle
```

### getTiming()

Return [EffectTiming](/en/api/animation/waapi#effecttiming) object.

https://developer.mozilla.org/en-US/docs/Web/API/AnimationEffect/getTiming

```js
const timing = animation.effect.getTiming();
timing.ease = 'linear';
```

### getComputedTiming()

Returns a [ComputedEffectTiming](/en/api/animation/waapi#effecttiming) object, which differs from [EffectTiming](/en/api/animation/waapi#effecttiming) in that the former takes some literal quantities of the latter and returns.

- `duration` Returns 0 when `duration` is 'auto'.
- `fill` Returns 'none' if 'auto'.

https://developer.mozilla.org/en-US/docs/Web/API/AnimationEffect/getComputedTiming

### updateTiming()

Update the [EffectTiming](/en/api/animation/waapi#effecttiming) attribute, e.g. the following two writeups are equivalent.

```js
const timing = animation.effect.getTiming();
timing.ease = 'linear';

animation.updateTiming({ ease: 'linear' });
```

https://developer.mozilla.org/en-US/docs/Web/API/AnimationEffect/updateTiming

## Keyframe

In the opening example, we defined two Keyframes.

```js
[
  {
    transform: 'scale(0)', // Start keyframe
  },
  {
    transform: 'scale(1)', // End keyframe
  }
],
```

### Properties that support transformations

The following attributes are currently supported for transformations, [example](/en/examples/animation#multiple-attributes).

| name           | type               | range of values            | remarks                                                                                 |
| -------------- | ------------------ | -------------------------- | --------------------------------------------------------------------------------------- |
| transform      | `string`           | `scale(1, 2)` `scaleY(1)`  | 和 [CSS Transform](https://developer.mozilla.org/zh-CN/docs/Web/CSS/transform) 保持一致 |
| opacity        | `number`           | `[0-1]`                    |                                                                                         |
| strokeOpacity  | `number`           | `[0-1]`                    |                                                                                         |
| fill           | `string`           | e.g. `red` `#fff`          |                                                                                         |
| stroke         | `string`           | e.g. `red` `#fff`          |                                                                                         |
| lineWidth      | `number`           | e.g. `1` `10`              |                                                                                         |
| r              | `number`           | e.g. `10` `20`             | radius of Circle                                                                        |
| rx/ry          | `number`           | e.g. `10` `20`             | radius of Ellipse                                                                       |
| width          | `number`           | e.g. `10` `20`             | width of Rect/Image                                                                     |
| height         | `number`           | e.g. `10` `20`             | height of Rect/Image                                                                    |
| x1/y1/x2/y2    | `number`           | e.g. `10` `20`             | points of Line                                                                          |
| offsetDistance | `number`           | `[0-1]`                    | 路径偏移，在[路径动画](/en/api/animation/waapi#路径动画)中使用                          |
| lineDash       | `[number, number]` | e.g. `[0, 100]`            | 实线和间隔的长度，在[笔迹动画](/en/api/animation/waapi#笔迹动画)中使用                  |
| lineDashOffset | `number`           | e.g. `-20` `0` `20`        | 设置虚线的偏移量，在[蚂蚁线效果](/en/api/animation/waapi#蚂蚁线)中使用                  |
| path           | `string`           | e.g. `M 100,100 L 200,200` | Path 的定义，在[形变动画](/en/api/animation/waapi#形变动画)中使用                       |

For custom properties, you can [register them in the style system](/en/api/css/css-properties-values-api#custom-properties). In this [example](/en/examples/style#custom-property), we register several different types of custom properties to allow them to support interpolation.

where transform is consistent with [CSS Transform](https://developer.mozilla.org/zh-CN/docs/Web/CSS/transform) and supports the following property values:

- Scaling, unitless
  - scale(x, y)
  - scaleX(x)
  - scaleY(x)
  - scaleZ(z)
  - scale3d(x, y, z)
- Panning, 0 can be used without units, unitless is treated as px, the percentage is relative to the current graph enclosing the box
  - translate(0, 0) translate(0, 30px) translate(100%, 100%)
  - translateX(0)
  - translateY(0)
  - translateZ(0)
  - translate3d(0, 0, 0)
- Rotation, support for deg, rad and turn
  - rotate(0.5turn) rotate(30deg) rotate(1rad)
- Stretch, support for deg, rad and turn
  - skew(ax, ay)
  - skewX(a)
  - skewY(a)
- matrix
  - matrix(a,b,c,d,tx,ty) Available from [CSS matrix definition](https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function/matrix)
  - matrix3d() Complete matrix definition with 16 elements
- none

⚠️ The following values are not supported at this time.

- `calc()` e.g. `translate(calc(100% + 10px))`
- `perspective`

### offset

Offset of the keyframe in the range `[0-1]`.

```js
[{ opacity: 1 }, { opacity: 0.1, offset: 0.7 }, { opacity: 0 }];
```

When not specified, the offset is automatically calculated by the adjacent keyframes, for example, the following 3 keyframes are not specified, the default values are 0 and 1 at one end, and 0.5 is calculated for the middle frame.

```js
[
  { transform: 'scale(0)' }, // offset 0
  { transform: 'scale(2)' }, // offset 0.5
  { transform: 'scale(1)' }, // offset 1
],
```

### easing

The easing function between adjacent keyframes can be specified by `easing`.

```js
circle.animate(
  [
    { opacity: 1, easing: 'ease-out' },
    { opacity: 0.1, easing: 'ease-in' },
    { opacity: 0 },
  ],
  2000,
);
```

The built-in easing function is described in [easing](/en/api/animation/waapi#easing-1)

### Common animation effects

Some common animation effects, such as fadeIn, etc., can be found in https://github.com/wellyshen/use-web-animations/tree/master/src/animations

```js
export default {
  keyframes: [{ opacity: 0 }, { opacity: 1 }],
  animationOptions: { duration: 1000, fill: 'both' },
};
```

[Example](/en/examples/animation#animations)

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*WRp0SbVfgjUAAAAAAAAAAAAAARQnAQ)

## EffectTiming

https://developer.mozilla.org/en-US/docs/Web/API/EffectTiming

```js
const timing = animation.effect.getTiming();
```

### delay

The delay, in milliseconds, before starting the animation. The default value is 0, so the animation will start immediately.

https://developer.mozilla.org/en-US/docs/Web/API/EffectTiming/delay

**type**： `number`

**default value**：0

**required**：`false`

### direction

The direction in which the animation runs on the timeline also affects the behavior at the end of each iteration. With this property we can achieve the effect of reciprocal motion.

https://developer.mozilla.org/en-US/docs/Web/API/EffectTiming/direction

**type**： `string`

**default value**：`normal`

**required**：`false`

The following values can be taken.

- `'normal'` In each iteration, the animation runs from the start frame to the end frame.
- `'reverse'` In each iteration, the animation runs from the end frame to the start frame.
- `'alternate'` Change the direction at the end of each iteration, e.g. first iteration from front to back, second iteration from back to front.
- `'alternate-reverse'` Change the direction at the end of each iteration, e.g. back to front for the first iteration and front to back for the second iteration.

### duration

The duration of the animation, in milliseconds, default is `auto`, same effect as 0.

https://developer.mozilla.org/en-US/docs/Web/API/EffectTiming/duration

**type**： `number | string`

**default**：`auto`

**required**：`false`

**description** Cannot be a negative number

### easing

The easing function, which defaults to `linear`, we also have a series of common functions built in. [example](/en/examples/animation#easing)

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*9y3_TIoOUPMAAAAAAAAAAAAAARQnAQ" width="400" alt="easing">

https://developer.mozilla.org/en-US/docs/Web/API/EffectTiming/easing

**type**： `string`

**default value**：`linear`

**required**：`false`

支持以下内置缓动函数，来自：https://easings.net/

| constant   | accelerate         | decelerate     | accelerate-decelerate | decelerate-accelerate |
| :--------- | :----------------- | :------------- | :-------------------- | :-------------------- |
| linear     | ease-in / in       | ease-out / out | ease-in-out / in-out  | ease-out-in / out-in  |
| ease       | in-sine            | out-sine       | in-out-sine           | out-in-sine           |
| steps      | in-quad            | out-quad       | in-out-quad           | out-in-quad           |
| step-start | in-cubic           | out-cubic      | in-out-cubic          | out-in-cubic          |
| step-end   | in-quart           | out-quart      | in-out-quart          | out-in-quart          |
|            | in-quint           | out-quint      | in-out-quint          | out-in-quint          |
|            | in-expo            | out-expo       | in-out-expo           | out-in-expo           |
|            | in-circ            | out-circ       | in-out-circ           | out-in-circ           |
|            | in-back            | out-back       | in-out-back           | out-in-back           |
|            | in-bounce          | out-bounce     | in-out-bounce         | out-in-bounce         |
|            | in-elastic         | out-elastic    | in-out-elastic        | out-in-elastic        |
|            | spring / spring-in | spring-out     | spring-in-out         | spring-out-in         |

In addition, you can also customize functions like cubic Bezier curves with `cubic-bezier(<number>, <number>, <number>, <number>)`. Some of the above built-in functions are also defined by it, for example `ease-in-sine = cubic-bezier(0.47, 0, 0.745, 0.715)`.

When the above built-in easing functions cannot be satisfied, you can manually pass in a custom function via `easingFunction`.

You can also register custom easing function via `EasingFunctions` like this:

````ts
import { EasingFunctions } from '@antv/g';

EasingFunctions['my-easing'] = (t: number) => t;

circle.animate([{ opacity: 0 }, { opacity: 1 }], {
  duration: 500,
  easing: 'my-easing',
});

### endDelay

The delay before the end of the animation, in milliseconds, default value is 0, so the animation will end as soon as it finishes running.

https://developer.mozilla.org/en-US/docs/Web/API/EffectTiming/endDelay

**type**： `number`

**default value**：0

**required**：`false`

We can also set a negative number to bring the animation to an early end.

```js
const animation = circle.animate(
    [{ transform: 'scale(1)' }, { transform: 'scale(2)' }],
    {
        duration: 2000,
        endDelay: -1000, // 动画执行到一半会立刻结束
        easing: 'cubic-bezier(0.250, 0.460, 0.450, 0.940)',
    },
);
````

### fill

This property specifies how the graph will be displayed when the animation is in a non-running state (e.g. before the animation starts, after it ends). The following values are supported.

- `'auto/none'` default value, This means that the animation will not affect the presentation of the graphics before the first frame starts and after the last frame ends. For example, after the animation finishes the graphics will return to their pre-animation state, and if a delay is set the effect of the first frame will not be applied during the delay.
- `'forwards'` Stop after the animation is completed and does not return to the initial state.
- `'backwards'` Apply the first frame effect before the animation starts.
- `'both'` For the combination of `'forwards'` and `'backwards'`.

https://developer.mozilla.org/en-US/docs/Web/API/EffectTiming/fill

For example, we want the graph to stop at the end state after the scaling animation finishes.

```js
const animation = circle.animate(
  [
    {
      transform: 'scale(1)',
      fill: '#1890FF',
      stroke: '#F04864',
      opacity: 1,
    },
    { transform: 'scale(2)', fill: 'red', stroke: '#1890FF', opacity: 0.8 },
  ],
  {
    duration: 1500,
    easing: 'cubic-bezier(0.250, 0.460, 0.450, 0.940)',
    fill: 'both',
  },
);
```

### iterations

The number of loops, default value is 1, or we can take a decimal number greater than 0. When we want the animation to run forever, we can take `Infinity`.

https://developer.mozilla.org/en-US/docs/Web/API/EffectTiming/iterations

**type**： `number`

**default value**：1

**required**：`false`

### iterationStart

Where to start the animation, e.g. the animation always starts from 0, set to 0.5 means the animation will start from the middle.

https://developer.mozilla.org/en-US/docs/Web/API/EffectTiming/iterationStart

**type**： `number`

**default value**：0

**required**：`false`

## ComputedEffectTiming

Inherits all the properties of [EffectTiming](/en/api/animation/waapi#effecttiming) and includes some read-only, computed extra properties.

```js
const computedTiming = animation.effect.getComputedTiming();
```

### endTime

The estimated end time of the animation, which needs to take into account the delay before and after. Calculated as: [delay](/en/api/animation/waapi#delay) + [activeDuration](/en/api/animation/waapi#activeduration) + [endDelay](/en/api/ animation#enddelay).

https://developer.mozilla.org/en-US/docs/Web/API/AnimationEffect/getComputedTiming#return_value

### activeDuration

The estimated duration of the animation effect run, in milliseconds. It is calculated as [duration](/en/api/animation/waapi#duration) \* [iterations](/en/api/animation/waapi#iterations)

https://developer.mozilla.org/en-US/docs/Web/API/AnimationEffect/getComputedTiming#return_value

### localTime

Same as [currentTime](/en/api/animation/waapi#currenttime), in milliseconds.

### progress

Returns the progress within the current iteration, in the range `[0-1]`. Returns null when the animation is not running.

In this [example](/en/examples/animation#lifecycle), we print the progress value in the [onframe](/en/api/animation/waapi#onframe) callback function at the end of each frame.

```js
animation.onframe = (e) => {
  console.log(e.target.effect.getComputedTiming().progress);
};
```

### currentIteration

Returns the number of times the animation is currently looped, starting from 0. Returns null when the animation is not running.

## Other Transition

The familiar easing function (aka Tween) is an animation effect based on the current runtime, but even if you can customize the jogging function, there are still some animation effects that cannot be implemented. For example, the now widely used Spring effect can be seen in the [React Spring Visualizer](https://react-spring-visualizer.com/) which does not rely solely on the current runtime, but is an effect based on physical spring properties (self-weight, friction, etc.).

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*6MaCQbloUQQAAAAAAAAAAAAAARQnAQ" width="400" alt="spring">

Therefore, in some popular animation libraries, there is often more than one type of transition, such as [Framer Motion](https://www.framer.com/docs/transition/#spring), which supports Spring.

```jsx
<motion.div animate={{ rotate: 180 }} transition={{ type: 'spring' }} />
```

There are also libraries like https://react-spring.io/.

<img src="https://i.imgur.com/tg1mN1F.gif" width="400" alt="react spring">

https://blog.maximeheckel.com/posts/the-physics-behind-spring-animations

So how do you implement this non-jogging effect using CSS Animation or WAAPI? This issue has been discussed in the W3C for a long time: https://github.com/w3c/csswg-drafts/issues/229. We currently have the spring family of transform effects built in, but do not provide configuration of the spring parameters yet [example](/en/examples/animation## easing).

```js
const animation = image.animate(
  [{ transform: 'rotate(0)' }, { transform: 'rotate(360deg)' }],
  {
    duration: 1500,
    iterations: Infinity,
    easing: 'spring',
  },
);
```

## Path Animation

Moving graphics along a path is a common requirement, and is accomplished in CSS via [MotionPath](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Motion_Path).

```css
#motion-demo {
  animation: move 3000ms infinite alternate ease-in-out;
  offset-path: path('M20,20 C20,100 200,0 200,100');
}
@keyframes move {
  0% {
    offset-distance: 0%;
  }
  100% {
    offset-distance: 100%;
  }
}
```

First create a motion path by offsetPath, currently support [Line](/en/api/basic/line) [Path](/en/api/basic/path) and [Polyline](/en/api/basic/polyline). The effect is then achieved by transforming the offsetDistance (in the range `[0-1]`) to.

```js
const circle = new Circle({
  style: {
    offsetPath: new Line({
      // Create motion tracks
      style: {
        // There is no need to set other drawing properties that are not related to trajectories
        x1: 100,
        y1: 100,
        x2: 300,
        y2: 100,
      },
    }),
    r: 10,
  },
});

circle.animate([{ offsetDistance: 0 }, { offsetDistance: 1 }], {
  duration: 3000,
  easing: 'ease-in-out',
  iterations: Infinity,
});
```

[Example](/en/examples/animation#offset-path).

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*nk1YSrbkQPMAAAAAAAAAAAAAARQnAQ" width="400" alt="path animation">

## Marching Ant Animation

The common lasso tool in PS is an "Marching Ant" effect.

The [lineDashOffset](/en/api/basic/display-object#linedashoffset) property is used to set the offset of the dashed line, which can be transformed to achieve the effect.

```js
const circle = new Circle({
  style: {
    lineDash: [10, 10],
  },
});
circle.animate([{ lineDashOffset: -20 }, { lineDashOffset: 0 }], {
  duration: 500,
  iterations: Infinity,
});
```

[Example](/en/examples/animation#marching-ants).

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*TTyTTISXlKAAAAAAAAAAAAAAARQnAQ" width="400" alt="marching ant animation">

## Stroke Animation

A common animation effect is to show the stroke from nothing to something. The [lineDash](/api/basic/display-object#linedash) attribute specifies the length of the solid line and interval of the stroke, and the initial state of the stroke, `nothing', can be represented by `[0, length]`, while the full state can be represented by `[length, 0]`. The length of the stroke can be obtained by graphical methods, such as Path's [getTotalLength](/en/api/basic/path#gettotallength-number) method.

```js
const length = path.getTotalLength();
path.animate([{ lineDash: [0, length] }, { lineDash: [length, 0] }], {
  duration: 3500,
  easing: 'cubic-bezier(0.250, 0.460, 0.450, 0.940)',
  iterations: Infinity,
  direction: 'alternate',
});
```

[Example](/en/examples/animation#line-dash).

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*8NOsQoWLm2IAAAAAAAAAAAAAARQnAQ" width="400" alt="stroke animation">

## Morping

Examples of morping animation can be found in many SVG-related libraries, such as

- [Paper.js](http://paperjs.org/)
- [Kute.js](https://thednp.github.io/kute.js/) provides [Morph](https://thednp.github.io/kute.js/svgMorph.html) and [CubicMorph](https://thednp.github.io/kute.js/svgCubicMorph.html).
- [Snap.svg](http://snapsvg.io/)
- GreenSocks provides [MorphSVGPlugin](https://greensock.com/docs/v2/Plugins/MorphSVGPlugin)

The above partial library will require that the path definitions before and after the transformation contain the same segments, otherwise interpolation is not possible.

G refers to [CubicMorph](https://thednp.github.io/kute.js/svgCubicMorph.html) in Kute.js, and first transforms each part of the Path definition into a third-order Bezier curve, and then uses the easy segmentation property of the third-order Bezier curve to normalize the paths before and after the transformation to the same number of segments. The paths are normalized to the same number of segments, and finally the control points in each segment are interpolated to achieve the animation effect.

```js
const path1 = 'M 0,40 ...';
const path2 = [
  ['M', 100, 100],
  ['L', 200, 200],
];

path.animate([{ path: path1 }, { path: path2 }], {
  duration: 2500,
  easing: 'cubic-bezier(0.250, 0.460, 0.450, 0.940)',
  iterations: Infinity,
  direction: 'alternate',
});
```

[Example](/en/examples/animation#morph).

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*qCHaTJUg_aEAAAAAAAAAAAAAARQnAQ" width="400" alt="morphing">

### Basic graphic transformation

Since only the path attribute can be transformed, for other base shapes such as Circle, Rect, Line, we provide the tool method [convertToPath](/en/api/builtin-objects/utils#converttopath) for conversion.

```js
import { Circle, convertToPath } from '@antv/g';

const circle = new Circle({
  style: {
    cx: 50,
    cy: 50,
    r: 50,
  },
});
const circlePath = convertToPath(circle); // get path definition

path.animate([{ path: originalPath }, { path: circlePath }], {
  duration: 2500,
});
```

The base graphics that currently support conversion paths are: [Circle](/en/api/basic/circle) [Ellipse](/en/api/basic/ellipse) [Rect](/en/api/basic/rect) [Line](/en/api/basic/line) [Polyline](/en/api/basic/polyline) [Polygon](/en/api/basic/polygon) [Path](/en/api/basic/path).

[Example](/en/examples/animation#morph)

Note that the transformation of these base shapes affects the final generated path string. For example, the original path of the following pentagram is too large and can be scaled and animated.

```js
const starPath = new Path({
  style: {
    path: 'M301.113,12.011l99.25,179.996l201.864,38.778L461.706,380.808l25.508,203.958l-186.101-87.287L115.01,584.766l25.507-203.958L0,230.785l201.86-38.778L301.113,12.011',
  },
});
starPath.scale(0.2); // do scaling first
const pathString = convertToPath(starPath); // then do conversion
```

### Caveats

We do not support more than two sets of keyframes for the time being in the shape change animation, e.g.

```js
path.animate(
  [
    // wrong. use 3 keyframes
    { path: path1 },
    { path: path2 },
    { path: path3 },
  ],
  {
    duration: 2500,
  },
);
```

For continuous changes between multiple paths, it can be split into multiple Animations, e.g.

```js
const animation1 = path.animate([{ path: path1 }, { path: path2 }], {
  duration: 1250,
  fill: 'both',
});

animation1.finished.then(() => {
  path.animate([{ path: path2 }, { path: path3 }], {
    duration: 1250,
    fill: 'both',
  });
});
```

## [WIP] High Performance Animation

Support for WebGL Transform Feedback-based GPU animations in `g-webgl`.
