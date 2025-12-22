---
title: Implementation of Line
order: 3
---

How hard can it be to draw a line?

# Background

At a recent WebGL / WebGPU Meetup, a "familiar" topic came up again, from the Pixi.js team: "How to draw a straight line in WebGL": <https://www.khronos.org/assets/uploads/developers/presentations/Crazy_Panda_How_to_draw_lines_in_WebGL.pdf>

I previously summarized an article on Zhihu: [Drawing straight lines in WebGL](https://zhuanlan.zhihu.com/p/59541559). Combined with the sharing above, I will improve the current implementation of G.

# The problem with gl.LINES

WebGL natively provides a primitive like LINES, but it is often not easy to use in practice. Especially when it comes to the display of geographic information, there are some problems with directly using the native gl.LINES for drawing:

- The line width cannot be set. In Chrome, trying to set lineWidth will result in a warning. Related ISSUE:
> MDN: As of January 2017 most implementations of WebGL only support a minimum of 1 and a maximum of 1 as the technology they are based on has these same limits.
- The connection shape lineJoin and the endpoint shape lineCap between adjacent line segments cannot be defined.

Therefore, we have to consider converting line segments into other geometric figures for drawing.

# Implementation

Therefore, almost all engines currently use triangulation on the CPU side and add vertices according to the Cap and Joint types. Mapbox is the same. There are also some implementations in the Shader, such as Geo.js, where a large number of calculations are performed in the Fragment Shader.

The following picture is from the sharing PPT of the Pixi.js team:

<img src="https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*nUCYTZKHwmAAAAAAAAAAAAAAARQnAQ" height='200'/>

In G, in addition to basic graphics such as Line, Polyline, and Path, this implementation is also needed when implementing stroke.

# Joint & Caps

![](https://wwwtyro.net/media/instanced-lines/caps-n-joins.svg)

# Performance Optimization

When drawing a large number of straight lines, polylines, or even curves, it is best to share vertex data as much as possible.

A simple way is to treat a line segment as an instance, so that a group of line segments (line strip) can be drawn repeatedly many times (number of endpoints - 1): <https://wwwtyro.net/2019/11/18/instanced-lines.html>

The instanced geometry is as follows:

```glsl
vec2 point = pointA + xBasis * position.x + yBasis * width * position.y;
```

# References

- <https://wwwtyro.net/2019/11/18/instanced-lines.html>
- <https://www.khronos.org/assets/uploads/developers/presentations/Crazy_Panda_How_to_draw_lines_in_WebGL.pdf>
