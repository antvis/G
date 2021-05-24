import { ShapeAttrs } from '@antv/g';
import { injectable } from 'inversify';
import { isNil } from '@antv/util';
import { StyleRenderer } from '.';

@injectable()
export class DefaultRenderer implements StyleRenderer {
  render(context: CanvasRenderingContext2D, attributes: ShapeAttrs) {
    const { fill, opacity, fillOpacity, stroke, strokeOpacity, lineWidth, lineCap, lineJoin } = attributes;

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
