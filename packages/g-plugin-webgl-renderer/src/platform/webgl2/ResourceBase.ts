import { Disposable, Resource, ResourceBase, ResourceType } from '../interfaces';
import { Device_GL } from './Device';

export class ResourceBase_GL implements ResourceBase, Disposable {
  id: number;

  name: string;

  device: Device_GL;

  constructor({ id, device }: { id: number; device: Device_GL }) {
    this.id = id;
    this.device = device;

    if (this.device.resourceCreationTracker !== null) {
      this.device.resourceCreationTracker.trackResourceCreated(this as unknown as Resource);
    }
  }

  destroy() {
    if (this.device.resourceCreationTracker !== null) {
      this.device.resourceCreationTracker.trackResourceDestroyed(this as unknown as Resource);
    }
  }
}
