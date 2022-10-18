import type { DisplayObject, ParsedBaseStyleProps, RenderingService } from '@antv/g-lite';

export interface StyleRenderer {
  render: (
    context: CanvasRenderingContext2D,
    parsedStyle: ParsedBaseStyleProps,
    object: DisplayObject,
    renderingService: RenderingService,
  ) => void;
}
