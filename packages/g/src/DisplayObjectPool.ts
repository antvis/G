import { injectable } from 'inversify';
import type { DisplayObject } from './display-objects';

@injectable()
export class DisplayObjectPool {
  private pool: Record<string, DisplayObject> = {};

  getByName(name: string): DisplayObject {
    return this.pool[name];
  }

  add(name: string, groupOrShape: DisplayObject) {
    this.pool[name] = groupOrShape;
  }

  remove(name: string) {
    delete this.pool[name];
  }
}
