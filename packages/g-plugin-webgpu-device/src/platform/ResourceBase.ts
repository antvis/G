import type {
  Disposable,
  ResourceBase,
  ResourceType,
} from '@antv/g-plugin-device-renderer';
import EventEmitter from 'eventemitter3';
import type { IDevice_WebGPU } from './interfaces';

export abstract class ResourceBase_WebGPU
  extends EventEmitter
  implements ResourceBase, Disposable
{
  type: ResourceType;

  id: number;

  name: string;

  device: IDevice_WebGPU;

  constructor({ id, device }: { id: number; device: IDevice_WebGPU }) {
    super();
    this.id = id;
    this.device = device;
  }

  destroy() {}
}
