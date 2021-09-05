import { vec3 } from 'gl-matrix';
import { Geometry } from '../components';
import type { DisplayObject } from '../DisplayObject';
import { AABB } from '../shapes';
import { container } from '../inversify.config';
import { GeometryAABBUpdater, GeometryUpdaterFactory, SceneGraphService } from '../services';
import { SHAPE } from '../types';
import { PARSED_COLOR_TYPE } from './color';
import { ParsedFilterStyleProperty } from './filter';

export function updateGeometry(
  oldValue: number,
  newValue: number,
  object: DisplayObject,
  sceneGraphService: SceneGraphService,
) {
  const geometryUpdaterFactory =
    container.get<(tagName: string) => GeometryAABBUpdater<any>>(GeometryUpdaterFactory);
  const geometryUpdater = geometryUpdaterFactory(object.nodeName);
  if (geometryUpdater) {
    const geometry = object.getEntity().getComponent(Geometry);
    if (!geometry.aabb) {
      geometry.aabb = new AABB();
    }

    const {
      width,
      height,
      depth = 0,
      x = 0,
      y = 0,
      offsetX = 0,
      offsetY = 0,
      offsetZ = 0,
    } = geometryUpdater.update(object.parsedStyle, object);
    object.parsedStyle.width = width;
    object.parsedStyle.height = height;
    object.parsedStyle.depth = depth;

    if (
      object.nodeName === SHAPE.Line ||
      object.nodeName === SHAPE.Polyline ||
      object.nodeName === SHAPE.Polygon ||
      object.nodeName === SHAPE.Path
    ) {
      object.parsedStyle.offsetX = x - (object.parsedStyle.defX || 0);
      object.parsedStyle.offsetY = y - (object.parsedStyle.defY || 0);
      object.parsedStyle.defX = x;
      object.parsedStyle.defY = y;
      object.translateLocal(object.parsedStyle.offsetX, object.parsedStyle.offsetY);
      object.parsedStyle.x = object.style.x;
      object.parsedStyle.y = object.style.y;
    } else {
      object.parsedStyle.x = x;
      object.parsedStyle.y = y;
    }

    // init with content box
    const halfExtents = vec3.fromValues(width / 2, height / 2, depth / 2);
    // anchor is center by default, don't account for lineWidth here

    const {
      lineWidth = 0,
      lineAppendWidth = 0,
      anchor = [0.5, 0.5],
      shadowColor,
      filter = [],
    } = object.parsedStyle;
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

    // account for shadow, only support constant value now
    if (shadowColor && shadowColor.type === PARSED_COLOR_TYPE.Constant) {
      const { min, max } = geometry.aabb;

      const { shadowBlur = 0, shadowOffsetX = 0, shadowOffsetY = 0 } = object.parsedStyle;
      const shadowLeft = min[0] - shadowBlur + shadowOffsetX;
      const shadowRight = max[0] + shadowBlur + shadowOffsetX;
      const shadowTop = min[1] - shadowBlur + shadowOffsetY;
      const shadowBottom = max[1] + shadowBlur + shadowOffsetY;
      min[0] = Math.min(min[0], shadowLeft);
      max[0] = Math.max(max[0], shadowRight);
      min[1] = Math.min(min[1], shadowTop);
      max[1] = Math.max(max[1], shadowBottom);

      geometry.aabb.setMinMax(min, max);
    }

    // account for filter, eg. blur(5px), drop-shadow()
    (filter as ParsedFilterStyleProperty[]).forEach(({ name, params }) => {
      if (name === 'blur') {
        const blurRadius = params[0].value as number;
        geometry.aabb!.update(
          geometry.aabb!.center,
          vec3.add(
            geometry.aabb!.halfExtents,
            geometry.aabb!.halfExtents,
            vec3.fromValues(blurRadius, blurRadius, 0),
          ),
        );
      } else if (name === 'drop-shadow') {
        const shadowOffsetX = params[0].value as number;
        const shadowOffsetY = params[1].value as number;
        const shadowBlur = params[2].value as number;

        const { min, max } = geometry.aabb!;
        const shadowLeft = min[0] - shadowBlur + shadowOffsetX;
        const shadowRight = max[0] + shadowBlur + shadowOffsetX;
        const shadowTop = min[1] - shadowBlur + shadowOffsetY;
        const shadowBottom = max[1] + shadowBlur + shadowOffsetY;
        min[0] = Math.min(min[0], shadowLeft);
        max[0] = Math.max(max[0], shadowRight);
        min[1] = Math.min(min[1], shadowTop);
        max[1] = Math.max(max[1], shadowBottom);

        geometry.aabb!.setMinMax(min, max);
      }
    });

    // dirtify renderable's AABB
    sceneGraphService.dirtifyAABBToRoot(object);
  }
}
