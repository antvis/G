import type { ParsedBaseStyleProps, DisplayObject } from '@antv/g';
import { Syringe } from 'mana-syringe';

export const StyleRendererFactory = Syringe.defineToken('StyleRendererFactory');
export interface StyleRenderer {
  hash: (parsedStyle: ParsedBaseStyleProps) => string;
  render: (
    context: CanvasRenderingContext2D,
    parsedStyle: ParsedBaseStyleProps,
    object: DisplayObject,
  ) => void;
}

export const CircleRendererContribution = Syringe.defineToken('CircleRenderer', {
  multiple: false,
});
export const EllipseRendererContribution = Syringe.defineToken('EllipseRenderer', {
  multiple: false,
});
export const RectRendererContribution = Syringe.defineToken('RectRenderer', { multiple: false });
export const LineRendererContribution = Syringe.defineToken('LineRenderer', { multiple: false });
export const PolylineRendererContribution = Syringe.defineToken('PolylineRenderer', {
  multiple: false,
});
export const PolygonRendererContribution = Syringe.defineToken('PolygonRenderer', {
  multiple: false,
});
export const PathRendererContribution = Syringe.defineToken('PathRenderer', { multiple: false });
export const TextRendererContribution = Syringe.defineToken('TextRenderer', { multiple: false });
export const ImageRendererContribution = Syringe.defineToken('ImageRenderer', { multiple: false });
