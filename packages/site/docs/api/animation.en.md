---
title: 动画
order: -4
---

参考 [Web Animation API](https://developer.mozilla.org/zh-CN/docs/Web/API/Web_Animations_API)，我们为每一个 DisplayObject 添加了动画能力。

目前我们支持以下种类的动画：
* Keyframe。定义一系列关键帧，通过插值得到每一帧的属性值。
* 路径动画。定义一条路径，让目标图形沿路径移动。

未来可能还会提供 Morph 等其他种类的动画。

在 Transition 效果上，我们支持：
* Tween 缓动效果。内置例如 `linear` `cubic-bezier` 等，也支持自定义。
* Spring，一种基于真实物理弹簧的效果。

我们从一个 Keyframe 动画入手，实现一个 [ScaleIn](https://animista.net/play/entrances/scale-in) 的动画 [示例](/zh/examples/animation#lifecycle)：
```js
const scaleInCenter = circle.animate(
  [
    {
      transform: 'scale(0)', // 起始关键帧
    },
    {
      transform: 'scale(1)', // 结束关键帧
    }
  ],
  {
    duration: 500, // 持续时间
    easing: 'cubic-bezier(0.250, 0.460, 0.450, 0.940)', // 缓动函数
    fill: 'both', // 动画处于非运行状态时，该图形的展示效果
  },
);
```

熟悉 CSS Transform/Animation 的开发者一定不会陌生。其对应的 CSS Animation 为：
```css
.scale-in-center {
  animation: scale-in-center 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
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

# Animation

一个动画对象通常由两部分组成：target 目标图形和 KeyframeEffect 动画效果。前者在通过 `object.animate()` 创建时已经指定，后者又由两部分组成：一组 Keyframe 和 EffectTiming。

https://developer.mozilla.org/en-US/docs/Web/API/Animation

## 创建

通过 `DisplayObject.animate()` 可以创建一个 Animation 对象：
```js
const animation = circle.animate(keyframes, options);
```

需要注意，应用动画效果的目标图形必须先挂载到画布上：
```js
// wrong
const animation = circle.animate(keyframes, options);
canvas.appendChild(circle);

// correct
canvas.appendChild(circle);
const animation = circle.animate(keyframes, options);
```

### keyframes

支持 [KeyframeFormats](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API/Keyframe_Formats)

最常见的是在 keyframes 中声明需要变换的属性，下面的例子让圆的透明度和填充色发生变换：
```js
circle.animate([
  { // from
    opacity: 0,
    fill: "#fff"
  },
  { // to
    opacity: 1,
    fill: "#000"
  }
], 2000);
```

keyframes 数组中的元素为 [Keyframe](/zh/docs/api/animation#keyframe)。

### options

`options` 支持两种类型：
* [EffectTiming](/zh/docs/api/animation#effecttiming) 配置
* `number` 等价于 `{ duration }`

因此以下两种写法等价：
```js
circle.animate(keyframes, {
  duration: 100,
});
circle.animate(keyframes, 100);
```

## 属性

### effect

https://developer.mozilla.org/en-US/docs/Web/API/Animation/effect

返回 [KeyframeEffect](/zh/docs/api/animation#keyframeeffect) 对象。后续可以在运行时调整动画效果，例如修改缓动函数等：

```js
const effect = animation.effect;

effect.getTiming().ease = 'linear';
```

### startTime

获取动画开始时间。

https://developer.mozilla.org/en-US/docs/Web/API/Animation/startTime

### currentTime

获取或设置动画相对于时间线的当前时间。

https://developer.mozilla.org/en-US/docs/Web/API/Animation/currentTime

```js
// 获取
const currentTime = animation.currentTime;

// 设置新时间，会影响动画效果
animation.currentTime = newTime;
```

### playState

返回动画的运行状态。当一些手动控制方法（例如 `pause()`）被调用后，状态发生改变。

https://developer.mozilla.org/en-US/docs/Web/API/Animation/playState

* idle 动画处于未准备好的状态
* running 动画处于运行状态
* paused 动画处于暂停状态
* finished 动画运行完毕.

### pending

动画正在等待一些异步任务完成，例如正在暂停一个运行中的动画。

https://developer.mozilla.org/en-US/docs/Web/API/Animation/pending

### ready

返回一个动画准备开始时 resolve 的 Promise。

https://developer.mozilla.org/en-US/docs/Web/API/Animation/ready

```js
animation.ready.then(() => {
  animation.playState; // running
  canvas.timeline.currentTime;
});
```

### finished

返回一个动画结束时 resolve 的 Promise。

https://developer.mozilla.org/en-US/docs/Web/API/Animation/finished

例如我们想让图形在所有动画结束之后移除自身：
```js
Promise.all(
  circle.getAnimations().map(
    (animation) => animation.finished
  )
).then(() => {
  return circle.remove();
});
```

### onfinish

设置动画完成后的回调函数，类似 [animationend](https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLElement/animationend_event) 事件。[示例](/zh/examples/animation#lifecycle)

https://developer.mozilla.org/en-US/docs/Web/API/Animation/onfinish

```js
animation.onfinish = function(e) {
  e.target; // animation
  e.target.playState; // 'finished'
};
```

回调函数中的事件对象为 [AnimationPlaybackEvent](https://developer.mozilla.org/en-US/docs/Web/API/AnimationPlaybackEvent)，该事件比较特殊，不可冒泡，也无法调用对象上的一些方法，有用的属性如下：
* target 返回监听的 animation
* currentTime 动画当前时间
* timelineTime 时间线时间


### playbackRate

动画播放的速率，默认值为 1

https://developer.mozilla.org/en-US/docs/Web/API/Animation/playbackRate

例如我们想手动控制动画的运行方向，或者降低播放速率：
```js
animation.playbackRate = -1;
animation.play();

// 减速
animation.playbackRate *= .9;

// 加速
animation.playbackRate *= 1.1;
```

## 方法

通过以下方法可以手动控制动画的运行状态，例如暂停、重启、结束等。[示例](/zh/examples/animation#lifecycle)

### play()

开始或者继续动画。当动画处于 `finished` 状态时，调用它会重启动画。

```js
animation.play();
animation.playState; // 'running'
```

### pause()

暂停动画

https://developer.mozilla.org/en-US/docs/Web/API/Animation/pause

```js
animation.pause();
animation.playState; // 'paused'
```

### finish()

将动画的运行时间调整到最后（和运行方向有关）。

https://developer.mozilla.org/en-US/docs/Web/API/Animation/finish

```js
animation.finish();
animation.playState; // 'finished'
```

### cancel()

清除该动画效果，将 `startTime` 和 `currentTime` 设置为 `null`

https://developer.mozilla.org/en-US/docs/Web/API/Animation/cancel

### reverse()

翻转动画运行方向，效果等同于设置 playbackRate 为 -1。

https://developer.mozilla.org/en-US/docs/Web/API/Animation/reverse

### updatePlaybackRate()

控制动画运行速率，默认速率为 1，[示例](/zh/examples/animation#easing)：
```js
animation.updatePlaybackRate(2); // 加速
animation.updatePlaybackRate(0.5); // 减速
animation.updatePlaybackRate(-1); // 反向
```

https://developer.mozilla.org/en-US/docs/Web/API/Animation/updatePlaybackRate

# KeyframeEffect

动画效果，可以通过 `getTiming()` 获取该效果对应的时间配置对象。由两部分组成：一组 Keyframe 和 [EffectTiming](/zh/docs/api/animation#effecttiming)。

https://developer.mozilla.org/en-US/docs/Web/API/Animation/effect

## target

返回当前处于动画中的图形

https://developer.mozilla.org/en-US/docs/Web/API/KeyframeEffect/target

```js
const animation = circle.animate({
  // ...
});

animation.effect.target; // circle
```

## getTiming()

返回 [EffectTiming](/zh/docs/api/animation#effecttiming) 对象

```js
const timing = animation.effect.getTiming();
timing.ease = 'linear';
```

# Keyframe

在开头的例子中，我们定义了两个 Keyframe：
```js
[
  {
    transform: 'scale(0)', // 起始关键帧
  },
  {
    transform: 'scale(1)', // 结束关键帧
  }
],
```

## 支持变换的属性

目前支持对以下属性进行变换 [示例](/zh/examples/animation#multiple-attributes)：

| 名称 | 类型 | 取值范围 | 备注 |
| --- | --- | --- | --- |
| transform | `string` | `scale(1, 2)` `scaleY(1)` | 和 [CSS Transform](https://developer.mozilla.org/zh-CN/docs/Web/CSS/transform) 保持一致 |
| opacity | `number` | `[0-1]` | 透明度 |
| fill | `string` | 例如 `red` `#fff` | 填充色 |
| stroke | `string` | 例如 `red` `#fff` | 描边色 |
| lineWidth | `number` | 例如 `1` `10` | 线宽 |
| r | `number` | 例如 `10` `20` | Circle 的半径 |
| width | `number` | 例如 `10` `20` | Rect/Image 的宽度 |
| height | `number` | 例如 `10` `20` | Rect/Image 的高度 |
| offsetDistance | `string` | `[0-1]` | 路径偏移，在[路径动画](/zh/docs/api/animation#路径动画)中使用 |

其中 transform 和 [CSS Transform](https://developer.mozilla.org/zh-CN/docs/Web/CSS/transform) 保持一致，支持以下属性值：

* 缩放，无单位
  * scale(x, y)
  * scaleX(x)
  * scaleY(x)
  * scaleZ(z)
  * scale3d(x, y, z)
* 平移，0 可以不加单位，无单位当作 px 处理，百分比相对于当前图形包围盒
  * translate(0, 0) translate(0, 30px) translate(100%, 100%)
  * translateX(0)
  * translateY(0)
  * translateZ(0)
  * translate3d(0, 0, 0)
* 旋转，支持 deg rad turn 这些单位
  * rotate(0.5turn) rotate(30deg) rotate(1rad)

⚠️ 暂不支持以下取值：
* `calc()`。例如 `translate(calc(100% + 10px))`
* `matrix/matrix3d()`
* `skew/skewX/skewY`
* `perspective`
* `none`

⚠️ 暂不支持 transformOrigin 指定旋转/缩放中心

## offset

关键帧的偏移量，取值范围为 `[0-1]`。
```js
[
  { opacity: 1 },
  { opacity: 0.1, offset: 0.7 },
  { opacity: 0 }
]
```

当不指定时，offset 会通过相邻 keyframe 自动计算，例如下面的 3 个 keyframe 都未指定，一头一尾默认值为 0 和 1，中间这一帧计算得到 0.5：
```js
[
  { transform: 'scale(0)' }, // offset 0
  { transform: 'scale(2)' }, // offset 0.5
  { transform: 'scale(1)' }, // offset 1
],
```

## easing

可以通过 `easing` 指明相邻 keyframe 之间的缓动函数：
```js
circle.animate([
  { opacity: 1, easing: 'ease-out' },
  { opacity: 0.1, easing: 'ease-in' },
  { opacity: 0 }
], 2000);
```

内置缓动函数详见 [easing](/zh/docs/api/animation#easing-1)

## 常见的动画效果

一些常见的动画效果，例如 fadeIn 等等，可以参考 https://github.com/wellyshen/use-web-animations/tree/master/src/animations
```js
export default {
  keyframes: [{ opacity: 0 }, { opacity: 1 }],
  animationOptions: { duration: 1000, fill: "both" },
};
```

[示例](/zh/examples/animation#animations)

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*WRp0SbVfgjUAAAAAAAAAAAAAARQnAQ)

# EffectTiming

https://developer.mozilla.org/en-US/docs/Web/API/EffectTiming

## delay

开始动画前的延迟，以毫秒为单位，默认值为 0，因此动画会立即开始。

https://developer.mozilla.org/en-US/docs/Web/API/EffectTiming/delay

**类型**： `number`

**默认值**：0

**是否必须**：`false`

## direction

动画在时间线上的运行方向，也会影响到每次迭代结束后的行为。通过该属性我们可以实现往复运动的效果。

https://developer.mozilla.org/en-US/docs/Web/API/EffectTiming/direction

**类型**： `string`

**默认值**：`normal`

**是否必须**：`false`

可以取以下值：
* normal 每次迭代中，动画都从起始帧运行到结束帧
* reverse 每次迭代中，动画都从结束帧运行到起始帧
* alternate 每次迭代结束后更换方向，例如第一次迭代从前往后，第二次迭代从后往前
* alternate-reverse 每次迭代结束后更换方向，例如第一次迭代从后往前，第二次迭代从前往后

## duration

动画运行时长，以毫秒为单位，默认为 `auto`，和 0 效果相同。

https://developer.mozilla.org/en-US/docs/Web/API/EffectTiming/duration

**类型**： `number | string`

**默认值**：`auto`

**是否必须**：`false`

**说明** 不能为负数

## easing

缓动函数，默认为 `linear`，我们也内置了一系列常用函数。[示例](/zh/examples/animation#easing)

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*9y3_TIoOUPMAAAAAAAAAAAAAARQnAQ)

https://developer.mozilla.org/en-US/docs/Web/API/EffectTiming/easing

**类型**： `string`

**默认值**：`linear`

**是否必须**：`false`

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

除此之外，还可以通过 `cubic-bezier(<number>, <number>, <number>, <number>)` 自定义形如三次贝塞尔曲线的函数。以上部分内置函数也是通过它定义完成的，例如 `ease-in-sine = cubic-bezier(0.47, 0, 0.745, 0.715)`

当以上内置缓动函数无法满足时，可以通过 `easingFunction` 手动传入自定义函数。

## easingFunction

自定义缓动函数。在绝大多数情况下都不需要使用到这个属性，内置缓动函数基本能满足需求。

**类型**： `Function`

**默认值**：`无`

**是否必须**：`false`

但如果想，例如手动实现一个 step 效果，[示例](/zh/examples/animation#easing)（选择 custom 缓动函数）：
```js
const count = 4;
const pos = 0;
timing.easingFunction = (x) => {
  if (x >= 1) {
    return 1;
  }
  const stepSize = 1 / count;
  x += pos * stepSize;
  return x - x % stepSize;
};
```

## endDelay

动画结束前的延迟，以毫秒为单位，默认值为 0，因此动画运行完毕会立即结束。

https://developer.mozilla.org/en-US/docs/Web/API/EffectTiming/endDelay

**类型**： `number`

**默认值**：0

**是否必须**：`false`

## fill

该属性规定了图形在动画处于非运行状态（例如动画开始前，结束后）时的展示效果。支持以下值：
* auto/none 默认值，这意味着动画在第一帧开始前和最后一帧结束后都不会影响到图形的展示效果。例如在动画完成后图形会恢复到动画前状态，如果设置了 delay 在延迟期间也不会应用第一帧的效果。
* forwards 动画完成后停住，不恢复到初始状态
* backwards 动画开始前应用第一帧效果
* both 为 forwards 和 backwards 的组合效果

https://developer.mozilla.org/en-US/docs/Web/API/EffectTiming/fill

例如我们想让图形在缩放动画完成后，停在结束状态：
```js
const animation = circle.animate(
  [
    { transform: 'scale(1)', fill: '#1890FF', stroke: '#F04864', opacity: 1 },
    { transform: 'scale(2)', fill: 'red', stroke: '#1890FF', opacity: 0.8 },
  ], {
  duration: 1500,
  easing: 'cubic-bezier(0.250, 0.460, 0.450, 0.940)',
  fill: 'both',
});
```

## iterations

循环次数，默认值为 1，也可以取大于 0 的小数。当我们想让动画一直运行下去时，可以取 `Infinity`。

https://developer.mozilla.org/en-US/docs/Web/API/EffectTiming/iterations

**类型**： `number`

**默认值**：1

**是否必须**：`false`

## [WIP] iterationStart

https://developer.mozilla.org/en-US/docs/Web/API/EffectTiming/iterationStart

# 其他类型的 Transition

我们熟悉的缓动函数（又称 Tween）是一种基于当前运行时间的动画效果，即使能够自定义缓动函数，仍然有一些动画效果无法实现。例如现已被广泛使用的 Spring 效果，在 [React Spring Visualizer](https://react-spring-visualizer.com/) 中可以看到该动画效果并非仅仅依靠当前运行时间，而是一种基于物理弹簧属性（自重、摩擦力等）的效果：
![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*6MaCQbloUQQAAAAAAAAAAAAAARQnAQ)

因此在一些流行的动画库中，Transition 通常不止 Tween 一种，例如 [Framer Motion](https://www.framer.com/docs/transition/#spring) 就支持 Spring：

```jsx
<motion.div
  animate={{ rotate: 180 }}
  transition={{ type: 'spring' }}
/>
```

也有像 https://react-spring.io/ 这样的库：

![](https://i.imgur.com/tg1mN1F.gif)

Spring 背后的原理：https://blog.maximeheckel.com/posts/the-physics-behind-spring-animations

那么对于这种非缓动的效果，如何使用 CSS Animation 或者 WAAPI 实现呢？关于这个问题在 W3C 中早已有过讨论：https://github.com/w3c/csswg-drafts/issues/229。
目前我们内置了 spring 系列的变换效果，但暂不提供弹簧参数的配置 [示例](/zh/examples/animation#easing)：
```js
const animation = image.animate(
  [
    { transform: 'rotate(0)' },
    { transform: 'rotate(360deg)' },
  ], {
  duration: 1500,
  iterations: Infinity,
  easing: 'spring',
});
```

# 路径动画

让图形沿着某个路径移动是一个常见的需求，在 CSS 中通过 [MotionPath](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Motion_Path) 实现：

```css
#motion-demo {
  offset-path: path('M20,20 C20,100 200,0 200,100');
  animation: move 3000ms infinite alternate ease-in-out;
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

首先通过 offsetPath 创建一条运动轨迹，目前支持 [Line](/zh/docs/api/basic/line) [Path](/zh/docs/api/basic/path) 和 [Polyline](/zh/docs/api/basic/polyline)。然后通过对 offsetDistance （取值范围 `[0-1]`）进行变换实现该效果，[示例](/zh/examples/animation#offset-path)：
```js
const circle = new Circle({
  attrs: {
    offsetPath: new Line({ // 创建运动轨迹
      attrs: { // 不需要设置其他与轨迹无关的绘图属性
        x1: 100,
        y1: 100,
        x2: 300,
        y2: 100,
      }
    }),
    r: 10,
  }
});

const animation = circle.animate([
  { offsetDistance: 0 }, // 变换
  { offsetDistance: 1 },
], {
  duration: 3000,
  easing: 'ease-in-out',
  iterations: Infinity,
});
```

效果如下：
![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*zNasT6AmflEAAAAAAAAAAAAAARQnAQ)

# [WIP] 高性能动画

在 `g-webgl` 中支持基于 WebGL Transform Feedback 的 GPU 动画。