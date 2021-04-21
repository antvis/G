import { SceneGraphNode } from '@antv/g';
import { Entity } from '@antv/g-ecs';
import { inject, injectable } from 'inversify';
import { isNil } from '@antv/util';
import { StyleRenderer } from '.';

@injectable()
export class DefaultRenderer implements StyleRenderer {
  render(context: CanvasRenderingContext2D, entity: Entity) {
    const sceneGraphNode = entity.getComponent(SceneGraphNode);
    const {
      fill,
      opacity,
      fillOpacity,
      stroke,
      strokeOpacity,
      lineWidth,
      lineCap,
      lineJoin,
    } = sceneGraphNode.attributes;

    if (!isNil(fill)) {
      if (!isNil(fillOpacity) && fillOpacity !== 1) {
        context.globalAlpha = fillOpacity!;
        context.fill();
        context.globalAlpha = opacity!;
      } else {
        context.fill();
      }
    }

    if (!isNil(stroke)) {
      if (lineWidth && lineWidth > 0) {
        const applyOpacity = !isNil(strokeOpacity) && strokeOpacity !== 1;
        if (applyOpacity) {
          context.globalAlpha = strokeOpacity!;
        }
        context.lineWidth = lineWidth;

        if (!isNil(lineCap)) {
          context.lineCap = lineCap!;
        }

        if (!isNil(lineJoin)) {
          context.lineJoin = lineJoin!;
        }

        context.stroke();
      }
    }
  }
}
