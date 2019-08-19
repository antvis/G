import * as Util from '@antv/util';
import Shape from '../../core/shape';

const canvas = Util.createDom('<canvas width="500" height="500"></canvas>');
const context = canvas.getContext('2d');

export default function isPointInPathByContext(x: number, y: number, ctx: Shape): boolean {
  ctx.createPath(context);
  return context.isPointInPath(x, y);
}
