import { RenderPass, RenderPassDescriptor, RenderPipeline, InputState, Bindings } from '..';
import { assert, assertExists } from '../utils';
import { Bindings_WebGPU } from './Bindings';
import { GPUTextureUsage } from './constants';
import { InputLayout_WebGPU } from './InputLayout';
import { InputState_WebGPU } from './InputState';
import { Attachment_WebGPU, TextureShared_WebGPU } from './interfaces';
import { RenderPipeline_WebGPU } from './RenderPipeline';
import { Texture_WebGPU } from './Texture';
import { getPlatformBuffer } from './utils';

export class RenderPass_WebGPU implements RenderPass {
  commandEncoder: GPUCommandEncoder | null = null;
  descriptor: RenderPassDescriptor;
  private gpuRenderPassEncoder: GPURenderPassEncoder | null = null;
  private gpuRenderPassDescriptor: GPURenderPassDescriptor;
  private gpuColorAttachments: GPURenderPassColorAttachment[];
  private gpuDepthStencilAttachment: GPURenderPassDepthStencilAttachment;
  private gfxColorAttachment: (TextureShared_WebGPU | null)[] = [];
  private gfxColorResolveTo: (TextureShared_WebGPU | null)[] = [];
  private debugPointer: any;

  constructor() {
    // FIXME: alloc attachment according to descriptor
    this.gpuColorAttachments = [
      {
        view: null!,
        loadValue: 'load',
        storeOp: 'store',
      },
      {
        view: null!,
        loadValue: 'load',
        storeOp: 'store',
      },
    ];

    this.gpuDepthStencilAttachment = {
      view: null!,
      depthLoadValue: 'load',
      depthStoreOp: 'store',
      stencilLoadValue: 'load',
      stencilStoreOp: 'store',
    };

    this.gpuRenderPassDescriptor = {
      colorAttachments: this.gpuColorAttachments,
      depthStencilAttachment: this.gpuDepthStencilAttachment,
    };
  }

  private setRenderPassDescriptor(descriptor: RenderPassDescriptor): void {
    this.descriptor = descriptor;

    this.gpuRenderPassDescriptor.colorAttachments = this.gpuColorAttachments;

    const numColorAttachments = descriptor.colorAttachment.length;
    this.gfxColorAttachment.length = numColorAttachments;
    this.gfxColorResolveTo.length = numColorAttachments;
    for (let i = 0; i < descriptor.colorAttachment.length; i++) {
      let colorAttachment: TextureShared_WebGPU | null = descriptor.colorAttachment[
        i
      ] as Attachment_WebGPU;
      let colorResolveTo: TextureShared_WebGPU | null = descriptor.colorResolveTo[
        i
      ] as Texture_WebGPU;

      // Do some dumb juggling...
      if (colorAttachment === null && colorResolveTo !== null) {
        colorAttachment = colorResolveTo as Texture_WebGPU;
        colorResolveTo = null;
      }

      if (colorAttachment !== null) {
        const dstAttachment = this.gpuColorAttachments[i];
        dstAttachment.view = colorAttachment.gpuTextureView;
        dstAttachment.loadValue = descriptor.colorClearColor[i];
        dstAttachment.storeOp = 'store';
        dstAttachment.resolveTarget = undefined;
        if (colorResolveTo !== null && colorAttachment.sampleCount > 1)
          dstAttachment.resolveTarget = colorResolveTo.gpuTextureView;
      } else {
        // https://github.com/gpuweb/gpuweb/issues/1250
        this.gpuColorAttachments.length = i;
        this.gfxColorAttachment.length = i;
        this.gfxColorResolveTo.length = i;
        break;
      }

      this.gfxColorAttachment[i] = colorAttachment;
      this.gfxColorResolveTo[i] = colorResolveTo;
    }

    if (descriptor.depthStencilAttachment !== null) {
      const dsAttachment = descriptor.depthStencilAttachment as Attachment_WebGPU;
      const dstAttachment = this.gpuDepthStencilAttachment;
      dstAttachment.view = dsAttachment.gpuTextureView;
      dstAttachment.depthLoadValue = descriptor.depthClearValue;
      dstAttachment.stencilLoadValue = descriptor.stencilClearValue;
      dstAttachment.depthStoreOp = 'store';
      dstAttachment.stencilStoreOp = 'store';
      this.gpuRenderPassDescriptor.depthStencilAttachment = this.gpuDepthStencilAttachment;
    } else {
      this.gpuRenderPassDescriptor.depthStencilAttachment = undefined;
    }
  }

  beginRenderPass(renderPassDescriptor: RenderPassDescriptor): void {
    assert(this.gpuRenderPassEncoder === null);
    this.setRenderPassDescriptor(renderPassDescriptor);
    this.gpuRenderPassEncoder = this.commandEncoder.beginRenderPass(this.gpuRenderPassDescriptor);
  }

  setViewport(x: number, y: number, w: number, h: number): void {
    this.gpuRenderPassEncoder.setViewport(x, y, w, h, 0, 1);
  }

  setScissor(x: number, y: number, w: number, h: number): void {
    this.gpuRenderPassEncoder.setScissorRect(x, y, w, h);
  }

  setPipeline(pipeline_: RenderPipeline): void {
    const pipeline = pipeline_ as RenderPipeline_WebGPU;
    const gpuRenderPipeline = assertExists(pipeline.gpuRenderPipeline);
    this.gpuRenderPassEncoder.setPipeline(gpuRenderPipeline);
  }

  setInputState(inputState_: InputState | null): void {
    if (inputState_ === null) return;

    const inputState = inputState_ as InputState_WebGPU;
    if (inputState.indexBuffer !== null) {
      const inputLayout = inputState.inputLayout as InputLayout_WebGPU;
      const indexBuffer = inputState.indexBuffer;
      this.gpuRenderPassEncoder.setIndexBuffer(
        getPlatformBuffer(indexBuffer.buffer),
        assertExists(inputLayout.indexFormat),
        indexBuffer.byteOffset,
      );
    }

    for (let i = 0; i < inputState.vertexBuffers.length; i++) {
      const b = inputState.vertexBuffers[i];
      if (b === null) continue;
      this.gpuRenderPassEncoder.setVertexBuffer(i, getPlatformBuffer(b.buffer), b.byteOffset);
    }
  }

  setBindings(bindingLayoutIndex: number, bindings_: Bindings, dynamicByteOffsets: number[]): void {
    const bindings = bindings_ as Bindings_WebGPU;
    this.gpuRenderPassEncoder.setBindGroup(
      bindingLayoutIndex + 0,
      bindings.gpuBindGroup[0],
      dynamicByteOffsets.slice(0, bindings.bindingLayout.numUniformBuffers),
    );
    this.gpuRenderPassEncoder.setBindGroup(bindingLayoutIndex + 1, bindings.gpuBindGroup[1]);
  }

  setStencilRef(ref: number): void {
    this.gpuRenderPassEncoder.setStencilReference(ref);
  }

  draw(vertexCount: number, firstVertex: number): void {
    this.gpuRenderPassEncoder.draw(vertexCount, 1, firstVertex, 0);
  }

  drawIndexed(indexCount: number, firstIndex: number): void {
    this.gpuRenderPassEncoder.drawIndexed(indexCount, 1, firstIndex, 0, 0);
  }

  drawIndexedInstanced(indexCount: number, firstIndex: number, instanceCount: number): void {
    this.gpuRenderPassEncoder.drawIndexed(indexCount, instanceCount, firstIndex, 0, 0);
  }

  setDebugPointer(value: any): void {
    this.debugPointer = value;
  }

  finish(): GPUCommandBuffer {
    this.gpuRenderPassEncoder.endPass();
    this.gpuRenderPassEncoder = null;

    // Fake a resolve with a copy for non-MSAA.
    for (let i = 0; i < this.gfxColorAttachment.length; i++) {
      const colorAttachment = this.gfxColorAttachment[i];
      const colorResolveTo = this.gfxColorResolveTo[i];

      if (
        colorAttachment !== null &&
        colorResolveTo !== null &&
        colorAttachment.sampleCount === 1
      ) {
        const srcCopy: GPUImageCopyTexture = { texture: colorAttachment.gpuTexture };
        const dstCopy: GPUImageCopyTexture = { texture: colorResolveTo.gpuTexture };
        assert(colorAttachment.width === colorResolveTo.width);
        assert(colorAttachment.height === colorResolveTo.height);
        assert(!!(colorAttachment.usage & GPUTextureUsage.COPY_SRC));
        assert(!!(colorResolveTo.usage & GPUTextureUsage.COPY_DST));
        this.commandEncoder.copyTextureToTexture(srcCopy, dstCopy, [
          colorResolveTo.width,
          colorResolveTo.height,
          1,
        ]);
      }
    }

    return this.commandEncoder.finish();
  }
}
