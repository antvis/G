import type {
  ComputePipeline,
  ComputePipelineDescriptor,
} from '@antv/g-plugin-device-renderer';
import { ResourceType } from '@antv/g-plugin-device-renderer';
// import type { Program_GL } from './Program';
import type { Device_GL } from './Device';
import { ResourceBase_GL } from './ResourceBase';

export class ComputePipeline_GL
  extends ResourceBase_GL
  implements ComputePipeline
{
  type: ResourceType.ComputePipeline = ResourceType.ComputePipeline;

  descriptor: ComputePipelineDescriptor;

  constructor({
    id,
    device,
    descriptor,
  }: {
    id: number;
    device: Device_GL;
    descriptor: ComputePipelineDescriptor;
  }) {
    super({ id, device });

    this.descriptor = descriptor;

    // const program = descriptor.program as Program_GL;
  }
}
