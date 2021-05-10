import { Entity } from '@antv/g-ecs';
import { injectable } from 'inversify';
import RBush from 'rbush';
import { RBushNode } from '../components';
import { DisplayObject } from '../DisplayObject';
import { AABB } from '../shapes';

// @injectable()
// export class RenderingContext {
//   /**
//    * the root node in scene graph
//    */
//   root = new DisplayObject({
//     id: '_root',
//     attrs: {},
//   });

//   /**
//    * spatial index with RTree which can speed up the search for AABBs
//    */
//   rBush = new RBush<RBushNode>();

//   /**
//    * all the entities
//    */
//   entities: Entity[] = [];

//   dirtyRectangle: AABB | undefined;
//   dirtyEntities: Entity[] = [];

//   destroy() {
//     this.rBush.clear();
//     this.root.destroy();
//   }
// }

export const RenderingContext = Symbol('RenderingContext');
export interface RenderingContext {
  root: DisplayObject;
  /**
   * spatial index with RTree which can speed up the search for AABBs
   */
  rBush: RBush<RBushNode>;

  /**
   * all the entities
   */
  entities: Entity[];
  dirtyRectangle: AABB | undefined;
  dirtyEntities: Entity[];

  /**
   * picked object in last frame
   */
  lastPickedDisplayObject: DisplayObject | undefined;
}
