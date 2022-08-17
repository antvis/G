import type { DisplayObject } from '@antv/g';
import { Syringe } from '@antv/g';
import type { Canvas, CanvasKit, Paint, Surface } from 'canvaskit-wasm';

export interface CanvasKitContext {
  CanvasKit: CanvasKit;
  surface: Surface;
}

export const CircleRendererContribution = Syringe.defineToken('', {
  multiple: false,
});
export const EllipseRendererContribution = Syringe.defineToken('', {
  multiple: false,
});
export const RectRendererContribution = Syringe.defineToken('', {
  multiple: false,
});
export const ImageRendererContribution = Syringe.defineToken('', {
  multiple: false,
});
export const LineRendererContribution = Syringe.defineToken('', {
  multiple: false,
});
export const PolylineRendererContribution = Syringe.defineToken('', {
  multiple: false,
});
export const PolygonRendererContribution = Syringe.defineToken('', {
  multiple: false,
});
export const PathRendererContribution = Syringe.defineToken('', {
  multiple: false,
});
export const TextRendererContribution = Syringe.defineToken('', {
  multiple: false,
});

export const RendererContributionFactory = Syringe.defineToken('');
export interface RendererContributionContext {
  canvas: Canvas;
  fillPaint: Paint;
  strokePaint: Paint;
  shadowFillPaint: Paint;
  shadowStrokePaint: Paint;
}
export interface RendererContribution {
  render: (displayObject: DisplayObject, context: RendererContributionContext) => void;
}

export const CanvaskitRendererPluginOptions = Syringe.defineToken('');
// eslint-disable-next-line @typescript-eslint/no-redeclare
export interface CanvaskitRendererPluginOptions {
  fonts: {
    name: string;
    url: string;
  }[];
}
