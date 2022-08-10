import type { PointLike } from '@antv/g';
import { Rect } from '@antv/g';
import type { AnnotationPlugin } from '../AnnotationPlugin';
import { DASH_LINE_STYLE, DEFAULT_STYLE } from '../constants/style';
import type { DrawerState } from '../interface/drawer';

function getWidthFromBbox(path: PointLike[]) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [tl, tr, br, bl] = path;
  const dy = tr.y - tl.y;
  const dx = tr.x - tl.x;
  return Math.sqrt(dy * dy + dx * dx);
}

function getHeightFromBbox(path: PointLike[]) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [tl, tr, br, bl] = path;
  const dy = br.y - tr.y;
  const dx = br.x - tr.x;
  return Math.sqrt(dy * dy + dx * dx);
}
function getRotationFromBbox(path: PointLike[]) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [tl, tr, br, bl] = path;
  const dy = tr.y - tl.y;
  const dx = tr.x - tl.x;
  return (Math.atan(dy / dx) * 180) / Math.PI;
}

export const renderRect = (context: AnnotationPlugin, anno: DrawerState) => {
  const { path } = anno;
  const left = path[0].x;
  const top = path[0].y;
  const style = anno.isDrawing ? DASH_LINE_STYLE : DEFAULT_STYLE;
  const width = getWidthFromBbox(path);
  const height = getHeightFromBbox(path);

  const rect = new Rect({
    style: {
      x: left,
      y: top,
      height,
      width,
      ...style,
    },
    className: anno.id,
    id: anno.id,
  });
  const rotation = getRotationFromBbox(path);
  rect.rotate(rotation);

  rect.addEventListener('mousedown', () => {
    context.freezeDrawer();
    context.setActiveAnnotation(anno.id);
  });

  rect.addEventListener('mouseup', () => {
    context.unfreezeDrawer();
  });

  context.canvas?.appendChild(rect);
};
