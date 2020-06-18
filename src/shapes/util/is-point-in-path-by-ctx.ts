import * as Util from '@antv/util';
import Shape from '../../core/shape';

let offscreenCanvas;

if (document) {
  offscreenCanvas = Util.createDom('<canvas width="500" height="500"></canvas>');
}


export default function isPointInPathByContext(x: number, y: number, shape: Shape): boolean {
  const canvas = shape.get('canvas');
  // 优先使用 G 内部创建的离屏 canvas，如果不存在，则使用上层传入的离屏 canvas (通常渲染环境为小程序和 Node)
  offscreenCanvas = offscreenCanvas || canvas.get('offscreenCanvas');
  const context = offscreenCanvas.getContext('2d');
  shape.createPath(context);
  return context.isPointInPath(x, y);
}
