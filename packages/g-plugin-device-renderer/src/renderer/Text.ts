import type { DisplayObject, ParsedTextStyleProps } from '@antv/g';
import { injectable, Shape } from '@antv/g';
import type { Instanced } from '../meshes';
import { TextMesh, TextUniform } from '../meshes';
import type { RenderInst } from '../render/RenderInst';
import { ShapeRenderer } from '../tokens';
import { Batch } from './Batch';

@injectable({
  token: [{ token: ShapeRenderer, named: Shape.TEXT }],
})
export class TextRenderer extends Batch {
  /**
   * one for fill, one for stroke
   */
  meshes = [TextMesh, TextMesh];

  shouldSubmitRenderInst(object: DisplayObject, index: number) {
    const { stroke, lineWidth } = object.parsedStyle as ParsedTextStyleProps;
    const hasStroke = !!(stroke && lineWidth);

    if (!hasStroke && index === 0) {
      // skip rendering stroke
      return false;
    }
    return true;
  }

  beforeUploadUBO(renderInst: RenderInst, mesh: Instanced, index: number) {
    mesh.material.setUniforms({
      [TextUniform.HAS_STROKE]: 1 - mesh.index,
    });
  }
}
