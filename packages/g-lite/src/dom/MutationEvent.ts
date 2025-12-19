import { FederatedEvent } from './FederatedEvent';
import type { ElementEvent } from './interfaces';
import type { Node } from './Node';

/**
 * @deprecated https://developer.chrome.com/blog/mutation-events-deprecation
 */
export class MutationEvent extends FederatedEvent {
  static readonly ADDITION: number = 2;
  static readonly MODIFICATION: number = 1;
  static readonly REMOVAL: number = 3;

  constructor(
    typeArg: ElementEvent,
    public relatedNode: Node,
    public prevValue: any,
    public newValue: any,
    public attrName: string,
    public attrChange: number,
    public prevParsedValue: any,
    public newParsedValue: any,
  ) {
    super(null);

    this.type = typeArg;
  }
}
