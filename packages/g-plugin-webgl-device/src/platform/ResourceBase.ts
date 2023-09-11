import type {
  Disposable,
  Resource,
  ResourceBase,
} from '@antv/g-plugin-device-renderer';
import EventEmitter from 'eventemitter3';
import type { Device_GL } from './Device';

export class ResourceBase_GL
  extends EventEmitter
  implements ResourceBase, Disposable
{
  id: number;

  name: string;

  device: Device_GL;

  constructor({ id, device }: { id: number; device: Device_GL }) {
    super();

    this.id = id;
    this.device = device;

    if (this.device['resourceCreationTracker'] !== null) {
      this.device['resourceCreationTracker'].trackResourceCreated(
        this as unknown as Resource,
      );
    }
  }

  destroy() {
    if (this.device['resourceCreationTracker'] !== null) {
      this.device['resourceCreationTracker'].trackResourceDestroyed(
        this as unknown as Resource,
      );
    }
  }
}
