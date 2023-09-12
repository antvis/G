import {
  Bindings,
  Buffer,
  IndexBufferDescriptor,
  InputLayout,
  RenderPass,
  RenderPassDescriptor,
  RenderPipeline,
  VertexBufferDescriptor,
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

      this.gfxColorAttachmentLevel[i] =
        descriptor.colorAttachmentLevel?.[i] || 0;
      this.gfxColorResolveToLevel[i] = descriptor.colorResolveToLevel?.[i] || 0;

      if (colorAttachment !== null) {
        if (this.gpuColorAttachments[i] === undefined) {
          this.gpuColorAttachments[i] = {} as GPURenderPassColorAttachment;
        }

        const dstAttachment = this.gpuColorAttachments[i];
        dstAttachment.view = this.getTextureView(
          colorAttachment,
          this.gfxColorAttachmentLevel?.[i] || 0,
        );
        const clearColor = descriptor.colorClearColor?.[i] ?? 'load';
        if (clearColor === 'load') {
          dstAttachment.loadOp = 'load';
        } else {
          dstAttachment.loadOp = 'clear';
          dstAttachment.clearValue = clearColor;
        }
        dstAttachment.storeOp = descriptor.colorStore?.[i]
          ? 'store'
          : 'discard';
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

    if (descriptor.depthStencilAttachment) {
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

    this.gpuRenderPassDescriptor.occlusionQuerySet = !isNil(
      descriptor.occlusionQueryPool,
    )
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

  setVertexInput(
    inputLayout_: InputLayout | null,
    vertexBuffers: (VertexBufferDescriptor | null)[] | null,
    indexBuffer: IndexBufferDescriptor | null,
  ): void {
    if (inputLayout_ === null) return;

    const inputLayout = inputLayout_ as InputLayout_WebGPU;
    if (indexBuffer !== null)
      this.gpuRenderPassEncoder.setIndexBuffer(
        getPlatformBuffer(indexBuffer.buffer),
        assertExists(inputLayout.indexFormat),
        indexBuffer.byteOffset,
      );

    for (let i = 0; i < vertexBuffers!.length; i++) {
      const b = vertexBuffers![i];
      if (b === null) continue;
      this.gpuRenderPassEncoder.setVertexBuffer(
        i,
        getPlatformBuffer(b.buffer),
        b.byteOffset,
      );
    }
  }

  setBindings(bindings_: Bindings, dynamicByteOffsets?: number[]): void {
    const bindings = bindings_ as Bindings_WebGPU;
    this.gpuRenderPassEncoder.setBindGroup(
      0,
      bindings.gpuBindGroup[0],
      dynamicByteOffsets &&
        dynamicByteOffsets.slice(0, bindings.numUniformBuffers),
    );
    if (bindings.gpuBindGroup[1]) {
      this.gpuRenderPassEncoder.setBindGroup(1, bindings.gpuBindGroup[1]);
    }
  }

  setStencilRef(ref: number): void {
    this.gpuRenderPassEncoder.setStencilReference(ref);
  }

  /**
   * @see https://www.w3.org/TR/webgpu/#dom-gpurendercommandsmixin-draw
   */
  draw(
    vertexCount: number,
    instanceCount?: number,
    firstVertex?: number,
    firstInstance?: number,
  ) {
    this.gpuRenderPassEncoder.draw(
      vertexCount,
      instanceCount,
      firstVertex,
      firstInstance,
    );
  }
  /**
   * @see https://www.w3.org/TR/webgpu/#dom-gpurendercommandsmixin-drawindexed
   */
  drawIndexed(
    indexCount: number,
    instanceCount?: number,
    firstIndex?: number,
    baseVertex?: number,
    firstInstance?: number,
  ) {
    this.gpuRenderPassEncoder.drawIndexed(
      indexCount,
      instanceCount,
      firstIndex,
      baseVertex,
      firstInstance,
    );
  }
  /**
   * @see https://www.w3.org/TR/webgpu/#dom-gpurendercommandsmixin-drawindirect
   */
  drawIndirect(indirectBuffer: Buffer, indirectOffset: number) {
    // TODO
  }

  beginOcclusionQuery(dstOffs: number): void {
    this.gpuRenderPassEncoder.beginOcclusionQuery(dstOffs);
  }

  endOcclusionQuery(dstOffs: number): void {
    this.gpuRenderPassEncoder.endOcclusionQuery();
  }

  pushDebugGroup(name: string): void {
    this.gpuRenderPassEncoder.pushDebugGroup(name);
  }

  popDebugGroup(): void {
    this.gpuRenderPassEncoder.popDebugGroup();
  }

  insertDebugMarker(markerLabel: string) {
    this.gpuRenderPassEncoder.insertDebugMarker(markerLabel);
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

    if (this.gfxDepthStencilAttachment && this.gfxDepthStencilResolveTo) {
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
