---
title: 实现一个简单的动画
order: 3
---

在本教程中，我们将实现一个简单的 Scale-In 动画效果：

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*XPzwTIUwizkAAAAAAAAAAAAAARQnAQ)

其中会涉及以下 API，如果你熟悉 CSS Animation 或者 [Web Animations API](https://developer.mozilla.org/zh-CN/docs/Web/API/Web_Animations_API)，使用时会相当轻松：

-   使用 [animate](/zh/api/animation/waapi#创建) 创建一个 Animation 对象
-   使用 [onfinish](/zh/api/animation/waapi#onfinish) 监听动画结束事件

最终示例：

-   [官网示例](/zh/examples/animation#lifecycle)
-   [CodeSandbox 示例](https://codesandbox.io/s/jiao-cheng-dong-hua-li-zi-sfphx?file=/index.js)

## 使用 Keyframe 定义动画

在定义动画效果时，关键帧是一种非常好用的描述方式。通过用户定义对象在某几个“关键”时间点上的状态，渲染引擎自动完成插值让对象的这些属性连续变化。

我们很容易写出 Scale-In 效果对应的 CSS Animation，其中：

-   使用 `animation` 定义了一组动画控制参数，例如 duration(0.5s), fill(both), easing 缓动函数
-   使用 `keyframes` 定义了一组关键帧，这里对 transform 属性进行动画

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

如果理解了上述 CSS Animation 写法，那么就很容易将它转换成符合 Web Animations API 的代码：

-   `circle.animate()` 将创建一个 [Animation](/zh/api/animation/waapi#animation) 对象，上面有很多有用的属性和控制方法，我们很快就将看到
-   该方法拥有两个参数，第一个对应 keyframes，第二个则是动画控制参数

```js
// 为 circle 创建一个 animation 对象
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

恭喜你！此时这个 circle 已经可以运动起来了。

## 监听动画结束事件

当我们想获知动画当前的状态，例如是否已经结束，或者想手动控制它的运行状态，例如暂停/恢复时，就需要使用到上一节创建的 Animation 对象。

例如我们想知道动画何时结束，有两种方式实现：

-   [onfinsh](/zh/api/animation/waapi#onfinish) 设置一个回调函数
-   [finished](/zh/api/animation/waapi#finished) 该对象是一个 Promise

```js
animation.onfinish = (e) => {
    console.log('finish!', e.target, e.target.playState);
};
animation.finished.then(() => {
    console.log('finish promise resolved');
});
```

当我们想实现一组连续动画时，这个方法很好用。

再比如我们想手动暂停一个运行中的动画，就可以使用 [pause()](/zh/api/animation/waapi#pause)：

```js
animation.pause();
```

除了暂停，[Animation 完整方法](/zh/api/animation/waapi#方法)中还包含了恢复、停止、重启、反向播放、设置播放速度（加减速）等。

## 更多动画效果

除了这个简单的 Scale-In 效果，我们还能实现更多复杂效果，例如：

-   `offsetDistance` 属性可以实现[路径动画](/zh/api/animation/waapi#路径动画)
-   `lineDashOffset` 属性可以实现[蚂蚁线动画](/zh/api/animation/waapi#蚂蚁线)
-   `lineDash` 属性可以实现[笔迹动画](/zh/api/animation/waapi#笔迹动画)
-   Path 的 `path` 属性可以实现[形变动画（Morph）](/zh/api/animation/waapi#形变动画)
