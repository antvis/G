import { DisplayObject, SHAPE } from '@antv/g';
import { injectable } from 'mana-syringe';
import { Batch } from './Batch';
import { ShapeRenderer } from '../tokens';
import { LineMesh, SDFMesh } from '../meshes';

/**
 * Use 2 meshes:
 * * SDF to draw fill
 * * InstancedLine
 */
@injectable({
  token: [
    { token: ShapeRenderer, named: SHAPE.Circle },
    { token: ShapeRenderer, named: SHAPE.Ellipse },
  ],
})
export class CircleRenderer extends Batch {
  meshes = [SDFMesh, LineMesh];

  shouldSubmitRenderInst(object: DisplayObject, index: number) {
    if (index === 1) {
      return this.needDrawStrokeSeparately(object);
    }

    return true;
  }

  /**
   * need an additional mesh to draw stroke:
   * 1. strokeOpacity < 1
   * 2. lineDash used
   */
  private needDrawStrokeSeparately(object: DisplayObject) {
    const { stroke, lineDash, lineWidth, strokeOpacity } = object.parsedStyle;
    return (
      stroke &&
      lineWidth > 0 &&
      (strokeOpacity < 1 || (lineDash && lineDash.length && lineDash.every((item) => item !== 0)))
    );
  }
}
