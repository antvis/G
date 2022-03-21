import { vec3 } from 'gl-matrix';
import type { DisplayObject } from '../display-objects/DisplayObject';
import { AABB } from '../shapes';
import type { GeometryAABBUpdater } from '../services';
import { dirtifyToRoot, GeometryUpdaterFactory } from '../services';
import { Shape } from '../types';
import { PARSED_COLOR_TYPE } from './color';
import type { ParsedFilterStyleProperty } from './filter';
import { globalContainer } from '../global-module';
import type { ParsedBaseStyleProps } from '..';

export function updateGeometry(oldValue: number, newValue: number, object: DisplayObject) {
  const geometryUpdaterFactory =
    globalContainer.get<(tagName: string) => GeometryAABBUpdater<any>>(GeometryUpdaterFactory);
  const geometryUpdater = geometryUpdaterFactory(object.nodeName);
  if (geometryUpdater) {
    const geometry = object.geometry;
    if (!geometry.contentBounds) {
      geometry.contentBounds = new AABB();
    }
    if (!geometry.renderBounds) {
      geometry.renderBounds = new AABB();
    }

    const {
      width,
      height,
      depth = 0,
      x = 0,
      y = 0,
      z = 0,
      offsetX = 0,
      offsetY = 0,
      offsetZ = 0,
    } = geometryUpdater.update(object.parsedStyle, object);
    // object.parsedStyle.width = width;
    // object.parsedStyle.height = height;
    // object.parsedStyle.depth = depth;

    if (
      object.nodeName === Shape.LINE ||
      object.nodeName === Shape.POLYLINE ||
      object.nodeName === Shape.POLYGON ||
      object.nodeName === Shape.PATH
    ) {
      object.parsedStyle.offsetX = x - (object.parsedStyle.defX || 0);
      object.parsedStyle.offsetY = y - (object.parsedStyle.defY || 0);
      object.parsedStyle.defX = x;
      object.parsedStyle.defY = y;
      object.translateLocal(object.parsedStyle.offsetX, object.parsedStyle.offsetY);
      object.parsedStyle.x = object.style.x;
      object.parsedStyle.y = object.style.y;
      object.parsedStyle.z = z;
    } else {
      object.parsedStyle.x = x;
      object.parsedStyle.y = y;
      object.parsedStyle.z = z;
    }

    // init with content box
    const halfExtents = vec3.fromValues(width / 2, height / 2, depth / 2);
    // anchor is center by default, don't account for lineWidth here

    const {
      lineWidth,
      anchor = [0, 0],
      shadowColor,
      filter = [],
    } = object.parsedStyle as ParsedBaseStyleProps;

    // <Text> use textAlign & textBaseline instead of anchor
    if (object.nodeName === Shape.TEXT) {
      delete object.parsedStyle.anchor;
    }

    const center = vec3.fromValues(
      (1 - anchor[0] * 2) * halfExtents[0] + offsetX,
      (1 - anchor[1] * 2) * halfExtents[1] + offsetY,
      (1 - (anchor[2] || 0) * 2) * halfExtents[2] + offsetZ,
    );

    // update geometry's AABB
    geometry.contentBounds.update(center, halfExtents);

    if (lineWidth) {
      // append border
      vec3.add(
        halfExtents,
        halfExtents,
        vec3.fromValues(lineWidth.value / 2, lineWidth.value / 2, 0),
      );
    }
    geometry.renderBounds.update(center, halfExtents);

    // account for shadow, only support constant value now
    if (shadowColor && shadowColor.type === PARSED_COLOR_TYPE.Constant) {
      const { min, max } = geometry.renderBounds;

      const { shadowBlur = 0, shadowOffsetX = 0, shadowOffsetY = 0 } = object.parsedStyle;
      const shadowLeft = min[0] - shadowBlur + shadowOffsetX;
      const shadowRight = max[0] + shadowBlur + shadowOffsetX;
      const shadowTop = min[1] - shadowBlur + shadowOffsetY;
      const shadowBottom = max[1] + shadowBlur + shadowOffsetY;
      min[0] = Math.min(min[0], shadowLeft);
      max[0] = Math.max(max[0], shadowRight);
      min[1] = Math.min(min[1], shadowTop);
      max[1] = Math.max(max[1], shadowBottom);

      geometry.renderBounds.setMinMax(min, max);
    }

    // account for filter, eg. blur(5px), drop-shadow()
    (filter as ParsedFilterStyleProperty[]).forEach(({ name, params }) => {
      if (name === 'blur') {
        const blurRadius = params[0].value as number;
        geometry.renderBounds.update(
          geometry.renderBounds.center,
          vec3.add(
            geometry.renderBounds.halfExtents,
            geometry.renderBounds.halfExtents,
            vec3.fromValues(blurRadius, blurRadius, 0),
          ),
        );
      } else if (name === 'drop-shadow') {
        const shadowOffsetX = params[0].value as number;
        const shadowOffsetY = params[1].value as number;
        const shadowBlur = params[2].value as number;

        const { min, max } = geometry.renderBounds;
        const shadowLeft = min[0] - shadowBlur + shadowOffsetX;
        const shadowRight = max[0] + shadowBlur + shadowOffsetX;
        const shadowTop = min[1] - shadowBlur + shadowOffsetY;
        const shadowBottom = max[1] + shadowBlur + shadowOffsetY;
        min[0] = Math.min(min[0], shadowLeft);
        max[0] = Math.max(max[0], shadowRight);
        min[1] = Math.min(min[1], shadowTop);
        max[1] = Math.max(max[1], shadowBottom);

        geometry.renderBounds.setMinMax(min, max);
      }
    });

    dirtifyToRoot(object);
  }
}
