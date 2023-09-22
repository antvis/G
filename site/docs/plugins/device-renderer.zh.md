---
title: g-plugin-device-renderer
order: 2
---

提供基于 WebGL 1/2 和 WebGPU 的渲染能力，也包括基于 GPU 的拾取能力。内置 G 核心包提供的全部 2D 基础图形，同时暴露其他自定义 2D/3D 图形的扩展能力。

## 安装方式

`g-webgl` 和 `g-webgpu` 渲染器默认内置，因此无需手动引入。

```js
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
// 创建 WebGL 渲染器，其中内置了该插件
const renderer = new WebGLRenderer();
```

## Device

它代表 GPU 设备（与之相对 Host 通常指指 CPU），提供统一的 HAL 硬件适配层供 WebGL 1/2 和 WebGPU 实现。在设计相关 API 时大量参考了 WebGPU [相关 API](https://www.w3.org/TR/webgpu/)。

由于设备初始化可能为异步操作（例如 WebGPU 的 `adapter.requestDevice()`），因此提供了两种获取 Device 方式：

```js
import { CanvasEvent } from '@antv/g';

// 监听画布准备就绪事件
canvas.addEventListener(CanvasEvent.READY, () => {
    // 通过渲染器获取 Device
    const plugin = renderer.getPlugin('device-renderer');
    const device = plugin.getDevice();
});

// 或者等待画布准备就绪
await canvas.ready;
// 通过渲染器获取 Device
const plugin = renderer.getPlugin('device-renderer');
const device = plugin.getDevice();
```

获取 Device 之后可以使用它创建一系列 GPU 相关的资源，例如 Buffer、Texture 等。

### Buffer

Buffer 代表 GPU 操作中使用的一块内存，在创建时可以指定初始化数据，随后也可以对其中部分数据进行修改。数据以线性布局的方式存储。当需要在 CPU 侧（Host）读取其中的数据时，需要通过 [Readback](/zh/plugins/device-renderer#readback) 完成。

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

创建 Buffer 方式如下，需要指定：

-   viewOrSize 必填，指定初始化数据或者 Buffer 大小
-   usage 必填，内存用途，完全参考 [WebGPU Buffer Usage](https://www.w3.org/TR/webgpu/#buffer-usage)
-   hint 可选，仅 WebGL 环境下生效

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

例如配合 [g-plugin-gpgpu](/zh/plugins/gpgpu) 使用时，用来分配输入和输出 Buffer：

```js
const buffer = device.createBuffer({
    usage: BufferUsage.STORAGE | BufferUsage.COPY_SRC,
    viewOrSize: new Float32Array([1, 2, 3, 4]),
});
```

#### setSubData

-   dstByteOffset 必填，目标 Buffer 中的偏移量，以 Byte 为单位
-   src 必填，类型为 ArrayBufferView
-   srcByteOffset 选填，src 中起始偏移量，以 Byte 为单位
-   byteLength 选填，src 中长度，以 Byte 为单位

例如修改 Uniform 中的某个变量，它位于原始 Buffer 中的第 20 个 bytes：

```js
paramBuffer.setSubData(
    5 * Float32Array.BYTES_PER_ELEMENT,
    new Float32Array([maxDisplace]),
);
```

#### destroy

释放 Buffer 资源。

```js
buffer.destroy();
```

### Readback

有时我们需要在 CPU 侧(Host)读取 GPU 侧(Device) Buffer 或者 Texture 中的数据，此时需要通过 Readback 对象实现，它提供异步读取方法。

#### createReadback

```js
interface Device {
    createReadback(): Readback;
}
```

#### readBuffer

异步读取 Buffer 内容。

-   WebGPU 中通过 [copyBufferToBuffer](https://www.w3.org/TR/webgpu/#dom-gpucommandencoder-copybuffertobuffer) 实现，
-   WebGL2 中通过 [fenceSync](https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext/fenceSync) 实现
-   WebGL1 不支持

参数列表如下：

-   srcBuffer 必填，源 Buffer
-   srcByteOffset 选填，目标 Buffer 起始偏移量，默认为 0，即从头读取
-   dstBuffer 选填，读取内容存放至目标 ArrayBufferView，不填自动创建，最终以结果形式返回
-   dstOffset 选填，目标 ArrayBufferView 偏移量，默认为 0，即从头写入
-   length 选填，读取长度，默认为全部

返回值为读取结果 ArrayBufferView。

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

例如配合 `g-plugin-gpgpu` 使用时，读取计算结果：

```js
const result = await readback.readBuffer(resultBuffer); // Float32Array([...])
```

#### readTexture

读取纹理内容。

-   WebGL1 通过 [readPixels](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/readPixels) 实现
-   WebGL2 中和 readBuffer 一样通过 [fenceSync](https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext/fenceSync) 实现
-   WebGPU 中使用 [copyTextureToBuffer](https://www.w3.org/TR/webgpu/#dom-gpucommandencoder-copytexturetobuffer) 后，再使用 readBuffer 一样的实现方式

参数列表如下：

-   texture 必填，源 Texture
-   x 必填，读取区域起始 X 坐标
-   y 必填，读取区域起始 Y 坐标
-   width 必填，读取区域宽度
-   height 必填，读取区域高度
-   dstBuffer 必填，读取内容存放至目标 ArrayBufferView，最终以结果形式返回
-   dstOffset 选填，目标 ArrayBufferView 偏移量，默认为 0，即从头写入
-   length 选填，读取长度，默认为全部

返回值为读取结果 ArrayBufferView。

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

例如在实现基于 GPU 颜色编码的拾取时：

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

释放 Readback 资源。

```js
readback.destroy();
```

### Texture

纹理是很常用的 GPU 资源。

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

例如在加载图片成功后，设置纹理内容：

```js
const image = new window.Image();
image.onload = () => {
    // 设置纹理内容，以 Image 形式
    texture.setImageData(image);
};
image.onerror = () => {};
image.crossOrigin = 'Anonymous';
image.src = src;
```

#### destroy

释放 Texture 资源。

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

释放 Sampler 资源。

```js
sampler.destroy();
```

### RenderTarget

#### createRenderTarget

有两种方式可以创建：

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

释放 RenderTarget 资源。

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

释放 Program 资源。

```js
program.destroy();
```

## 基于 GPU 的拾取

与 [g-plugin-canvas-picker](/zh/plugins/canvas-picker) 和 [g-plugin-svg-picker](/zh/plugins/svg-picker) 这些基于 CPU 的拾取方案不同，我们使用使用一种基于 GPU 称作“颜色编码”的方式。

该方式包含以下步骤：

1. 为每个图形分配一个独立的用于拾取的“颜色”
2. 当需要拾取时（触发[交互事件](/zh/api/event)或者通过 [element(s)FromPoint](/zh/api/builtin-objects/document#elementsfrompoint) API），使用上一步分配的“颜色”而非真实颜色渲染到 Framebuffer（大小无需全屏，通常只需要 1x1）中。同时使用 [setViewOffset](/zh/api/camera#setviewoffset) 为相机设置偏移量，这样只需要渲染拾取区域（通常是 1x1）而无需渲染全屏
3. 读取 Framebuffer 中纹理像素值，映射回图形
4. 如果需要获取目标点重叠在一起而非最顶部的全部图形（例如使用 [elementsFromPoint](/zh/api/builtin-objects/document#elementsfrompoint)），设置已拾取到图形的拾取“颜色”为空。重复 2/3 步，直至无法拾取到任何图形
