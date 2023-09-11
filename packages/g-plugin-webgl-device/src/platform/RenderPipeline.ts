import type {
  Format,
  BindingLayoutDescriptor,
  MegaStateDescriptor,
  RenderPipeline,
  RenderPipelineDescriptor,
} from '@antv/g-plugin-device-renderer';
import {
  defaultBindingLayoutSamplerDescriptor,
  ResourceType,
  assert,
  PrimitiveTopology,
  defaultMegaState,
  copyMegaState,
} from '@antv/g-plugin-device-renderer';
import type { Device_GL } from './Device';
import type { InputLayout_GL } from './InputLayout';
import type { BindingLayoutSamplerDescriptor_GL } from './interfaces';
import type { Program_GL } from './Program';
import { ResourceBase_GL } from './ResourceBase';
import { translatePrimitiveTopology, translateTextureDimension } from './utils';

export interface BindingLayoutTable_GL {
  firstUniformBuffer: number;
  numUniformBuffers: number;
  firstSampler: number;
  numSamplers: number;
  samplerEntries: BindingLayoutSamplerDescriptor_GL[];
}

export interface BindingLayouts_GL {
  numSamplers: number;
  numUniformBuffers: number;
  bindingLayoutTables: BindingLayoutTable_GL[];
}

export class RenderPipeline_GL
  extends ResourceBase_GL
  implements RenderPipeline
{
  type: ResourceType.RenderPipeline = ResourceType.RenderPipeline;

  bindingLayouts: BindingLayouts_GL;
  program: Program_GL;
  drawMode: GLenum;
  megaState: MegaStateDescriptor;
  inputLayout: InputLayout_GL | null;

  // Attachment data.
  colorAttachmentFormats: (Format | null)[];
  depthStencilAttachmentFormat: Format | null;
  sampleCount: number;

  constructor({
    id,
    device,
    descriptor,
  }: {
    id: number;
    device: Device_GL;
    descriptor: RenderPipelineDescriptor;
  }) {
    super({ id, device });

    this.bindingLayouts = this.createBindingLayouts(descriptor.bindingLayouts);
    this.drawMode = translatePrimitiveTopology(
      descriptor.topology ?? PrimitiveTopology.TRIANGLES,
    );
    this.program = descriptor.program as Program_GL;
    this.inputLayout = descriptor.inputLayout as InputLayout_GL | null;

    this.megaState = {
      ...copyMegaState(defaultMegaState),
      ...descriptor.megaStateDescriptor,
    };

    this.colorAttachmentFormats = descriptor.colorAttachmentFormats.slice();
    this.depthStencilAttachmentFormat = descriptor.depthStencilAttachmentFormat;
    this.sampleCount = descriptor.sampleCount ?? 1;
  }

  private createBindingLayouts(
    bindingLayouts: BindingLayoutDescriptor[] = [],
  ): BindingLayouts_GL {
    let firstUniformBuffer = 0;
    let firstSampler = 0;
    const bindingLayoutTables: BindingLayoutTable_GL[] = [];
    for (let i = 0; i < bindingLayouts.length; i++) {
      const { numUniformBuffers, numSamplers, samplerEntries } =
        bindingLayouts[i];

      const bindingSamplerEntries: BindingLayoutSamplerDescriptor_GL[] = [];

      if (samplerEntries !== undefined) {
        assert(samplerEntries.length === numSamplers);
      }

      for (let j = 0; j < numSamplers; j++) {
        const samplerEntry =
          samplerEntries !== undefined
            ? samplerEntries[j]
            : defaultBindingLayoutSamplerDescriptor;
        const { dimension, formatKind } = samplerEntry;
        bindingSamplerEntries.push({
          gl_target: translateTextureDimension(dimension),
          formatKind,
        });
      }

      bindingLayoutTables.push({
        firstUniformBuffer,
        numUniformBuffers,
        firstSampler,
        numSamplers,
        samplerEntries: bindingSamplerEntries,
      });
      firstUniformBuffer += numUniformBuffers;
      firstSampler += numSamplers;
    }
    return {
      numUniformBuffers: firstUniformBuffer,
      numSamplers: firstSampler,
      bindingLayoutTables,
    };
  }
}
