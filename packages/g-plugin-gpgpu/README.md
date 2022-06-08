# @antv/g-plugin-gpgpu

Provide GPGPU capabilities based on [WebGPU](https://www.w3.org/TR/webgpu/).

## Getting Started

```js
import { Canvas, CanvasEvent } from '@antv/g';
import { Renderer, DeviceRenderer } from '@antv/g-webgpu';
import { Plugin, Kernel } from '@antv/g-plugin-gpgpu';

const { BufferUsage } = DeviceRenderer;

const renderer = new Renderer();
renderer.registerPlugin(new Plugin());
```
