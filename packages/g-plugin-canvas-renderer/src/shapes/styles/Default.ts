import { ParsedBaseStyleProps, SHAPE } from '@antv/g';
import { singleton } from 'mana-syringe';
import { isNil } from '@antv/util';
import { StyleRenderer } from './interfaces';

@singleton({
  token: [
    { token: StyleRenderer, named: SHAPE.Circle },
    { token: StyleRenderer, named: SHAPE.Ellipse },
    { token: StyleRenderer, named: SHAPE.Rect },
    { token: StyleRenderer, named: SHAPE.Line },
    { token: StyleRenderer, named: SHAPE.Polyline },
    { token: StyleRenderer, named: SHAPE.Polygon },
    { token: StyleRenderer, named: SHAPE.Path },
  ],
})
export class DefaultRenderer implements StyleRenderer {
  render(context: CanvasRenderingContext2D, parsedStyle: ParsedBaseStyleProps) {
    const { fill, opacity, fillOpacity, stroke, strokeOpacity, lineWidth, lineCap, lineJoin } =
      parsedStyle;

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

        // prevent inner shadow when drawing stroke, toggle shadowBlur & filter(drop-shadow)
        // save shadow blur
        const shadowBlur = context.shadowBlur;
        const shadowColor = context.shadowColor;
        if (!isNil(shadowBlur)) {
          context.shadowColor = 'transparent';
          context.shadowBlur = 0;
        }

        // save drop-shadow filter
        const filter = context.filter;
        if (!isNil(filter) && filter.indexOf('drop-shadow') > -1) {
          context.filter = filter.replace(/drop-shadow\([^)]*\)/, '').trim() || 'none';
        }

        context.stroke();
        // restore shadow blur
        if (!isNil(shadowBlur)) {
          context.shadowColor = shadowColor;
          context.shadowBlur = shadowBlur;
        }
        // restore filters
        if (!isNil(filter)) {
          context.filter = filter;
        }
      }
    }
  }
}
