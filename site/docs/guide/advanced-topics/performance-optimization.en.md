---
title: Performance Optimization
order: 1
redirect_from:
    - /en/guide/advanced-topics
---

Every rendering engine puts a lot of effort into performance optimization, and any optimization method needs to be applied in combination with the scene and specific APIs. In our visualization scenarios (2D charts, large-scale graph scenes), efficiently drawing a large number of simple graphics is a core requirement. Below, we introduce the optimization methods currently used in G in combination with rendering APIs such as Canvas2D / SVG / WebGL and WebGPU.

First, we need to introduce a core concept, the draw call, which most of the following optimization methods are centered around.

# What is a draw call?

Why does a high number of draw calls affect performance? In the process of asynchronous collaboration between the CPU and GPU, commands that need to be executed by the GPU, such as setting state, drawing, or copying resources, are submitted to a [command buffer](https://www.w3.org/TR/webgpu/#command-buffers). There is a significant difference between the speed at which the CPU prepares these commands and the speed at which the GPU executes them, which creates a performance bottleneck.

The following figure from <https://toncijukic.medium.com/draw-calls-in-a-nutshell-597330a85381> shows the timeline of the CPU and GPU in each frame. It can be seen that the GPU is always executing the commands submitted by the CPU in the previous frame, while the CPU is preparing the commands for the next frame. When the number of these drawing commands is small, the two can cooperate without problems, but if the number is large, the GPU will have to wait after finishing the rendering task of the current frame, and will not be able to complete it within 16ms, which causes a stuttering experience.

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*OdI0SqKtWB0AAAAAAAAAAAAAARQnAQ)

# Reducing draw calls

Therefore, we need to find ways to reduce the number of drawing commands submitted by the CPU, that is, to draw as little as possible, and not to draw if we can avoid it. Below we will introduce common optimization methods for different rendering APIs, each of which has its own suitable scenarios.

## Culling

A common interaction in graph scenes is to zoom in to view by scrolling the mouse wheel. At this time, only a part of the scene is visible, and most of it is outside the viewport. If we can "cull" the graphics outside the viewport, we can reduce the number of drawing commands.

What is the standard for determining whether a graphic in the scene needs to be drawn? In the figure below, the gray area represents the canvas viewport. If an object is "inside" the viewport, we draw it (green graphic), otherwise we cull it (red graphic).

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*IrstQLn0kVoAAAAAAAAAAAAAARQnAQ)

When judging whether a graphic is inside the viewport, we usually use a structure called a "bounding box". Graphics can be varied, but we can always find a minimum basic geometric structure that encloses it. This structure can be a "bounding box" or a "bounding sphere". In short, it is for the convenience of subsequent intersection with the viewport. In G, we choose an axis-aligned bounding box. Extending to 3D scenes, the viewport also becomes a view frustum. The following figure is from [Unreal - Visibility and Occlusion Culling](https://docs.unrealengine.com/Engine/Rendering/VisibilityCulling#viewfrustum):

![](https://user-images.githubusercontent.com/3608471/78733815-18111d80-7979-11ea-940b-9886ec5cf5e4.png)

The cost of performing such intersection calculations on the CPU side in each frame is not small, especially when there are a large number of graphics in the scene. In addition, in 3D scenes, the intersection cost between the view frustum and the bounding box (cube) is even greater, so we have also adopted a series of optimization methods:

When performing view frustum culling in 3D scenes, we try to use the following [acceleration detection methods](https://github.com/antvis/GWebGPUEngine/issues/3):

- The basic intersection test
- The plane-coherency test
- The octant test
- Masking
- TR coherency test

For more information, you can refer to:

- [Optimized View Frustum Culling Algorithms for Bounding Boxes](http://fileadmin.cs.lth.se/cs/Personal/Tomas_Akenine-Moller/pubs/vfcullbox.pdf.gz)
- [Efficient View Frustum Culling](http://old.cescg.org/CESCG-2002/DSykoraJJelinek/)
- [Optimization method for view frustum culling of AABB and OBB bounding boxes](https://zhuanlan.zhihu.com/p/55915345)

In 2D scenes, we use a spatial index (R-tree) to accelerate area queries. It takes a certain amount of time to build the index for the scene objects for the first time, and it needs to be updated at any time when the graphics are transformed.

Finally, since culling occurs on the CPU side and is independent of the specific rendering API, it is a relatively general optimization method.

### Other culling methods

In rendering APIs such as WebGL / WebGPU, other culling methods are also provided:

- Back-face culling, [gl.cullFace](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/cullFace)
- Occlusion culling, [gl.createQuery](https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext/createQuery). At least WebGL2 is required, and it is not currently used in G.

## "Dirty Rectangle" Rendering

Another common interaction is to highlight a graphic with the mouse. At this time, only a small part of the scene has changed, and it is unnecessary to erase all the graphics on the canvas and redraw them. Similar to the React diff algorithm that can find the smallest part that has actually changed, "dirty rectangle" rendering can reuse the rendering results of the previous frame as much as possible, and only draw the changed parts, which is especially suitable for the Canvas2D API.

The following figure illustrates this idea:

- When the mouse hovers over the circle, we know the corresponding "dirty rectangle", which is the bounding box of the circle.
- Find other graphics in the scene that intersect with this bounding box area, and here we find another rectangle.
- Use [clearRect](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/clearRect) to clear this "dirty rectangle" instead of clearing the entire canvas.
- Draw a rectangle and a circle in order of their z-index.

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*6zyLTL-AIbQAAAAAAAAAAAAAARQnAQ)

In the process of intersection and area query above, we can reuse the optimization methods in the culling scheme, such as acceleration structures.

Obviously, when there are too many dynamically changing objects, this optimization method loses its meaning. Imagine that the "dirty rectangle" after some calculation and merging is almost equal to the entire canvas, then it is better to clear and redraw all objects directly. Therefore, 2D game rendering engines such as Pixi.js [do not consider built-in](https://github.com/pixijs/pixi.js/issues/3503).

But in relatively static scenes such as visualization, it makes sense, for example, to update only a part of the chart after triggering a pick, and keep the rest unchanged.

We have made this renderer feature a switch that can be [turned off at any time according to the specific situation](/en/api/renderer/canvas#enabledirtyrectanglerendering).

## Batching

The above two methods are of course not suitable for some scenarios. For example, when you want to have a full view of a large-scale graph scene, you cannot apply culling (all nodes/edges are within the viewport). When you drag and move the entire scene, the effect of "dirty rectangle" rendering is not good either (the entire scene becomes "dirty").

In addition to using some upper-level LOD methods, such as hiding edges and text when the zoom level is high (because they are not clear anyway), to reduce the number of drawing commands, [draw call batching](https://docs.unity3d.com/Manual/DrawCallBatching.html) is very suitable.

Unlike the high-level drawing APIs provided by Canvas2D / Skia, WebGL / WebGPU provide lower-level APIs that allow us to merge a batch of "similar" graphics into a single drawing command. In rendering engines, it is often used to render scenes with a large number of trees in a forest. Graph scenes are also very suitable, as they contain a large number of similar but simple graphics (nodes, edges).

Combined with our [this tutorial](/en/guide/diving-deeper/camera), and with the Chrome Spector.js plugin, you can see that a single draw call completes the drawing of 8k nodes, which is the key to performance improvement:

![](https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*-8GtQrpM-jsAAAAAAAAAAAAAARQnAQ)

Usually, the created instance only has some of the capabilities of the original graphic. For example, Babylon.js only allows each instance to have [differences](https://doc.babylonjs.com/divingDeeper/mesh/copies/instances) in some transformation attributes. In G, users do not need to explicitly declare instances. They can be created as regular graphics, and they will be automatically merged internally.

It is worth mentioning that we use SDF to draw some 2D graphics such as Circle, Ellipse, and Rect. On the one hand, it can reduce the number of vertices (usually, triangulating a circle requires 30+ triangles, while SDF is fixed at 2), and on the other hand, it also increases the possibility of merging different graphics.

# Offscreen Canvas

⚠️ Only effective under `g-webgl`.

When the main thread needs to handle heavy interactions, we can hand over the rendering work of the Canvas to a Worker, and the main thread is only responsible for synchronizing the results. At present, many rendering engines already support this, such as [Babylon.js](https://doc.babylonjs.com/divingDeeper/scene/offscreenCanvas).

To support this feature, the engine itself does not need to be modified much, as long as it can ensure that `g-webgl` can run in a Worker.

## Limitations

Since it runs in a Worker environment, users need to manually handle some DOM-related events.

# References

- <https://unrealartoptimization.github.io/book/pipelines/>
