import type { CanvasContext, DisplayObject } from '@antv/g-lite';
import { HTML } from '@antv/g-lite';
import type { StyleRenderer } from './interfaces';

type DrawableContext = CanvasRenderingContext2D & {
  drawElementImage?: (element: Element, x: number, y: number) => void;
};

/** Draw a native HTML node at its position in G's Canvas scene order. */
export class NativeHTMLRenderer implements StyleRenderer {
  applyStyleToContext() {}

  drawToContext(context: CanvasRenderingContext2D, object: DisplayObject) {
    const { canvas } = context;
    const dpr = canvas.clientWidth ? canvas.width / canvas.clientWidth : 1;
    this.draw(context, object, dpr);
  }

  render(
    context: CanvasRenderingContext2D,
    _parsedStyle: HTML['parsedStyle'],
    object: DisplayObject,
    canvasContext: CanvasContext,
  ) {
    this.draw(context, object, canvasContext.contextService.getDPR());
  }

  private draw(
    context: CanvasRenderingContext2D,
    object: DisplayObject,
    dpr: number,
  ) {
    const html = object as HTML;
    const element = html.getDomElement();
    const drawableContext = context as DrawableContext;
    if (!element?.isConnected || !drawableContext.drawElementImage) return;

    const { x, y } = html.parsedStyle;
    context.save();
    // drawElementImage consumes device-pixel images, while G's context is
    // already scaled by DPR. Keep G coordinates in CSS pixels.
    context.scale(1 / dpr, 1 / dpr);
    drawableContext.drawElementImage(element, x * dpr, y * dpr);
    context.restore();
  }
}
