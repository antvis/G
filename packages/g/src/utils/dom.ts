import type { IEventTarget, INode, IElement } from '../dom';

export function isNode(target: IEventTarget | INode): target is INode {
  return !!(target as INode).childNodes;
}

export function isElement(target: IEventTarget | INode | IElement): target is IElement {
  return !!(target as IElement).getAttribute;
}
