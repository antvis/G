import { DisplayObject } from '../display-objects';

/**
 * Legacy interface for backward compatibility.
 * Will be removed in future versions.
 * @deprecated
 */
export interface RBushNodeAABB {
  displayObject: DisplayObject;
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

/**
 * Legacy interface for backward compatibility.
 * Will be removed in future versions.
 * @deprecated
 */
export interface RBushNode {
  aabb?: RBushNodeAABB;
}
