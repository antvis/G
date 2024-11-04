import type {
  CanvasContext,
  DisplayObject,
  GlobalRuntime,
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
    runtime: GlobalRuntime,
  ) => void;
}
