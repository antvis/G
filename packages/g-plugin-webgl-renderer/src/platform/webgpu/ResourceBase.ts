import { Disposable, ResourceBase, ResourceType } from '../interfaces';
import { IDevice_WebGPU } from './interfaces';

export abstract class ResourceBase_WebGPU implements ResourceBase, Disposable {
  type: ResourceType;

  id: number;

  name: string;

  device: IDevice_WebGPU;

  constructor({ id, device }: { id: number; device: IDevice_WebGPU }) {
    this.id = id;
    this.device = device;
  }

  destroy() {}
}
