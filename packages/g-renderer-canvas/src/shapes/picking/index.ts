import { DisplayObject, SceneGraphNode } from '@antv/g';
import { Entity } from '@antv/g-ecs';

export const PointInPathPicker = Symbol('PointInPathPicker');
export type PointInPathPicker = (
  displayObject: DisplayObject,
  point: {
    lineWidth: number;
    x: number;
    y: number;
  }
) => boolean;

// function getHitLineWidth(entity: Entity) {
//   const renderable = entity.getComponent(SceneGraphNode);
//   const { stroke, lineWidth = 0, lineAppendWidth = 0 } = renderable.attributes;
//   if (!stroke) {
//     return 0;
//   }
//   return lineWidth + lineAppendWidth;
// }

export { isPointInPath as CirclePicker } from './Circle';
export { isPointInPath as EllipsePicker } from './Ellipse';
