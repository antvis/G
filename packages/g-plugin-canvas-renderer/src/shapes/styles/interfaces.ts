import type { DisplayObject, ParsedBaseStyleProps, RenderingService } from '@antv/g';
import { Syringe } from '@antv/g';

export const StyleRendererFactory = Syringe.defineToken('');
export interface StyleRenderer {
  render: (
    context: CanvasRenderingContext2D,
    parsedStyle: ParsedBaseStyleProps,
    object: DisplayObject,
    renderingService: RenderingService,
  ) => void;
}

export const CircleRendererContribution = Syringe.defineToken('', {
  multiple: false,
});
export const EllipseRendererContribution = Syringe.defineToken('', {
  multiple: false,
});
export const RectRendererContribution = Syringe.defineToken('', { multiple: false });
export const LineRendererContribution = Syringe.defineToken('', { multiple: false });
export const PolylineRendererContribution = Syringe.defineToken('', {
  multiple: false,
});
export const PolygonRendererContribution = Syringe.defineToken('', {
  multiple: false,
});
export const PathRendererContribution = Syringe.defineToken('', { multiple: false });
export const TextRendererContribution = Syringe.defineToken('', { multiple: false });
export const ImageRendererContribution = Syringe.defineToken('', { multiple: false });
