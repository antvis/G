import { register, getMethod } from '@antv/g-base/lib/bbox/register';
import text, { cacheCanvasContext } from './text';

export default (context: CanvasRenderingContext2D) => {
  cacheCanvasContext(context);
  register('text', text);
};
