import { singleton } from 'mana-syringe';
import type { DisplayObject } from './display-objects';

@singleton()
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
