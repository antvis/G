import type { ParsedBaseStyleProps, DisplayObject } from '@antv/g';
import { Syringe } from 'mana-syringe';

export const StyleRendererFactory = Syringe.defineToken('StyleRendererFactory');
export const StyleRenderer = Syringe.defineToken('StyleRenderer');
export interface StyleRenderer {
  render(
    context: CanvasRenderingContext2D,
    parsedStyle: ParsedBaseStyleProps,
    object: DisplayObject,
  ): void;
}
