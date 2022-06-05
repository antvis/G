import type { DisplayObject } from '@antv/g';
import type { Canvas, CanvasKit, Paint, Surface } from 'canvaskit-wasm';
import { Syringe } from 'mana-syringe';

export interface CanvasKitContext {
  CanvasKit: CanvasKit;
  surface: Surface;
}

export const CircleRendererContribution = Syringe.defineToken('CircleRenderer', {
  multiple: false,
});
export const EllipseRendererContribution = Syringe.defineToken('EllipseRenderer', {
  multiple: false,
});
export const RectRendererContribution = Syringe.defineToken('RectRenderer', {
  multiple: false,
});
export const ImageRendererContribution = Syringe.defineToken('ImageRenderer', {
  multiple: false,
});
export const LineRendererContribution = Syringe.defineToken('LineRenderer', {
  multiple: false,
});
export const PolylineRendererContribution = Syringe.defineToken('PolylineRenderer', {
  multiple: false,
});
export const PolygonRendererContribution = Syringe.defineToken('PolygonRenderer', {
  multiple: false,
});
export const PathRendererContribution = Syringe.defineToken('PathRenderer', {
  multiple: false,
});
export const TextRendererContribution = Syringe.defineToken('TextRenderer', {
  multiple: false,
});

export const RendererContributionFactory = Syringe.defineToken('RendererContributionFactory');
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

export const CanvaskitRendererPluginOptions = Syringe.defineToken('CanvaskitRendererPluginOptions');
// eslint-disable-next-line @typescript-eslint/no-redeclare
export interface CanvaskitRendererPluginOptions {
  fonts: {
    name: string;
    url: string;
  }[];
}
