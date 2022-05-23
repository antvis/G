import { singleton } from 'mana-syringe';
import type { DisplayObject, HTML } from './display-objects';
import { Shape } from './types';

@singleton()
export class DisplayObjectPool {
  private pool: Record<number, DisplayObject> = {};
  private htmlPool: HTML[] = [];

  getByEntity(entity: number): DisplayObject {
    return this.pool[entity];
  }

  add(entity: number, groupOrShape: DisplayObject) {
    this.pool[entity] = groupOrShape;

    if (groupOrShape.nodeName === Shape.HTML) {
      this.htmlPool.push(groupOrShape as HTML);
    }
  }

  remove(entity: number) {
    const existed = this.pool[entity];
    delete this.pool[entity];

    if (existed.nodeName === Shape.HTML) {
      const index = this.htmlPool.indexOf(existed as HTML);
      this.htmlPool.splice(index, 1);
    }
  }

  getHTMLs(): HTML[] {
    return this.htmlPool;
  }
}
