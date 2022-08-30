import type { DisplayObject, ParsedBaseStyleProps, RenderingService } from '@antv/g-lite';

export const StyleRendererFactory = Symbol('StyleRendererFactory');
export type StyleRendererFactory = (tagName: string) => StyleRenderer;

export interface StyleRenderer {
  render: (
    context: CanvasRenderingContext2D,
    parsedStyle: ParsedBaseStyleProps,
    object: DisplayObject,
    renderingService: RenderingService,
  ) => void;
}

export const CircleRendererContribution = Symbol('CircleRendererContribution');
export const EllipseRendererContribution = Symbol('EllipseRendererContribution');
export const RectRendererContribution = Symbol('RectRendererContribution');
export const LineRendererContribution = Symbol('LineRendererContribution');
export const PolylineRendererContribution = Symbol('PolylineRendererContribution');
export const PolygonRendererContribution = Symbol('PolygonRendererContribution');
export const PathRendererContribution = Symbol('PathRendererContribution');
export const TextRendererContribution = Symbol('TextRendererContribution');
export const ImageRendererContribution = Symbol('ImageRendererContribution');
