---
title: Principles of classical GPGPU implementation
order: 6
---

The principle of the classic GPGPU implementation using the Graphics Rendering API can be simply summarized as: scientific computation by texturing. For compatibility reasons, we also use this approach in WebGL.

「GPGPU 编程技术 - 从 GLSL、CUDA 到 OpenCL」

![image](https://user-images.githubusercontent.com/3608471/84491693-83f46700-acd7-11ea-8d5a-15edb3285e75.png)

## Render to Texture

Normally the final output target of the graphics rendering API is the screen, which displays the rendered result. But in a GPGPU scenario we just want to read the final computation on the CPU side. Therefore the off-screen rendering feature provided by the rendering API is used - rendering to a texture, where the key technique is to use a Framebuffer Object (FBO) as the rendering object.

However, this approach has the obvious limitation that the texture cache is either read-only or write-only for all threads, making it impossible for one thread to read a texture and another to write it. This is essentially due to the hardware design of the GPU. If you want to implement multiple threads reading/writing the same texture at the same time, you need to design complex synchronization mechanisms to avoid read/write conflicts, which inevitably affects the efficiency of parallel thread execution.

Therefore, in a classical GPGPU implementation, we usually prepare two textures, one to hold the input data and one to hold the output data. This is why we are allowed to use only one `@out` declaration for output variables.

Our data is stored in video memory, using the RGBA texture format, which contains 4 channels per pixel, so using `vec4[]` in GWebGPU is the most memory-efficient data format. If `float[]` is used, the three channels of GBA in each pixel are wasted. Of course the decision of the data type is up to the developer and can be decided based on the ease of access in the actual program.

## Calling the draw command

Our computational logic is written in the Fragment Shader, where each pixel is assigned to a thread for shading during the rasterization phase of the rendering pipeline, achieving a parallel effect.

When mapped to the concept of computation in the CPU, textures can be considered as arrays, and the programs executed by the fragment shader are looping statements.

## What is texture mapping

A 3D model consists of many triangular surfaces, each of which can theoretically continue to be subdivided infinitely, but coloring each triangular surface is very performance intensive. A faster approach is mapping, where a 2D bitmap (texture) is applied to the surface of the model, a process known as texture mapping. Instead of defining texture coordinates for each vertex of the model, we only need to define the coordinates of the four corners and leave the rest to the rendering pipeline for interpolation.

## Ping-pong

Many algorithms need to be run several times in succession, for example, the layout algorithm used in G6 needs to be iterated several times to reach a steady state. The computation result output in the previous iteration needs to be used as input for the next iteration. In practice, we allocate two texture caches and swap the input and output textures after each iteration.

## References

-   「GPGPU 编程技术 - 从 GLSL、CUDA 到 OpenCL」[🔗](https://book.douban.com/subject/6538230/)
-   http://www.vizitsolutions.com/portfolio/webgl/gpgpu/
