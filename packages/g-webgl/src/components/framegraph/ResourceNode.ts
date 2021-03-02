import { PassNode } from './PassNode';
import { ResourceEntry } from './ResourceEntry';

export class ResourceNode {
  public resource: ResourceEntry;

  public writer: PassNode;

  public readerCount: number = 0;

  public version: number;
}
