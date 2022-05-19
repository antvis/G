# @antv/g-plugin-gpgpu

Provide GPGPU capabilities based on [WebGPU](https://www.w3.org/TR/webgpu/).

## Getting Started

```js
import { Canvas, CanvasEvent } from '@antv/g';
import { Renderer } from '@antv/g-webgpu';
import { Plugin, Kernel, BufferUsage } from '@antv/g-plugin-gpgpu';

const renderer = new Renderer();
renderer.registerPlugin(new Plugin());
```
