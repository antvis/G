---
title: Line 的实现
order: 3
---

画一条线到底有多难。

# 问题背景

最近的一期 WebGL / WebGPU Meetup 上一个“老生常谈”的话题又出现了，来自 Pixi.js 团队的“如何用 WebGL 画一条直线”：https://www.khronos.org/assets/uploads/developers/presentations/Crazy_Panda_How_to_draw_lines_in_WebGL.pdf

之前我在知乎上总结过一篇：[在 WebGL 中绘制直线](https://zhuanlan.zhihu.com/p/59541559)。结合上面的分享完善下目前 G 的实现。

# gl.LINES 的问题

WebGL 原生是提供了 LINES 这样的 primitive 的，但在实际使用中往往并不好用。尤其是涉及到地理信息的展示，直接使用原生的 gl.LINES 进行绘制存在一些问题：

-   线宽无法设置，Chrome 下试图设置 lineWidth 会得到警告，相关 ISSUE ：
    > MDN ：As of January 2017 most implementations of WebGL only support a minimum of 1 and a maximum of 1 as the technology they are based on has these same limits.
-   无法定义相邻线段间的连接形状 lineJoin 以及端点形状 lineCap

因此我们得考虑将线段转换成其他几何图形进行绘制。

# 实现

因此目前几乎所有的引擎都采用了在 CPU 侧进行三角化，根据 Cap、Joint 类型增加顶点。Mapbox 也是如此。另外也有在 Shader 中进行的例如 Geo.js，大量计算在 Fragment Shader 中进行。

下图来自 Pixi.js 团队的分享 PPT：

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*nUCYTZKHwmAAAAAAAAAAAAAAARQnAQ" height='200'/>

在 G 中，除了 Line、Polyline、Path 这些基础图形，在实现 stroke 描边时，也需要使用这一实现。

# Joint & Caps

![](https://wwwtyro.net/media/instanced-lines/caps-n-joins.svg)

# 性能优化

在绘制大量直线、折线甚至是曲线时，最好能尽可能共享顶点数据。

一种简单的做法是将线段看作一个 instance，这样一组线段（line strip）就可以重复绘制多次（端点数目 - 1）: https://wwwtyro.net/2019/11/18/instanced-lines.html

其中 instanced geometry 如下：

```glsl
vec2 point = pointA + xBasis * position.x + yBasis * width * position.y;
```

# 参考资料

-   https://wwwtyro.net/2019/11/18/instanced-lines.html
-   https://www.khronos.org/assets/uploads/developers/presentations/Crazy_Panda_How_to_draw_lines_in_WebGL.pdf
