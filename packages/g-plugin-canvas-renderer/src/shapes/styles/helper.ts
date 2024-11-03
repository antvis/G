import {
  CanvasContext,
  CSSGradientValue,
  DisplayObject,
  GlobalRuntime,
  LinearGradient,
  Pattern,
  RadialGradient,
  Rect,
  GradientType,
} from '@antv/g-lite';
import type { ImagePool } from '@antv/g-plugin-image-loader';
import {
  CanvasRendererPlugin,
  type RenderState,
} from '../../CanvasRendererPlugin';

export function getPattern(
  pattern: Pattern,
  object: DisplayObject,
  context: CanvasRenderingContext2D,
  canvasContext: CanvasContext,
  plugin: CanvasRendererPlugin,
  runtime: GlobalRuntime,
  imagePool: ImagePool,
): CanvasPattern {
  let $offscreenCanvas: HTMLCanvasElement;
  let dpr: number;
  if ((pattern.image as Rect).nodeName === 'rect') {
    const { width, height } = (pattern.image as Rect).parsedStyle;
    dpr = canvasContext.contextService.getDPR();
    const { offscreenCanvas } = canvasContext.config;
    $offscreenCanvas = runtime.offscreenCanvasCreator.getOrCreateCanvas(
      offscreenCanvas,
    ) as HTMLCanvasElement;

    $offscreenCanvas.width = width * dpr;
    $offscreenCanvas.height = height * dpr;

    const offscreenCanvasContext =
      runtime.offscreenCanvasCreator.getOrCreateContext(
        offscreenCanvas,
      ) as CanvasRenderingContext2D;

    const renderState: RenderState = {
      restoreStack: [],
      prevObject: null,
      currentContext: new Map(),
    };

    // offscreenCanvasContext.scale(1 / dpr, 1 / dpr);

    (pattern.image as Rect).forEach((object: DisplayObject) => {
      plugin.renderDisplayObject(
        object,
        offscreenCanvasContext,
        canvasContext,
        renderState,
        runtime,
      );
    });

    renderState.restoreStack.forEach(() => {
      offscreenCanvasContext.restore();
    });
  }

  const canvasPattern = imagePool.getOrCreatePatternSync(
    object,
    pattern,
    context,
    $offscreenCanvas,
    dpr,
    object.getGeometryBounds().min,
    () => {
      // set dirty rectangle flag
      object.renderable.dirty = true;
      canvasContext.renderingService.dirtify();
    },
  );

  return canvasPattern;
}

export function getColor(
  parsedColor: CSSGradientValue,
  object: DisplayObject,
  context: CanvasRenderingContext2D,
  imagePool: ImagePool,
) {
  let color: CanvasGradient | string;

  if (
    parsedColor.type === GradientType.LinearGradient ||
    parsedColor.type === GradientType.RadialGradient
  ) {
    const bounds = object.getGeometryBounds();
    const width = (bounds && bounds.halfExtents[0] * 2) || 1;
    const height = (bounds && bounds.halfExtents[1] * 2) || 1;
    const min = (bounds && bounds.min) || [0, 0];
    color = imagePool.getOrCreateGradient(
      {
        type: parsedColor.type,
        ...(parsedColor.value as LinearGradient & RadialGradient),
        min: min as [number, number],
        width,
        height,
      },
      context,
    );
  }

  return color;
}
