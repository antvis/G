# @antv/g-webgpu

This is an experimental renderer implemented with WebGPU.

```js
import { Canvas, CanvasEvent, Circle } from '@antv/g';
import { Renderer as WebGPURenderer } from '@antv/g-webgpu';

const webgpuRenderer = new WebGPURenderer({
  shaderCompilerPath: '/glsl_wgsl_compiler_bg.wasm',
  onContextLost: () => {},
});

// create a canvas
const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer: webgpuRenderer,
});
```

## Options

### shaderCompilerPath

We translate GLSL to WGSL with [naga]() bundled into WASM which need to be loaded at runtime.

### onContextLost

https://github.com/gpuweb/gpuweb/blob/main/design/ErrorHandling.md#fatal-errors-requestadapter-requestdevice-and-devicelost
