import { singleton } from 'mana-syringe';
import type { DisplayObject, HTML } from './display-objects';
import { Shape } from './types';

const pool: Record<number, DisplayObject> = {};
const htmlPool: HTML[] = [];

@singleton()
export class DisplayObjectPool {
  getByEntity(entity: number): DisplayObject {
    return pool[entity];
  }

  getAll() {
    return Object.keys(pool).map((entity) => pool[entity]);
  }

  add(entity: number, groupOrShape: DisplayObject) {
    pool[entity] = groupOrShape;

    if (groupOrShape.nodeName === Shape.HTML) {
      htmlPool.push(groupOrShape as HTML);
    }
  }

  remove(entity: number) {
    const existed = pool[entity];
    delete pool[entity];

    if (existed.nodeName === Shape.HTML) {
      const index = htmlPool.indexOf(existed as HTML);
      htmlPool.splice(index, 1);
    }
  }

  getHTMLs(): HTML[] {
    return htmlPool;
  }
}
