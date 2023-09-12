import type {
  Format,
  MegaStateDescriptor,
  RenderPipeline,
  RenderPipelineDescriptor,
} from '@antv/g-plugin-device-renderer';
import {
  ResourceType,
  PrimitiveTopology,
  defaultMegaState,
  copyMegaState,
} from '@antv/g-plugin-device-renderer';
import type { Device_GL } from './Device';
import type { InputLayout_GL } from './InputLayout';
import type { Program_GL } from './Program';
import { ResourceBase_GL } from './ResourceBase';
import { translatePrimitiveTopology } from './utils';
export class RenderPipeline_GL
  extends ResourceBase_GL
  implements RenderPipeline
{
  type: ResourceType.RenderPipeline = ResourceType.RenderPipeline;

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
}
