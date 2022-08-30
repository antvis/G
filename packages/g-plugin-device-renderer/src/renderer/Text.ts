import type { DisplayObject, ParsedTextStyleProps } from '@antv/g-lite';
import { injectable } from '@antv/g-lite';
import type { Instanced } from '../meshes';
import { TextMesh, TextUniform } from '../meshes';
import type { RenderInst } from '../render/RenderInst';
import { Batch } from './Batch';

@injectable()
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
