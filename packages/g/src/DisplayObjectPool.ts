import { injectable } from 'inversify';
import type { DisplayObject } from './DisplayObject';

@injectable()
export class DisplayObjectPool {
  private pool: Record<string, DisplayObject<any>> = {};

  getByName(name: string): DisplayObject<any> {
    return this.pool[name];
  }

  add(name: string, groupOrShape: DisplayObject<any>) {
    this.pool[name] = groupOrShape;
  }
}
