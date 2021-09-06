import type { ParsedBaseStyleProps, DisplayObject } from '@antv/g';

export const StyleRendererFactory = 'StyleRendererFactory';
export const StyleRenderer = 'StyleRenderer';
export interface StyleRenderer {
  render(
    context: CanvasRenderingContext2D,
    parsedStyle: ParsedBaseStyleProps,
    object: DisplayObject,
  ): void;
}

export * from './Default';
export * from './Image';
export * from './Text';
