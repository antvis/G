import {
  Bindings,
  InputState,
  RenderPass,
  RenderPassDescriptor,
  RenderPipeline,
} from '@antv/g-plugin-device-renderer';
import {
  assert,
  assertExists,
  FormatFlags,
  getFormatFlags,
} from '@antv/g-plugin-device-renderer';
import { isNil } from '@antv/util';
import type { Bindings_WebGPU } from './Bindings';
import { GPUTextureUsage } from './constants';
import type { InputLayout_WebGPU } from './InputLayout';
import type { InputState_WebGPU } from './InputState';
import type { Attachment_WebGPU, TextureShared_WebGPU } from './interfaces';
import type { RenderPipeline_WebGPU } from './RenderPipeline';
import type { Texture_WebGPU } from './Texture';
import { getPlatformBuffer, getPlatformQuerySet } from './utils';

export class RenderPass_WebGPU implements RenderPass {
  commandEncoder: GPUCommandEncoder | null = null;
  descriptor: RenderPassDescriptor;
  private gpuRenderPassEncoder: GPURenderPassEncoder | null = null;
  private gpuRenderPassDescriptor: GPURenderPassDescriptor;
  private gpuColorAttachments: GPURenderPassColorAttachment[];
  private gpuDepthStencilAttachment: GPURenderPassDepthStencilAttachment;
  private gfxColorAttachment: (TextureShared_WebGPU | null)[] = [];
  private gfxColorAttachmentLevel: number[] = [];
  private gfxColorResolveTo: (TextureShared_WebGPU | null)[] = [];
  private gfxColorResolveToLevel: number[] = [];
  private gfxDepthStencilAttachment: TextureShared_WebGPU | null = null;
  private gfxDepthStencilResolveTo: TextureShared_WebGPU | null = null;

  constructor() {
    this.gpuColorAttachments = [];

    this.gpuDepthStencilAttachment = {
      view: null,
      depthLoadOp: 'load',
      depthStoreOp: 'store',
      stencilLoadOp: 'load',
      stencilStoreOp: 'store',
    };

    this.gpuRenderPassDescriptor = {
      colorAttachments: this.gpuColorAttachments,
      depthStencilAttachment: this.gpuDepthStencilAttachment,
    };
  }

  private getTextureView(
    target: TextureShared_WebGPU,
    level: number,
  ): GPUTextureView {
    assert(level < target.numLevels);
    if (target.numLevels === 1) return target.gpuTextureView;
    else
      return target.gpuTexture.createView({
        baseMipLevel: level,
        mipLevelCount: 1,
      });
  }

  private setRenderPassDescriptor(descriptor: RenderPassDescriptor): void {
    this.descriptor = descriptor;

    this.gpuRenderPassDescriptor.colorAttachments = this.gpuColorAttachments;

    const numColorAttachments = descriptor.colorAttachment.length;
    this.gfxColorAttachment.length = numColorAttachments;
    this.gfxColorResolveTo.length = numColorAttachments;
    for (let i = 0; i < descriptor.colorAttachment.length; i++) {
      let colorAttachment: TextureShared_WebGPU | null = descriptor
        .colorAttachment[i] as unknown as Attachment_WebGPU;
      let colorResolveTo: TextureShared_WebGPU | null = descriptor
        .colorResolveTo[i] as Texture_WebGPU;

      // Do some dumb juggling...
      if (colorAttachment === null && colorResolveTo !== null) {
        colorAttachment = colorResolveTo as Texture_WebGPU;
        colorResolveTo = null;
      }

      this.gfxColorAttachment[i] = colorAttachment;
      this.gfxColorResolveTo[i] = colorResolveTo;

      this.gfxColorAttachmentLevel[i] = descriptor.colorAttachmentLevel[i];
      this.gfxColorResolveToLevel[i] = descriptor.colorResolveToLevel[i];

      if (colorAttachment !== null) {
        if (this.gpuColorAttachments[i] === undefined) {
          this.gpuColorAttachments[i] = {} as GPURenderPassColorAttachment;
        }

        const dstAttachment = this.gpuColorAttachments[i];
        dstAttachment.view = this.getTextureView(
          colorAttachment,
          this.gfxColorAttachmentLevel[i],
        );
        const clearColor = descriptor.colorClearColor[i];
        if (clearColor === 'load') {
          dstAttachment.loadOp = 'load';
        } else {
          dstAttachment.loadOp = 'clear';
          dstAttachment.clearValue = clearColor;
        }
        dstAttachment.storeOp = descriptor.colorStore[i] ? 'store' : 'discard';
        dstAttachment.resolveTarget = undefined;
        if (colorResolveTo !== null) {
          if (colorAttachment.sampleCount > 1) {
            dstAttachment.resolveTarget = this.getTextureView(
              colorResolveTo,
              this.gfxColorResolveToLevel[i],
            );
          } else {
            dstAttachment.storeOp = 'store';
          }
        }
      } else {
        // https://github.com/gpuweb/gpuweb/issues/1250
        this.gpuColorAttachments.length = i;
        this.gfxColorAttachment.length = i;
        this.gfxColorResolveTo.length = i;
        break;
      }
    }

    this.gfxDepthStencilAttachment =
      descriptor.depthStencilAttachment as unknown as Attachment_WebGPU;
    this.gfxDepthStencilResolveTo =
      descriptor.depthStencilResolveTo as Texture_WebGPU;

    if (descriptor.depthStencilAttachment !== null) {
      const dsAttachment =
        descriptor.depthStencilAttachment as unknown as Attachment_WebGPU;
      const dstAttachment = this.gpuDepthStencilAttachment;
      dstAttachment.view = dsAttachment.gpuTextureView;

      const hasDepth = !!(
        getFormatFlags(dsAttachment.pixelFormat) & FormatFlags.Depth
      );
      if (hasDepth) {
        if (descriptor.depthClearValue === 'load') {
          dstAttachment.depthLoadOp = 'load';
        } else {
          dstAttachment.depthLoadOp = 'clear';
          dstAttachment.depthClearValue = descriptor.depthClearValue;
        }

        if (
          descriptor.depthStencilStore ||
          this.gfxDepthStencilResolveTo !== null
        )
          dstAttachment.depthStoreOp = 'store';
        else dstAttachment.depthStoreOp = 'discard';
      } else {
        dstAttachment.depthLoadOp = undefined;
        dstAttachment.depthStoreOp = undefined;
      }

      const hasStencil = !!(
        getFormatFlags(dsAttachment.pixelFormat) & FormatFlags.Stencil
      );
      if (hasStencil) {
        if (descriptor.stencilClearValue === 'load') {
          dstAttachment.stencilLoadOp = 'load';
        } else {
          dstAttachment.stencilLoadOp = 'clear';
          dstAttachment.stencilClearValue = descriptor.stencilClearValue;
        }

        if (
          descriptor.depthStencilStore ||
          this.gfxDepthStencilResolveTo !== null
        )
          dstAttachment.stencilStoreOp = 'store';
        else dstAttachment.stencilStoreOp = 'discard';
      } else {
        dstAttachment.stencilLoadOp = undefined;
        dstAttachment.stencilStoreOp = undefined;
      }

      this.gpuRenderPassDescriptor.depthStencilAttachment =
        this.gpuDepthStencilAttachment;
    } else {
      this.gpuRenderPassDescriptor.depthStencilAttachment = undefined;
    }

    this.gpuRenderPassDescriptor.occlusionQuerySet =
      descriptor.occlusionQueryPool !== null
        ? getPlatformQuerySet(descriptor.occlusionQueryPool)
        : undefined;
  }

  beginRenderPass(renderPassDescriptor: RenderPassDescriptor): void {
    assert(this.gpuRenderPassEncoder === null);
    this.setRenderPassDescriptor(renderPassDescriptor);
    this.gpuRenderPassEncoder = this.commandEncoder.beginRenderPass(
      this.gpuRenderPassDescriptor,
    );
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
      if (isNil(b)) continue;
      this.gpuRenderPassEncoder.setVertexBuffer(
        i,
        getPlatformBuffer(b.buffer),
        b.byteOffset,
      );
    }
  }

  setBindings(
    bindingLayoutIndex: number,
    bindings_: Bindings,
    dynamicByteOffsets: number[],
  ): void {
    const bindings = bindings_ as Bindings_WebGPU;
    this.gpuRenderPassEncoder.setBindGroup(
      bindingLayoutIndex + 0,
      bindings.gpuBindGroup[0],
      dynamicByteOffsets.slice(0, bindings.bindingLayout.numUniformBuffers),
    );
    if (bindings.gpuBindGroup[1]) {
      this.gpuRenderPassEncoder.setBindGroup(
        bindingLayoutIndex + 1,
        bindings.gpuBindGroup[1],
      );
    }
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

  drawIndexedInstanced(
    indexCount: number,
    firstIndex: number,
    instanceCount: number,
  ): void {
    this.gpuRenderPassEncoder.drawIndexed(
      indexCount,
      instanceCount,
      firstIndex,
      0,
      0,
    );
  }

  beginOcclusionQuery(dstOffs: number): void {
    this.gpuRenderPassEncoder.beginOcclusionQuery(dstOffs);
  }

  endOcclusionQuery(dstOffs: number): void {
    this.gpuRenderPassEncoder.endOcclusionQuery();
  }

  beginDebugGroup(name: string): void {
    // FIREFOX MISSING
    if (this.gpuRenderPassEncoder.pushDebugGroup === undefined) return;

    this.gpuRenderPassEncoder.pushDebugGroup(name);
  }

  endDebugGroup(): void {
    // FIREFOX MISSING
    if (this.gpuRenderPassEncoder.popDebugGroup === undefined) return;

    this.gpuRenderPassEncoder.popDebugGroup();
  }

  finish(): GPUCommandBuffer {
    this.gpuRenderPassEncoder.end();
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
        this.copyAttachment(
          colorResolveTo,
          this.gfxColorAttachmentLevel[i],
          colorAttachment,
          this.gfxColorResolveToLevel[i],
        );
      }
    }

    if (
      this.gfxDepthStencilAttachment !== null &&
      this.gfxDepthStencilResolveTo !== null
    ) {
      if (this.gfxDepthStencilAttachment.sampleCount > 1) {
        // TODO(jstpierre): MSAA depth resolve (requires shader)
      } else {
        this.copyAttachment(
          this.gfxDepthStencilResolveTo,
          0,
          this.gfxDepthStencilAttachment,
          0,
        );
      }
    }

    return this.commandEncoder.finish();
  }

  private copyAttachment(
    dst: TextureShared_WebGPU,
    dstLevel: number,
    src: TextureShared_WebGPU,
    srcLevel: number,
  ): void {
    assert(src.sampleCount === 1);
    const srcCopy: GPUImageCopyTexture = {
      texture: src.gpuTexture,
      mipLevel: srcLevel,
    };
    const dstCopy: GPUImageCopyTexture = {
      texture: dst.gpuTexture,
      mipLevel: dstLevel,
    };
    assert(src.width >>> srcLevel === dst.width >>> dstLevel);
    assert(src.height >>> srcLevel === dst.height >>> dstLevel);
    assert(!!(src.usage & GPUTextureUsage.COPY_SRC));
    assert(!!(dst.usage & GPUTextureUsage.COPY_DST));
    this.commandEncoder.copyTextureToTexture(srcCopy, dstCopy, [
      dst.width,
      dst.height,
      1,
    ]);
  }
}
