/**
 * @see https://www.khronos.org/assets/uploads/developers/presentations/Crazy_Panda_How_to_draw_lines_in_WebGL.pdf
 */
import { injectable } from 'mana-syringe';
import type { DisplayObject, ParsedBaseStyleProps , CSSRGB } from '@antv/g';
import { Shape } from '@antv/g';
import { Batch } from './Batch';
import { ShapeRenderer } from '../tokens';
import { FillMesh, LineMesh } from '../meshes';

@injectable({
  token: [
    { token: ShapeRenderer, named: Shape.POLYLINE },
    { token: ShapeRenderer, named: Shape.PATH },
    { token: ShapeRenderer, named: Shape.POLYGON },
    { token: ShapeRenderer, named: Shape.RECT },
  ],
})
export class PathRenderer extends Batch {
  meshes = [FillMesh, LineMesh];

  shouldSubmitRenderInst(object: DisplayObject, index: number) {
    const { fill, strokeOpacity, lineDash, lineWidth } = object.parsedStyle as ParsedBaseStyleProps;
    const nodeName = object.nodeName;

    // Polyline don't need fill
    if (index === 0 && (object.nodeName === Shape.POLYLINE || (fill as CSSRGB).isNone)) {
      return false;
    }

    // stroke mesh
    if (index === 1) {
      if (strokeOpacity.value === 0 || lineWidth.value === 0) {
        return false;
      }

      const hasDash = lineDash && lineDash.length && lineDash.every((item) => item.value !== 0);
      if (nodeName === Shape.CIRCLE || nodeName === Shape.ELLIPSE) {
        // @see https://github.com/antvis/g/issues/824
        return hasDash;
      }
    }

    return true;
  }
}
