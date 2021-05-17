import { registerBBox } from '@antv/g-base';
import text, { cacheCanvasContext } from './text';

export default (context: CanvasRenderingContext2D) => {
  cacheCanvasContext(context);
  registerBBox('text', text);
};
