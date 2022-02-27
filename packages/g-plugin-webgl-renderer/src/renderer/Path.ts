/**
 * @see https://www.khronos.org/assets/uploads/developers/presentations/Crazy_Panda_How_to_draw_lines_in_WebGL.pdf
 */
import { injectable } from 'mana-syringe';
import { DisplayObject, SHAPE } from '@antv/g';
import { Batch } from './Batch';
import { ShapeRenderer } from '../tokens';
import { FillMesh, LineMesh } from '../meshes';

@injectable({
  token: [
    { token: ShapeRenderer, named: SHAPE.Polyline },
    { token: ShapeRenderer, named: SHAPE.Path },
    { token: ShapeRenderer, named: SHAPE.Polygon },
    { token: ShapeRenderer, named: SHAPE.Rect },
  ],
})
export class PathRenderer extends Batch {
  meshes = [FillMesh, LineMesh];

  shouldSubmitRenderInst(object: DisplayObject, index: number) {
    const { strokeOpacity, lineDash, lineWidth } = object.parsedStyle;
    const nodeName = object.nodeName;

    // Polyline don't need fill
    if (index === 0 && object.nodeName === SHAPE.Polyline) {
      return false;
    }

    // stroke mesh
    if (index === 1) {
      if (strokeOpacity === 0 || lineWidth === 0) {
        return false;
      }

      const hasDash = lineDash && lineDash.length && lineDash.every((item) => item !== 0);
      if (nodeName === SHAPE.Circle || nodeName === SHAPE.Ellipse) {
        // @see https://github.com/antvis/g/issues/824
        return hasDash;
      }
    }

    return true;
  }
}
