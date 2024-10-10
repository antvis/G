import type { DisplayObject } from '@antv/g-lite';
import type { Canvas, CanvasKit, Paint, Surface } from 'canvaskit-wasm';

export interface CanvasKitContext {
  CanvasKit: CanvasKit;
  surface: Surface;
}
export interface RendererContributionContext {
  canvas: Canvas;
  fillPaint: Paint;
  strokePaint: Paint;
  shadowFillPaint: Paint;
  shadowStrokePaint: Paint;
}
export interface RendererContribution {
  render: (
    displayObject: DisplayObject,
    context: RendererContributionContext,
  ) => void;
}

export interface CanvaskitRendererPluginOptions {
  fonts: {
    name: string;
    url: string;
  }[];
}
