import { injectable } from 'mana-syringe';
import { DisplayObject, ParsedTextStyleProps, Shape } from '@antv/g';
import { Batch } from './Batch';
import { ShapeRenderer } from '../tokens';
import { Instanced, TextMesh, TextUniform } from '../meshes';
import { RenderInst } from '../render/RenderInst';

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
    const hasStroke = !!(stroke && lineWidth && lineWidth.value);

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
