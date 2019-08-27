import { getOffScreenContext } from '../util';

export default function isPointInPath(shape, x, y) {
  const ctx = getOffScreenContext();
  shape.createPath(ctx);
  return ctx.isPointInPath(x, y);
}
