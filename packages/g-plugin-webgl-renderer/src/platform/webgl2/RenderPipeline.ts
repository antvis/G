import { Format } from '../format';
import {
  BindingLayoutDescriptor,
  MegaStateDescriptor,
  RenderPipeline,
  RenderPipelineDescriptor,
  ResourceType,
} from '../interfaces';
import { Device_GL } from './Device';
import { InputLayout_GL } from './InputLayout';
import { Program_GL } from './Program';
import { ResourceBase_GL } from './ResourceBase';
import { translatePrimitiveTopology } from './utils';

export interface BindingLayoutTable_GL {
  firstUniformBuffer: number;
  numUniformBuffers: number;
  firstSampler: number;
  numSamplers: number;
}

export interface BindingLayouts_GL {
  numSamplers: number;
  numUniformBuffers: number;
  bindingLayoutTables: BindingLayoutTable_GL[];
}

export class RenderPipeline_GL extends ResourceBase_GL implements RenderPipeline {
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
    this.drawMode = translatePrimitiveTopology(descriptor.topology);
    this.program = descriptor.program as Program_GL;
    this.inputLayout = descriptor.inputLayout as InputLayout_GL | null;

    this.megaState = descriptor.megaStateDescriptor;
    this.colorAttachmentFormats = descriptor.colorAttachmentFormats.slice();
    this.depthStencilAttachmentFormat = descriptor.depthStencilAttachmentFormat;
    this.sampleCount = descriptor.sampleCount;
  }

  private createBindingLayouts(bindingLayouts: BindingLayoutDescriptor[]): BindingLayouts_GL {
    let firstUniformBuffer = 0,
      firstSampler = 0;
    const bindingLayoutTables: BindingLayoutTable_GL[] = [];
    for (let i = 0; i < bindingLayouts.length; i++) {
      const { numUniformBuffers, numSamplers } = bindingLayouts[i];
      bindingLayoutTables.push({
        firstUniformBuffer,
        numUniformBuffers,
        firstSampler,
        numSamplers,
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
