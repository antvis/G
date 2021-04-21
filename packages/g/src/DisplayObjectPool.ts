import { injectable } from 'inversify';
import { DisplayObject } from './DisplayObject';

@injectable()
export class DisplayObjectPool {
  private pool: Record<string, DisplayObject> = {};

  getByName(name: string) {
    return this.pool[name];
  }

  add(name: string, groupOrShape: DisplayObject) {
    this.pool[name] = groupOrShape;
  }
}
