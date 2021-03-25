import { injectable } from 'inversify';
import { Group } from './Group';

@injectable()
export class GroupPool {
  private pool: Record<string, Group> = {};

  getByName(name: string) {
    return this.pool[name];
  }

  add(name: string, groupOrShape: Group) {
    this.pool[name] = groupOrShape;
  }
}
