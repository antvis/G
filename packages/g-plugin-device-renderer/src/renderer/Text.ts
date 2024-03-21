import type { CSSRGB, DisplayObject, ParsedTextStyleProps } from '@antv/g-lite';
import type { Instanced } from '../drawcalls';
import { TextDrawcall, TextUniform } from '../drawcalls';
import type { RenderInst } from '../render/RenderInst';
import { Batch } from './Batch';
import { Renderable3D } from '../components/Renderable3D';

export class TextRenderer extends Batch {
  /**
   * one for fill, one for stroke
   */
  getDrawcallCtors(object: DisplayObject) {
    const drawcalls: (typeof Instanced)[] = [];

    const { stroke, lineWidth = 1 } =
      object.parsedStyle as ParsedTextStyleProps;
    const hasStroke = !!(stroke && !(stroke as CSSRGB).isNone && lineWidth);

    if (hasStroke) {
      drawcalls.push(TextDrawcall);
    }

    drawcalls.push(TextDrawcall);
    return drawcalls;
  }

  beforeUploadUBO(renderInst: RenderInst, mesh: Instanced) {
    const drawcallNum = ((mesh.instance as any).renderable3D as Renderable3D)
      .drawcalls.length;

    mesh.material.setUniforms({
      [TextUniform.HAS_STROKE]: drawcallNum === 1 ? 0 : 1 - mesh.index,
    });
  }
}
