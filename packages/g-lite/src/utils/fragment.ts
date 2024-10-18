import { INode } from '../dom';
import { Shape } from '../types';

export function isInFragment(node: INode) {
  if (node.nodeName === Shape.FRAGMENT) return true;
  return node.getRootNode().nodeName === Shape.FRAGMENT;
}
