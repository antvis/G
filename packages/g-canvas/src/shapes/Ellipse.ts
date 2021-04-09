import { Renderable, SceneGraphNode } from '@antv/g-core';
import { Entity } from '@antv/g-ecs';
import { injectable } from 'inversify';
import { BaseRenderer } from './Base';

function ellipseDistance(squareX: number, squareY: number, rx: number, ry: number) {
  return squareX / (rx * rx) + squareY / (ry * ry);
}

@injectable()
export class EllipseRenderer extends BaseRenderer {
  isInStrokeOrPath(entity: Entity, { lineWidth, x, y }: { lineWidth: number; x: number; y: number }): boolean {
    const {
      attributes: { x: cx = 0, y: cy = 0, rx = 0, ry = 0, fill, stroke },
    } = entity.getComponent(SceneGraphNode);
    const halfLineWith = lineWidth / 2;
    const squareX = (x - cx) * (x - cx);
    const squareY = (y - cy) * (y - cy);
    // 使用椭圆的公式： x*x/rx*rx + y*y/ry*ry = 1;
    if (fill && stroke) {
      return ellipseDistance(squareX, squareY, rx + halfLineWith, ry + halfLineWith) <= 1;
    }
    if (fill) {
      return ellipseDistance(squareX, squareY, rx, ry) <= 1;
    }
    if (stroke) {
      return (
        ellipseDistance(squareX, squareY, rx - halfLineWith, ry - halfLineWith) >= 1 &&
        ellipseDistance(squareX, squareY, rx + halfLineWith, ry + halfLineWith) <= 1
      );
    }
    return false;
  }

  generatePath(context: CanvasRenderingContext2D, entity: Entity) {
    const { rx, ry } = entity.getComponent(SceneGraphNode).attributes;
    context.beginPath();

    // @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/ellipse
    if (context.ellipse) {
      context.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2, false);
    } else {
      // 如果不支持，则使用圆来绘制，进行变形
      const r = rx > ry ? rx : ry;
      const scaleX = rx > ry ? 1 : rx / ry;
      const scaleY = rx > ry ? ry / rx : 1;
      context.save();
      context.scale(scaleX, scaleY);
      context.arc(0, 0, r, 0, Math.PI * 2);

      context.closePath();
      context.restore();
    }
  }
}
