import { Shape } from '../types';
import type { DisplayObject, HTML } from './';

const pool: Record<number, DisplayObject> = {};
const htmlPool: HTML[] = [];
export class DisplayObjectPool {
  getByEntity(entity: string | number): DisplayObject {
    return pool[entity];
  }

  getAll() {
    return Object.keys(pool).map((entity) => pool[entity]);
  }

  add(entity: string | number, groupOrShape: DisplayObject) {
    pool[entity] = groupOrShape;

    if (groupOrShape.nodeName === Shape.HTML) {
      htmlPool.push(groupOrShape as HTML);
    }
  }

  remove(entity: number) {
    const existed = pool[entity];

    if (existed) {
      delete pool[entity];
      if (existed.nodeName === Shape.HTML) {
        const index = htmlPool.indexOf(existed as HTML);
        htmlPool.splice(index, 1);
      }
    }
  }

  getHTMLs(): HTML[] {
    return htmlPool;
  }
}
