import RBush from 'rbush';
import { RBushNode } from '../components';
import { DisplayObject } from '../DisplayObject';
import { AABB } from '../shapes';

export const RenderingContext = Symbol('RenderingContext');
export interface RenderingContext {
  /**
   * root of scenegraph
   */
  root: DisplayObject<{}>;

  /**
   * force rendering at next frame
   */
  force: boolean;

  /**
   * spatial index with RTree which can speed up the search for AABBs
   */
  rBush: RBush<RBushNode>;

  /**
   * all the entities
   */
  displayObjects: DisplayObject<any>[];
  dirtyRectangle: AABB | undefined;
  dirtyDisplayObjects: DisplayObject<any>[];

  removedAABBs: AABB[];

  /**
   * picked object in last frame
   */
  lastPickedDisplayObject: DisplayObject<any> | undefined;

  cameraDirty: boolean;
}
