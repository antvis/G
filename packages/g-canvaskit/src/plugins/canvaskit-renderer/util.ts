import type { CSSRGB } from '@antv/g-lite';
import { parseColor } from '@antv/g-lite';
import type { CanvasKit } from 'canvaskit-wasm';

export function color2CanvaskitColor(CanvasKit: CanvasKit, color: string) {
  const parsedColor = parseColor(color) as CSSRGB;
  return CanvasKit.Color4f(
    Number(parsedColor.r) / 255,
    Number(parsedColor.g) / 255,
    Number(parsedColor.b) / 255,
    Number(parsedColor.alpha),
  );
}
