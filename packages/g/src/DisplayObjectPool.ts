import { singleton } from 'mana-syringe';
import type { DisplayObject } from './display-objects';

@singleton()
export class DisplayObjectPool {
  private pool: Record<number, DisplayObject> = {};

  getByEntity(entity: number): DisplayObject {
    return this.pool[entity];
  }

  add(entity: number, groupOrShape: DisplayObject) {
    this.pool[entity] = groupOrShape;
  }

  remove(entity: number) {
    delete this.pool[entity];
  }
}
