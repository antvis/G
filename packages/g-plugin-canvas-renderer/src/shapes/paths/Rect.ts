import { ParsedRectStyleProps } from '@antv/g';
import { parseRadius } from '../../utils/parse';

export function generatePath(context: CanvasRenderingContext2D, parsedStyle: ParsedRectStyleProps) {
  const { radius = 0, widthInPixels: width, heightInPixels: height } = parsedStyle;

  if (radius === 0) {
    context.rect(0, 0, width, height);
  } else {
    const [r1, r2, r3, r4] = parseRadius(radius);
    context.moveTo(r1, 0);
    context.lineTo(width - r2, 0);
    r2 !== 0 && context.arc(width - r2, r2, r2, -Math.PI / 2, 0);
    context.lineTo(width, height - r3);
    r3 !== 0 && context.arc(width - r3, height - r3, r3, 0, Math.PI / 2);
    context.lineTo(r4, height);
    r4 !== 0 && context.arc(r4, height - r4, r4, Math.PI / 2, Math.PI);
    context.lineTo(0, r1);
    r1 !== 0 && context.arc(r1, r1, r1, Math.PI, Math.PI * 1.5);
  }
}
