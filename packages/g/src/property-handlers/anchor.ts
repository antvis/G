import type { vec2 } from 'gl-matrix';
import { vec3 } from 'gl-matrix';
import type { DisplayObject } from '../display-objects/DisplayObject';
import { dirtifyToRoot } from '../services';
import { createVec3 } from '../utils';

export function updateAnchor(oldValue: vec2 | vec3, newValue: vec2 | vec3, object: DisplayObject) {
  const bounds = object.getGeometryBounds();
  if (bounds) {
    const geometry = object.geometry;
    if (geometry && geometry.contentBounds) {
      const offset = vec3.multiply(
        vec3.create(),
        vec3.fromValues(
          ...(bounds.halfExtents.map((n: number) => n * 2) as [number, number, number]),
        ),
        vec3.subtract(
          vec3.create(),
          createVec3(newValue || vec3.create()),
          createVec3(oldValue || vec3.create()),
        ),
      );

      geometry.contentBounds.update(
        vec3.subtract(geometry.contentBounds.center, geometry.contentBounds.center, offset),
        geometry.contentBounds.halfExtents,
      );
      geometry.renderBounds.update(
        vec3.subtract(geometry.renderBounds.center, geometry.renderBounds.center, offset),
        geometry.renderBounds.halfExtents,
      );

      dirtifyToRoot(object);
    }
  }
}
