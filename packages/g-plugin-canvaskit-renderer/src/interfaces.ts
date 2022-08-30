import type { DisplayObject } from '@antv/g-lite';
import type { Canvas, CanvasKit, Paint, Surface } from 'canvaskit-wasm';

export interface CanvasKitContext {
  CanvasKit: CanvasKit;
  surface: Surface;
}

export const CircleRendererContribution = Symbol('CircleRendererContribution');
export const EllipseRendererContribution = Symbol('EllipseRendererContribution');
export const RectRendererContribution = Symbol('RectRendererContribution');
export const ImageRendererContribution = Symbol('ImageRendererContribution');
export const LineRendererContribution = Symbol('LineRendererContribution');
export const PolylineRendererContribution = Symbol('PolylineRendererContribution');
export const PolygonRendererContribution = Symbol('PolygonRendererContribution');
export const PathRendererContribution = Symbol('PathRendererContribution');
export const TextRendererContribution = Symbol('TextRendererContribution');

export const RendererContributionFactory = Symbol('');
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

export const CanvaskitRendererPluginOptions = Symbol('CanvaskitRendererPluginOptions');
// eslint-disable-next-line @typescript-eslint/no-redeclare
export interface CanvaskitRendererPluginOptions {
  fonts: {
    name: string;
    url: string;
  }[];
}
