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

// function getRotationFromBbox(path: PointLike[]) {
//   // eslint-disable-next-line @typescript-eslint/no-unused-vars
//   const [tl, tr, br, bl] = path;
//   const dy = tr.y - tl.y;
//   const dx = tr.x - tl.x;
//   return (Math.atan(dy / dx) * 180) / Math.PI;
// }

export const renderRect = (context: AnnotationPlugin, anno: DrawerState) => {
  const { path } = anno;
  const left = path[0].x;
  const top = path[0].y;
  const style = anno.isDrawing ? DASH_LINE_STYLE : DEFAULT_STYLE;
  const width = getWidthFromBbox(path);
  const height = getHeightFromBbox(path);

  let brushRect = context.brushRect;
  if (!brushRect) {
    brushRect = new Rect({
      id: anno.id,
      className: anno.id,
      style: {
        width: 0,
        height: 0,
      },
    });

    // context.brushRect.addEventListener('pointerdown', () => {
    //   context.freezeDrawer();
    //   context.setActiveAnnotation(anno.id);
    // });

    // context.brushRect.addEventListener('pointerup', () => {
    //   context.unfreezeDrawer();
    // });

    context.canvas?.appendChild(brushRect);
    context.brushRect = brushRect;
  }

  brushRect.attr({
    x: left,
    y: top,
    height,
    width,
    visibility: 'visible',
    ...style,
  });

  // todo: 相机旋转后绘制也需要旋转
  // const rotation = getRotationFromBbox(path);
  // brushRect.rotate(rotation);
};
