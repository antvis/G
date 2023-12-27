---
title: Web Animations API
order: -4
redirect_from:
  - /zh/api/animation
---

参考 [Web Animations API](https://developer.mozilla.org/zh-CN/docs/Web/API/Web_Animations_API)，我们为每一个 DisplayObject 添加了动画能力。

目前我们支持基于 Keyframe 的动画，用户需要定义一系列关键帧，其中每一帧都可以包含变换属性、帧偏移量、缓动函数等参数，G 内部通过插值得到各个属性值在当前时间下的值并应用到目标图形上（如下图）。另外，对一些特殊属性变换会带来特别的动画效果，例如：

- `offsetDistance` 属性可以实现[路径动画](/zh/api/animation/waapi#路径动画)
- `lineDashOffset` 属性可以实现[蚂蚁线动画](/zh/api/animation/waapi#蚂蚁线)
- `lineDash` 属性可以实现[笔迹动画](/zh/api/animation/waapi#笔迹动画)
- Path 的 `path` 属性可以实现[形变动画（Morph）](/zh/api/animation/waapi#形变动画)

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*kF2uS4gpDh0AAAAAAAAAAAAAARQnAQ)

在 Transition 效果上，我们支持：

- Tween 缓动效果。内置例如 `linear` `cubic-bezier` 等，也支持自定义。
- Spring，一种基于真实物理弹簧的效果。

我们从一个 Keyframe 动画入手，实现一个 [ScaleIn](https://animista.net/play/entrances/scale-in) 的动画 [示例](/zh/examples/animation#lifecycle)：

```js
const scaleInCenter = circle.animate(
  [
    {
      transform: 'scale(0)', // 起始关键帧
    },
    {
      transform: 'scale(1)', // 结束关键帧
    },
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

一个动画对象通常由两部分组成：target 目标图形和 KeyframeEffect 动画效果。前者在通过 `object.animate()` 创建时已经指定，后者又由两部分组成：一组 Keyframe 和 EffectTiming。

https://developer.mozilla.org/en-US/docs/Web/API/Animation

### 创建

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

#### keyframes

支持 [KeyframeFormats](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API/Keyframe_Formats)

最常见的是在 keyframes 中声明需要变换的属性，下面的例子让圆的透明度和填充色发生变换：

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

keyframes 数组中的元素为 [Keyframe](/zh/api/animation/waapi#keyframe)。

#### options

`options` 支持两种类型：

- [EffectTiming](/zh/api/animation/waapi#effecttiming) 配置
- `number` 等价于 `{ duration }`

因此以下两种写法等价：

```js
circle.animate(keyframes, {
  duration: 100,
});
circle.animate(keyframes, 100);
```

### 属性

#### effect

https://developer.mozilla.org/en-US/docs/Web/API/Animation/effect

返回 [KeyframeEffect](/zh/api/animation/waapi#keyframeeffect) 对象。后续可以在运行时调整动画效果，例如修改缓动函数等：

```js
const effect = animation.effect;

effect.getTiming().ease = 'linear';
```

#### startTime

获取动画开始时间。

https://developer.mozilla.org/en-US/docs/Web/API/Animation/startTime

#### currentTime

获取或设置动画相对于时间线的当前时间。

https://developer.mozilla.org/en-US/docs/Web/API/Animation/currentTime

```js
// 获取
const currentTime = animation.currentTime;

// 设置新时间，会影响动画效果
animation.currentTime = newTime;
```

在该[示例](/zh/examples/animation#offset-path)中，可以随时修改改属性，由于该动画单次执行时间为 3500ms，缓动函数又是线性，因此小圆形会回到路径对应的位置，再继续移动。

#### playState

返回动画的运行状态。当一些手动控制方法（例如 `pause()`）被调用后，状态发生改变。

https://developer.mozilla.org/en-US/docs/Web/API/Animation/playState

- idle 动画处于未准备好的状态
- running 动画处于运行状态
- paused 动画处于暂停状态
- finished 动画运行完毕.

#### pending

动画正在等待一些异步任务完成，例如正在暂停一个运行中的动画。

https://developer.mozilla.org/en-US/docs/Web/API/Animation/pending

#### ready

返回一个动画准备开始时 resolve 的 Promise。

https://developer.mozilla.org/en-US/docs/Web/API/Animation/ready

```js
animation.ready.then(() => {
  animation.playState; // running
  canvas.timeline.currentTime;
});
```

#### finished

返回一个动画结束时 resolve 的 Promise。

https://developer.mozilla.org/en-US/docs/Web/API/Animation/finished

例如我们想让图形在所有动画结束之后移除自身：

```js
Promise.all(circle.getAnimations().map((animation) => animation.finished)).then(
  () => {
    return circle.remove();
  },
);
```

或者完成一组连续动画，例如让一个圆先向右，再向下移动，[示例](/zh/examples/animation#sequence)：

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
  const moveDown = circle.animate(
    //... 省略
  );
```

#### onfinish

设置动画完成后的回调函数，类似 [animationend](https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLElement/animationend_event) 事件。[示例](/zh/examples/animation#lifecycle)

https://developer.mozilla.org/en-US/docs/Web/API/Animation/onfinish

```js
animation.onfinish = function (e) {
  e.target; // animation
  e.target.playState; // 'finished'
};
```

回调函数中的事件对象为 [AnimationPlaybackEvent](https://developer.mozilla.org/en-US/docs/Web/API/AnimationPlaybackEvent)，该事件比较特殊，不可冒泡，也无法调用对象上的一些方法，有用的属性如下：

- target 返回监听的 animation
- currentTime 动画当前时间
- timelineTime 时间线时间

#### onframe

处于运行中的动画，在每一帧结束后调用，此时属性已经完成插值。如果动画处于暂停、未开始或者结束状态不会被调用。[示例](/zh/examples/animation#onframe)

```js
animation.onframe = function (e) {
  e.target; // animation
  e.target.playState; // 'running'
};
```

#### playbackRate

动画播放的速率，默认值为 1

https://developer.mozilla.org/en-US/docs/Web/API/Animation/playbackRate

例如我们想手动控制动画的运行方向，或者降低播放速率：

```js
animation.playbackRate = -1;
animation.play();

// 减速
animation.playbackRate *= 0.9;

// 加速
animation.playbackRate *= 1.1;
```

### 方法

通过以下方法可以手动控制动画的运行状态，例如暂停、重启、结束等。[示例](/zh/examples/animation#lifecycle)

#### play()

开始或者继续动画。当动画处于 `finished` 状态时，调用它会重启动画。

```js
animation.play();
animation.playState; // 'running'
```

#### pause()

暂停动画

https://developer.mozilla.org/en-US/docs/Web/API/Animation/pause

```js
animation.pause();
animation.playState; // 'paused'
```

#### finish()

将动画的运行时间调整到最后（和运行方向有关）。

https://developer.mozilla.org/en-US/docs/Web/API/Animation/finish

```js
animation.finish();
animation.playState; // 'finished'
```

#### cancel()

清除该动画效果，将 `startTime` 和 `currentTime` 设置为 `null`

https://developer.mozilla.org/en-US/docs/Web/API/Animation/cancel

#### reverse()

翻转动画运行方向，效果等同于设置 playbackRate 为 -1。

https://developer.mozilla.org/en-US/docs/Web/API/Animation/reverse

#### updatePlaybackRate()

控制动画运行速率，默认速率为 1，[示例](/zh/examples/animation#easing)：

```js
animation.updatePlaybackRate(2); // 加速
animation.updatePlaybackRate(0.5); // 减速
animation.updatePlaybackRate(-1); // 反向
```

https://developer.mozilla.org/en-US/docs/Web/API/Animation/updatePlaybackRate

## KeyframeEffect

动画效果，可以通过 `getTiming()` 获取该效果对应的时间配置对象。由两部分组成：一组 Keyframe 和 [EffectTiming](/zh/api/animation/waapi#effecttiming)。

https://developer.mozilla.org/en-US/docs/Web/API/Animation/effect

### target

返回当前处于动画中的图形

https://developer.mozilla.org/en-US/docs/Web/API/KeyframeEffect/target

```js
const animation = circle.animate({
  // ...
});

animation.effect.target; // circle
```

### getTiming()

返回 [EffectTiming](/zh/api/animation/waapi#effecttiming) 对象

https://developer.mozilla.org/en-US/docs/Web/API/AnimationEffect/getTiming

```js
const timing = animation.effect.getTiming();
timing.ease = 'linear';
```

### getComputedTiming()

返回 [ComputedEffectTiming](/zh/api/animation/waapi#effecttiming) 对象，它与 [EffectTiming](/zh/api/animation/waapi#effecttiming) 的区别在于前者会把后者的一些字面量计算后返回：

- duration 为 'auto' 时返回 0
- fill 为 'auto' 时返回 'none'

https://developer.mozilla.org/en-US/docs/Web/API/AnimationEffect/getComputedTiming

### updateTiming()

更新 [EffectTiming](/zh/api/animation/waapi#effecttiming) 属性，例如以下两种写法等价：

```js
const timing = animation.effect.getTiming();
timing.ease = 'linear';

animation.updateTiming({ ease: 'linear' });
```

https://developer.mozilla.org/en-US/docs/Web/API/AnimationEffect/updateTiming

## Keyframe

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

### 支持变换的属性

目前支持对以下属性进行变换 [示例](/zh/examples/animation#multiple-attributes)：

| 名称           | 类型               | 取值范围                   | 备注                                                                                    |
| -------------- | ------------------ | -------------------------- | --------------------------------------------------------------------------------------- |
| transform      | `string`           | `scale(1, 2)` `scaleY(1)`  | 和 [CSS Transform](https://developer.mozilla.org/zh-CN/docs/Web/CSS/transform) 保持一致 |
| opacity        | `number`           | `[0-1]`                    | 透明度                                                                                  |
| strokeOpacity  | `number`           | `[0-1]`                    | 描边透明度                                                                              |
| fill           | `string`           | 例如 `red` `#fff`          | 填充色                                                                                  |
| stroke         | `string`           | 例如 `red` `#fff`          | 描边色                                                                                  |
| lineWidth      | `number`           | 例如 `1` `10`              | 线宽                                                                                    |
| r              | `number`           | 例如 `10` `20`             | Circle 的半径                                                                           |
| rx/ry          | `number`           | 例如 `10` `20`             | Ellipse 的半径                                                                          |
| width          | `number`           | 例如 `10` `20`             | Rect/Image 的宽度                                                                       |
| height         | `number`           | 例如 `10` `20`             | Rect/Image 的高度                                                                       |
| x1/y1/x2/y2    | `number`           | 例如 `10` `20`             | Line 的端点坐标                                                                         |
| offsetDistance | `number`           | `[0-1]`                    | 路径偏移，在[路径动画](/zh/api/animation/waapi#路径动画)中使用                          |
| lineDash       | `[number, number]` | 例如 `[0, 100]`            | 实线和间隔的长度，在[笔迹动画](/zh/api/animation/waapi#笔迹动画)中使用                  |
| lineDashOffset | `number`           | 例如 `-20` `0` `20`        | 设置虚线的偏移量，在[蚂蚁线效果](/zh/api/animation/waapi#蚂蚁线)中使用                  |
| path           | `string`           | 例如 `M 100,100 L 200,200` | Path 的定义，在[形变动画](/zh/api/animation/waapi#形变动画)中使用                       |

对于自定义属性，可以[在样式系统中注册](/zh/api/css/css-properties-values-api#自定义属性)。在该[示例](/zh/examples/style#custom-property)中，我们注册了多种不同类型的自定义属性，让它们支持插值。

其中 transform 和 [CSS Transform](https://developer.mozilla.org/zh-CN/docs/Web/CSS/transform) 保持一致，支持以下属性值：

- 缩放，无单位
  - scale(x, y)
  - scaleX(x)
  - scaleY(x)
  - scaleZ(z)
  - scale3d(x, y, z)
- 平移，0 可以不加单位，无单位当作 px 处理，百分比相对于当前图形包围盒
  - translate(0, 0) translate(0, 30px) translate(100%, 100%)
  - translateX(0)
  - translateY(0)
  - translateZ(0)
  - translate3d(0, 0, 0)
- 旋转，支持 deg rad turn 这些单位
  - rotate(0.5turn) rotate(30deg) rotate(1rad)
- 拉伸，支持 deg rad turn 这些角度单位
  - skew(ax, ay)
  - skewX(a)
  - skewY(a)
- 变换矩阵
  - matrix(a,b,c,d,tx,ty) 可参考 [CSS matrix 定义](https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function/matrix)
  - matrix3d() 包含 16 个元素的完整矩阵定义
- 无变换 none

⚠️ 暂不支持以下取值：

- `calc()`。例如 `translate(calc(100% + 10px))`
- `perspective`

### offset

关键帧的偏移量，取值范围为 `[0-1]`。

```js
[{ opacity: 1 }, { opacity: 0.1, offset: 0.7 }, { opacity: 0 }];
```

当不指定时，offset 会通过相邻 keyframe 自动计算，例如下面的 3 个 keyframe 都未指定，一头一尾默认值为 0 和 1，中间这一帧计算得到 0.5：

```js
[
  { transform: 'scale(0)' }, // offset 0
  { transform: 'scale(2)' }, // offset 0.5
  { transform: 'scale(1)' }, // offset 1
],
```

### easing

可以通过 `easing` 指明相邻 keyframe 之间的缓动函数：

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

内置缓动函数详见 [easing](/zh/api/animation/waapi#easing-1)

### 常见的动画效果

一些常见的动画效果，例如 fadeIn 等等，可以参考 https://github.com/wellyshen/use-web-animations/tree/master/src/animations

```js
export default {
  keyframes: [{ opacity: 0 }, { opacity: 1 }],
  animationOptions: { duration: 1000, fill: 'both' },
};
```

[示例](/zh/examples/animation#animations)

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*WRp0SbVfgjUAAAAAAAAAAAAAARQnAQ)

## EffectTiming

https://developer.mozilla.org/en-US/docs/Web/API/EffectTiming

```js
const timing = animation.effect.getTiming();
```

### delay

开始动画前的延迟，以毫秒为单位，默认值为 0，因此动画会立即开始。

https://developer.mozilla.org/en-US/docs/Web/API/EffectTiming/delay

**类型**： `number`

**默认值**：0

**是否必须**：`false`

### direction

动画在时间线上的运行方向，也会影响到每次迭代结束后的行为。通过该属性我们可以实现往复运动的效果。

https://developer.mozilla.org/en-US/docs/Web/API/EffectTiming/direction

**类型**： `string`

**默认值**：`normal`

**是否必须**：`false`

可以取以下值：

- normal 每次迭代中，动画都从起始帧运行到结束帧
- reverse 每次迭代中，动画都从结束帧运行到起始帧
- alternate 每次迭代结束后更换方向，例如第一次迭代从前往后，第二次迭代从后往前
- alternate-reverse 每次迭代结束后更换方向，例如第一次迭代从后往前，第二次迭代从前往后

### duration

动画运行时长，以毫秒为单位，默认为 `auto`，和 0 效果相同。

https://developer.mozilla.org/en-US/docs/Web/API/EffectTiming/duration

**类型**： `number | string`

**默认值**：`auto`

**是否必须**：`false`

**说明** 不能为负数

### easing

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

当以上内置缓动函数无法满足时，可以通过 `EasingFunctions` 注册自定义函数。

```ts
import { EasingFunctions } from '@antv/g';
// 注册自定义缓动函数
EasingFunctions['my-easing'] = (t: number) => t;

circle.animate([{ opacity: 0 }, { opacity: 1 }], {
  duration: 500,
  easing: 'my-easing', // 使用
});
```

### endDelay

动画结束前的延迟，以毫秒为单位，默认值为 0，因此动画运行完毕会立即结束。

https://developer.mozilla.org/en-US/docs/Web/API/EffectTiming/endDelay

**类型**： `number`

**默认值**：0

**是否必须**：`false`

我们也可以设置一个负数，让动画提前结束：

```js
const animation = circle.animate(
  [{ transform: 'scale(1)' }, { transform: 'scale(2)' }],
  {
    duration: 2000,
    endDelay: -1000, // 动画执行到一半会立刻结束
    easing: 'cubic-bezier(0.250, 0.460, 0.450, 0.940)',
  },
);
```

### fill

该属性规定了图形在动画处于非运行状态（例如动画开始前，结束后）时的展示效果。支持以下值：

- auto/none 默认值，这意味着动画在第一帧开始前和最后一帧结束后都不会影响到图形的展示效果。例如在动画完成后图形会恢复到动画前状态，如果设置了 delay 在延迟期间也不会应用第一帧的效果。
- forwards 动画完成后停住，不恢复到初始状态
- backwards 动画开始前应用第一帧效果
- both 为 forwards 和 backwards 的组合效果

https://developer.mozilla.org/en-US/docs/Web/API/EffectTiming/fill

例如我们想让图形在缩放动画完成后，停在结束状态：

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

循环次数，默认值为 1，也可以取大于 0 的小数。当我们想让动画一直运行下去时，可以取 `Infinity`。

https://developer.mozilla.org/en-US/docs/Web/API/EffectTiming/iterations

**类型**： `number`

**默认值**：1

**是否必须**：`false`

### iterationStart

从何处开始执行动画，例如动画总是从 0 开始运行，设置为 0.5 代表动画会从当中开始运行。

https://developer.mozilla.org/en-US/docs/Web/API/EffectTiming/iterationStart

**类型**： `number`

**默认值**：0

**是否必须**：`false`

## ComputedEffectTiming

继承了 [EffectTiming](/zh/api/animation/waapi#effecttiming) 的所有属性，同时包含一些只读的、计算后的额外属性。

```js
const computedTiming = animation.effect.getComputedTiming();
```

### endTime

动画的预计结束时间，需要考虑前后延迟。计算方式为：[delay](/zh/api/animation/waapi#delay) + [activeDuration](/zh/api/animation/waapi#activeduration) + [endDelay](/zh/api/animation/waapi#enddelay)

https://developer.mozilla.org/en-US/docs/Web/API/AnimationEffect/getComputedTiming#return_value

### activeDuration

动画效果运行的预计时长，单位毫秒。计算方式为 [duration](/zh/api/animation/waapi#duration) \* [iterations](/zh/api/animation/waapi#iterations)

https://developer.mozilla.org/en-US/docs/Web/API/AnimationEffect/getComputedTiming#return_value

### localTime

同 [currentTime](/zh/api/animation/waapi#currenttime)，单位毫秒。

### progress

返回在当前 iteration 内的进度，取值范围为 `[0-1]`。当动画不在运行中时返回 null。

在该[示例](/zh/examples/animation#lifecycle)中，我们在每一帧结束的 [onframe](/zh/api/animation/waapi#onframe) 回调函数中打印进度值：

```js
animation.onframe = (e) => {
  console.log(e.target.effect.getComputedTiming().progress);
};
```

### currentIteration

返回动画当前循环执行的次数，从 0 开始。当动画不在运行中时返回 null。

## 其他类型的 Transition

我们熟悉的缓动函数（又称 Tween）是一种基于当前运行时间的动画效果，即使能够自定义缓动函数，仍然有一些动画效果无法实现。例如现已被广泛使用的 Spring 效果，在 [React Spring Visualizer](https://react-spring-visualizer.com/) 中可以看到该动画效果并非仅仅依靠当前运行时间，而是一种基于物理弹簧属性（自重、摩擦力等）的效果： ![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*6MaCQbloUQQAAAAAAAAAAAAAARQnAQ)

因此在一些流行的动画库中，Transition 通常不止 Tween 一种，例如 [Framer Motion](https://www.framer.com/docs/transition/#spring) 就支持 Spring：

```jsx
<motion.div animate={{ rotate: 180 }} transition={{ type: 'spring' }} />
```

也有像 https://react-spring.io/ 这样的库：

![](https://i.imgur.com/tg1mN1F.gif)

Spring 背后的原理：https://blog.maximeheckel.com/posts/the-physics-behind-spring-animations

那么对于这种非缓动的效果，如何使用 CSS Animation 或者 WAAPI 实现呢？关于这个问题在 W3C 中早已有过讨论：https://github.com/w3c/csswg-drafts/issues/229。 目前我们内置了 spring 系列的变换效果，但暂不提供弹簧参数的配置 [示例](/zh/examples/animation#easing)：

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

## 路径动画

让图形沿着某个路径移动是一个常见的需求，在 CSS 中通过 [MotionPath](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Motion_Path) 实现：

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

首先通过 offsetPath 创建一条运动轨迹，目前支持 [Line](/zh/api/basic/line) [Path](/zh/api/basic/path) 和 [Polyline](/zh/api/basic/polyline)。然后通过对 offsetDistance （取值范围 `[0-1]`）进行变换实现该效果：

```js
const circle = new Circle({
  style: {
    offsetPath: new Line({
      // 创建运动轨迹
      style: {
        // 不需要设置其他与轨迹无关的绘图属性
        x1: 100,
        y1: 100,
        x2: 300,
        y2: 100,
      },
    }),
    r: 10,
  },
});

circle.animate(
  [
    { offsetDistance: 0 }, // 变换
    { offsetDistance: 1 },
  ],
  {
    duration: 3000,
    easing: 'ease-in-out',
    iterations: Infinity,
  },
);
```

[完整示例](/zh/examples/animation#offset-path)效果如下： ![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*nk1YSrbkQPMAAAAAAAAAAAAAARQnAQ)

## 蚂蚁线

在 PS 中常见的套索工具就是一种“蚂蚁线”效果。

[lineDashOffset](/zh/api/basic/display-object#linedashoffset) 属性用来设置虚线的偏移量，对它进行变换就可以实现该效果：

```js
const circle = new Circle({
  style: {
    // 省略其他绘图属性
    lineDash: [10, 10],
  },
});
circle.animate([{ lineDashOffset: -20 }, { lineDashOffset: 0 }], {
  duration: 500,
  iterations: Infinity,
});
```

[完整示例](/zh/examples/animation#marching-ants)效果如下： ![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*TTyTTISXlKAAAAAAAAAAAAAAARQnAQ)

## 笔迹动画

一种常见的动画效果是让描边的轨迹从无到有展现出来，[lineDash](/api/basic/display-object#linedash) 属性指定了描边实线和间隔的长度，笔迹初始状态“无”可以用 `[0, length]` 表示，而完整状态可以用 `[length, 0]` 表示。其中描边的长度可以通过图形上的方法取得，例如 Path 的 [getTotalLength](/zh/api/basic/path#gettotallength-number) 方法：

```js
const length = path.getTotalLength();
path.animate([{ lineDash: [0, length] }, { lineDash: [length, 0] }], {
  duration: 3500,
  easing: 'cubic-bezier(0.250, 0.460, 0.450, 0.940)',
  iterations: Infinity,
  direction: 'alternate',
});
```

[完整示例](/zh/examples/animation#line-dash)效果如下： ![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*8NOsQoWLm2IAAAAAAAAAAAAAARQnAQ)

## 形变动画

在很多 SVG 相关的库中都能看到形变动画的例子，例如：

- [Paper.js](http://paperjs.org/)
- [Kute.js](https://thednp.github.io/kute.js/) 提供了 [Morph](https://thednp.github.io/kute.js/svgMorph.html) 和 [CubicMorph](https://thednp.github.io/kute.js/svgCubicMorph.html) 两个组件
- [Snap.svg](http://snapsvg.io/)
- GreenSocks 提供的 [MorphSVGPlugin](https://greensock.com/docs/v2/Plugins/MorphSVGPlugin) 插件甚至能在 Canvas 中渲染

以上部分库会要求变换前后的路径定义包含相同的分段，不然无法进行插值。

G 参考了 Kute.js 中的 [CubicMorph](https://thednp.github.io/kute.js/svgCubicMorph.html)，首先将 Path 定义中的各个部分转成三阶贝塞尔曲线表示，然后利用三阶贝塞尔曲线易于分割的特性，将变换前后的路径规范到相同数目的分段，最后对各个分段中的控制点进行插值实现动画效果：

```js
// 定义 Path
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

[完整示例](/zh/examples/animation#morph)效果如下： ![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*qCHaTJUg_aEAAAAAAAAAAAAAARQnAQ)

### 基础图形变换

由于只能对 path 属性进行变换，对于其他基础图形例如 Circle、Rect、Line，我们提供了工具方法 [convertToPath](/zh/api/builtin-objects/utils#converttopath) 进行转换：

```js
import { Circle, convertToPath } from '@antv/g';

const circle = new Circle({
  style: {
    cx: 50,
    cy: 50,
    r: 50,
  },
});
const circlePath = convertToPath(circle); // 转换得到 Path 字符串

path.animate([{ path: originalPath }, { path: circlePath }], {
  duration: 2500,
});
```

目前支持转换路径的基础图形有：[Circle](/zh/api/basic/circle) [Ellipse](/zh/api/basic/ellipse) [Rect](/zh/api/basic/rect) [Line](/zh/api/basic/line) [Polyline](/zh/api/basic/polyline) [Polygon](/zh/api/basic/polygon) [Path](/zh/api/basic/path)。 [完整示例](/zh/examples/animation#morph)

需要注意的是，对这些基础图形的变换会影响到最终生成的 path 字符串。例如下面的五角星原始路径尺寸太大，我们可以缩放后进行动画：

```js
const starPath = new Path({
  style: {
    path: 'M301.113,12.011l99.25,179.996l201.864,38.778L461.706,380.808l25.508,203.958l-186.101-87.287L115.01,584.766l25.507-203.958L0,230.785l201.86-38.778L301.113,12.011',
  },
});
starPath.scale(0.2); // 先缩放
const pathString = convertToPath(starPath); // 再转换成 path 字符串
```

### 注意事项

在形变动画中，我们暂不支持多于两组 keyframes，例如：

```js
path.animate(
  [
    // 使用了三组 keyframes
    { path: path1 },
    { path: path2 },
    { path: path3 },
  ],
  {
    duration: 2500,
  },
);
```

对于多个 path 间的连续变化，可以拆成多个 Animation，例如：

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

## [WIP] 高性能动画

在 `g-webgl` 中支持基于 WebGL Transform Feedback 的 GPU 动画。
