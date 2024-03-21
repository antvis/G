/**
 * @see https://www.khronos.org/assets/uploads/developers/presentations/Crazy_Panda_How_to_draw_lines_in_WebGL.pdf
 */
import type { CSSRGB, DisplayObject, ParsedPathStyleProps } from '@antv/g-lite';
import { Shape } from '@antv/g-lite';
import {
  Instanced,
  InstancedFillDrawcall,
  InstancedLineDrawcall,
  InstancedPathDrawcall,
} from '../drawcalls';
import { Batch } from './Batch';

/**
 * Use the following perf enhancements:
 * * Downgrading the "simple" Path / Polyline to {@link InstancedLineDrawcall}, e.g. 'M 0 0 L 100 0'
 * * Merge the Path into {@link InstancedPathDrawcall} which contains only one curve command, e.g 'M 0 0 Q 10 10 100 100'
 * @see https://github.com/antvis/G/issues/1113
 */
export class PathRenderer extends Batch {
  // meshes = [
  //   InstancedFillDrawcall ?,
  //   (InstancedLineDrawcall | InstancedPathDrawcall) *, // sub paths
  // ];

  getDrawcallCtors(object: DisplayObject) {
    const { fill, stroke, opacity, strokeOpacity, lineWidth } =
      object.parsedStyle as ParsedPathStyleProps;
    const hasStroke = stroke && !(stroke as CSSRGB).isNone;
    const subpathNum = InstancedPathDrawcall.calcSubpathNum(object);

    const drawcalls: (typeof Instanced)[] = [];

    // Polyline don't need fill
    if (!(object.nodeName === Shape.POLYLINE || (fill as CSSRGB)?.isNone)) {
      for (let i = 0; i < subpathNum; i++) {
        drawcalls.push(InstancedFillDrawcall);
      }
    }

    for (let i = 0; i < subpathNum; i++) {
      if (
        !(strokeOpacity === 0 || opacity === 0 || lineWidth === 0 || !hasStroke)
      ) {
        const isLine = InstancedLineDrawcall.isLine(object, i);
        if (isLine) {
          drawcalls.push(InstancedLineDrawcall);
        } else {
          drawcalls.push(InstancedPathDrawcall);
        }
      }
    }

    return drawcalls;
  }
}
