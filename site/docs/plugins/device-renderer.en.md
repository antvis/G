---
title: g-plugin-device-renderer
order: 2
---

Provides WebGL 1/2 and WebGPU-based rendering capabilities, and also includes GPU-based pickup capabilities. All 2D base graphics provided by the built-in G Core package, while exposing the ability to extend other custom 2D/3D graphics.

## Usage

The `g-webgl` and `g-webgpu` renderers are built in by default, so there is no need to introduce them manually.

```js
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
const renderer = new WebGLRenderer();
```

## Device

It represents a GPU device (as opposed to a Host, which usually refers to a CPU) and provides a unified HAL hardware adaptation layer for WebGL 1/2 and WebGPU implementations. The WebGPU [related API](https://www.w3.org/TR/webgpu/) has been heavily referenced in the design of the related APIs.

Since device initialization may be asynchronous (e.g. `adapter.requestDevice()` for WebGPU), two ways to obtain a Device are provided.

```js
import { CanvasEvent } from '@antv/g';

// Listening for canvas ready events
canvas.addEventListener(CanvasEvent.READY, () => {
    // Get Device by Renderer
    const plugin = renderer.getPlugin('device-renderer');
    const device = plugin.getDevice();
});

// Or wait for the canvas to be ready
await canvas.ready;
// Get Device by Renderer
const plugin = renderer.getPlugin('device-renderer');
const device = plugin.getDevice();
```

After acquiring a Device, you can use it to create a series of GPU-related resources, such as Buffer, Texture, etc.

### Buffer

Buffer represents a piece of memory used in GPU operations that can be specified at creation time to initialize the data and subsequently modify some of it. The data is stored in a linear layout. When you need to read the data on the CPU side (Host), you need to do it by [Readback](/en/plugins/device-renderer#readback).

```ts
export interface Buffer {
    setSubData(
        dstByteOffset: number,
        src: ArrayBufferView,
        srcByteOffset?: number,
        byteLength?: number,
    ): void;

    destroy(): void;
}
```

#### createBuffer

The Buffer is created in the following way and needs to be specified.

-   viewOrSize must be filled, specify the initialization data or Buffer size
-   usage Mandatory, memory usage, fully refer to [WebGPU Buffer Usage](https://www.w3.org/TR/webgpu/#buffer-usage)
-   hint Optional, only valid in WebGL environment

```ts
interface Device {
    createBuffer(descriptor: BufferDescriptor): Buffer;
}

export interface BufferDescriptor {
    viewOrSize: ArrayBufferView | number;
    usage: BufferUsage;
    hint?: BufferFrequencyHint;
}

export enum BufferUsage {
    MAP_READ = 0x0001,
    MAP_WRITE = 0x0002,
    COPY_SRC = 0x0004,
    COPY_DST = 0x0008,
    INDEX = 0x0010,
    VERTEX = 0x0020,
    UNIFORM = 0x0040,
    STORAGE = 0x0080,
    INDIRECT = 0x0100,
    QUERY_RESOLVE = 0x0200,
}

export enum BufferFrequencyHint {
    Static = 0x01,
    Dynamic = 0x02,
}
```

For example, when used with [g-plugin-gpgpu](/en/plugins/gpgpu), to allocate input and output Buffer.

```js
const buffer = device.createBuffer({
    usage: BufferUsage.STORAGE | BufferUsage.COPY_SRC,
    viewOrSize: new Float32Array([1, 2, 3, 4]),
});
```

#### setSubData

-   dstByteOffset required, the offset in the target Buffer, in Byte units
-   src Mandatory, type is ArrayBufferView
-   srcByteOffset optional, the starting offset in src, in Byte
-   byteLength optional, the length in src, in Byte

For example, to modify a variable in Uniform, which is located at the 20th bytes in the original Buffer.

```js
paramBuffer.setSubData(
    5 * Float32Array.BYTES_PER_ELEMENT,
    new Float32Array([maxDisplace]),
);
```

#### destroy

Free Buffer resources.

```js
buffer.destroy();
```

### Readback

Sometimes we need to read data from the GPU side (Device) Buffer or Texture on the CPU side (Host), and this is done with the Readback object, which provides asynchronous read methods.

#### createReadback

```js
interface Device {
    createReadback(): Readback;
}
```

#### readBuffer

Reads the Buffer contents asynchronously.

-   Implemented in WebGPU by [copyBufferToBuffer](https://www.w3.org/TR/webgpu/#dom-gpucommandencoder-copybuffertobuffer), and in WebGL2 by [fenceSync](https://www.w3.org/TR/webgpu/#dom-gpucommandencoder-copybuffertobuffer).
-   WebGL2 is implemented by [fenceSync](https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext/fenceSync)
-   WebGL1 does not support

The list of parameters is as follows.

-   srcBuffer Mandatory, source Buffer
-   srcByteOffset optional, the starting offset of the target Buffer, default is 0, i.e. read from scratch
-   dstBuffer optional, the content of the read is stored to the target ArrayBufferView, not filled automatically created, and finally returned as a result
-   dstOffset optional, the target ArrayBufferView offset, default is 0, that is, write from the beginning
-   length check or fill, the length of the read, the default is all

The return value is the result of reading the ArrayBufferView.

```js
export interface Readback {
    readBuffer(
        srcBuffer: Buffer,
        srcByteOffset?: number,
        dstBuffer?: ArrayBufferView,
        dstOffset?: number,
        length?: number,
    ): Promise<ArrayBufferView>;
}
```

For example, when used with [g-plugin-gpgpu](/en/plugins/gpgpu), reads the result of the calculation.

```js
const result = await readback.readBuffer(resultBuffer); // Float32Array([...])
```

#### readTexture

Reads the texture content.

-   WebGL1 is implemented via [readPixels](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/readPixels)
-   WebGL2 is implemented with [fenceSync](https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext/fenceSync) as readBuffer.
-   WebGPU uses [copyTextureToBuffer](https://www.w3.org/TR/webgpu/#dom-gpucommandencoder-copytexturetobuffer) and then uses readBuffer in the same way as readBuffer

The list of parameters is as follows.

-   texture must be filled, source Texture
-   x must be filled, the starting x-coordinate of the read area
-   y must be filled, the starting y-coordinate of the read area
-   width must be filled, the width of the read area
-   height must be filled, the height of the read area
-   dstBuffer Mandatory, the content of the read area will be stored in the target ArrayBufferView and returned as a result.
-   dstOffset optional, the target ArrayBufferView offset, default is 0, i.e. write from scratch
-   length is optional, the length of the read, default is all

The return value is the result of reading the ArrayBufferView.

```js
export interface Readback {
    readTexture(
        t: Texture,
        x: number,
        y: number,
        width: number,
        height: number,
        dstBuffer: ArrayBufferView,
        dstOffset?: number,
        length?: number,
    ): Promise<ArrayBufferView>;
}
```

For example, when implementing GPU-based color-coded pickups.

```js
const pickedColors = await readback.readTexture(
    this.pickingTexture,
    rect.x,
    rect.y,
    rect.width,
    rect.height,
    new Uint8Array(rect.width * rect.height * 4),
);
```

#### destroy

Releases the Readback resource.

```js
readback.destroy();
```

### Texture

Textures are a very common GPU resource.

```js
export interface Texture {
    setImageData(data: TexImageSource | ArrayBufferView[]): void;
}
```

#### createTexture

```js
interface Device {
    createTexture(descriptor: TextureDescriptor): Texture;
}

export interface TextureDescriptor {
    dimension: TextureDimension;
    pixelFormat: Format;
    width: number;
    height: number;
    depth: number;
    numLevels: number;
    usage: TextureUsage;
    pixelStore?: Partial<{
        packAlignment: number,
        unpackAlignment: number,
        unpackFlipY: boolean,
    }>;
}
```

#### setImageData

For example, after loading the image successfully, set the texture content.

```js
const image = new window.Image();
image.onload = () => {
    // Set the texture content as Image
    texture.setImageData(image);
};
image.onerror = () => {};
image.crossOrigin = 'Anonymous';
image.src = src;
```

#### destroy

Frees the Texture resource.

```js
texture.destroy();
```

### Sampler

#### createSampler

```js
interface Device {
    createSampler(descriptor: SamplerDescriptor): Sampler;
}

export interface SamplerDescriptor {
    wrapS: WrapMode;
    wrapT: WrapMode;
    wrapQ?: WrapMode;
    minFilter: TexFilterMode;
    magFilter: TexFilterMode;
    mipFilter: MipFilterMode;
    minLOD?: number;
    maxLOD?: number;
    maxAnisotropy?: number;
    compareMode?: CompareMode;
}
```

#### destroy

Frees the Sampler resource.

```js
sampler.destroy();
```

### RenderTarget

#### createRenderTarget

There are two ways to create.

```js
interface Device {
    createRenderTarget(descriptor: RenderTargetDescriptor): RenderTarget;
    createRenderTargetFromTexture(texture: Texture): RenderTarget;
}

export interface RenderTargetDescriptor {
    pixelFormat: Format;
    width: number;
    height: number;
    sampleCount: number;
    texture?: Texture;
}
```

#### destroy

Frees the RenderTarget resource.

```js
renderTarget.destroy();
```

### Program

#### createProgram

```js
interface Device {
    createProgram(program: ProgramDescriptor): Program;
}

export interface ProgramDescriptor {
    vert?: string;
    frag?: string;
    preprocessedVert?: string;
    preprocessedFrag?: string;
    preprocessedCompute?: string;
}
```

#### destroy

Frees the Program resource.

```js
program.destroy();
```

## GPU-based pickup

Unlike [g-plugin-canvas-picker](/en/plugins/canvas-picker) and [g-plugin-svg-picker](/en/plugins/svg-picker), which are CPU-based picking schemes, we use A GPU-based approach called "color coding".

This approach consists of the following steps.

1. assign a separate "color" to each graph for picking When pickup is needed (triggering [interaction event](/en/api/event) or via [element(s) FromPoint](/en/api/builtin-objects/document#elementsfrompoint) API), use the "color" assigned in the previous step. Use the "color" assigned in the previous step instead of the real color to render into the Framebuffer (size does not need to be full screen, usually only 1x1). Also use [setViewOffset](/en/api/camera#setviewoffset) to set the offset for the camera so that only the pickup area (usually 1x1) needs to be rendered instead of the full screen.
2. read the texture pixel values from the Framebuffer and map them back to the graphics
3. If you need to get all the graphics where the target points overlap together instead of the topmost one (e.g. using [elementsFromPoint](/en/api/builtin-objects/document#elementsfrompoint)), set the pickups of the picked graphics to "Color" is empty. Repeat step 2/3 until no graphics can be picked up
