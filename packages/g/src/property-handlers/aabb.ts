import { vec3 } from 'gl-matrix';
import { isString } from '@antv/util';
import { Geometry, Renderable } from '../components';
import type { DisplayObject } from '../DisplayObject';
import { AABB } from '../shapes';
import { container } from '../inversify.config';
import { GeometryAABBUpdater, GeometryUpdaterFactory } from '../services';
import { SHAPE } from '../types';

export function updateGeometry(oldValue: number, newValue: number, object: DisplayObject) {
  const geometryUpdaterFactory =
    container.get<(tagName: string) => GeometryAABBUpdater<any>>(GeometryUpdaterFactory);
  const geometryUpdater = geometryUpdaterFactory(object.nodeName);
  if (geometryUpdater) {
    const geometry = object.getEntity().getComponent(Geometry);
    const renderable = object.getEntity().getComponent(Renderable);
    if (!geometry.aabb) {
      geometry.aabb = new AABB();
    }

    const {
      width,
      height,
      depth = 0,
      x,
      y,
      offsetX = 0,
      offsetY = 0,
      offsetZ = 0,
    } = geometryUpdater.update(object.parsedStyle);
    object.parsedStyle.width = width;
    object.parsedStyle.height = height;
    object.parsedStyle.depth = depth;
    object.parsedStyle.x = x;
    object.parsedStyle.y = y;

    // init with content box
    const halfExtents = vec3.fromValues(width / 2, height / 2, depth / 2);
    // anchor is center by default, don't account for lineWidth here

    const { lineWidth = 0, lineAppendWidth = 0, anchor = [0.5, 0.5] } = object.parsedStyle;
    const center = vec3.fromValues(
      (1 - anchor[0] * 2) * halfExtents[0] + offsetX,
      (1 - anchor[1] * 2) * halfExtents[1] + offsetY,
      (1 - (anchor[2] || 0) * 2) * halfExtents[2] + offsetZ,
    );

    // <Text> use textAlign & textBaseline instead of anchor
    if (object.nodeName === SHAPE.Text) {
      delete object.parsedStyle.anchor;
    }

    // append border
    vec3.add(
      halfExtents,
      halfExtents,
      vec3.fromValues(lineWidth + lineAppendWidth, lineWidth + lineAppendWidth, 0),
    );

    // update geometry's AABB
    geometry.aabb.update(center, halfExtents);

    // dirtify renderable's AABB
    renderable.aabbDirty = true;
  }
}
