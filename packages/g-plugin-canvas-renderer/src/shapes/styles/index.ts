import { ParsedBaseStyleProps } from '@antv/g';

export const StyleRendererFactory = 'StyleRendererFactory';
export const StyleRenderer = 'StyleRenderer';
export interface StyleRenderer {
  render(context: CanvasRenderingContext2D, parsedStyle: ParsedBaseStyleProps): void;
}

export * from './Default';
export * from './Image';
export * from './Text';
