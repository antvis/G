import type {
  CanvasContext,
  DisplayObject,
  ParsedBaseStyleProps,
} from '@antv/g-lite';
import { CanvasRendererPlugin } from '../../CanvasRendererPlugin';

export interface StyleRenderer {
  render: (
    context: CanvasRenderingContext2D,
    parsedStyle: ParsedBaseStyleProps,
    object: DisplayObject,
    canvasContext: CanvasContext,
    plugin: CanvasRendererPlugin,
  ) => void;
}
