import {
  CanvasConfig,
  ContextService,
  CSSRGB,
  DisplayObject,
  DisplayObjectPool,
  ParsedBaseStyleProps,
  ParsedCircleStyleProps,
  RenderingContext,
  RenderingPlugin,
  RenderingPluginContribution,
  RenderingService,
  Shape,
} from '@antv/g';
import type { Canvas, CanvasKit } from 'canvaskit-wasm';
import { inject, singleton } from 'mana-syringe';
import type { CanvasKitContext } from './interfaces';

/**
 * @see https://skia.org/docs/user/modules/quickstart/
 */
@singleton({ contrib: RenderingPluginContribution })
export class CanvaskitRendererPlugin implements RenderingPlugin {
  static tag = 'CanvaskitRenderer';

  @inject(DisplayObjectPool)
  private displayObjectPool: DisplayObjectPool;

  @inject(CanvasConfig)
  private canvasConfig: CanvasConfig;

  @inject(ContextService)
  private contextService: ContextService<CanvasKitContext>;

  @inject(RenderingContext)
  private renderingContext: RenderingContext;

  apply(renderingService: RenderingService) {
    renderingService.hooks.init.tapPromise(CanvaskitRendererPlugin.tag, async () => {
      const canvasKitContext = this.contextService.getContext();
      if (canvasKitContext) {
        console.log('inited...');
        // this.drawWithSurface(canvasKitContext);
      }
    });

    // renderingService.hooks.endFrame.tap(CanvaskitRendererPlugin.tag, () => {
    //   console.log('endframe...');

    //   const canvasKitContext = this.contextService.getContext();
    //   if (canvasKitContext) {
    //     this.drawWithSurface(canvasKitContext);
    //   }
    // });
  }

  private drawWithSurface(canvasKitContext: CanvasKitContext) {
    const { surface, CanvasKit } = canvasKitContext;
    surface.drawOnce((canvas: Canvas) => {
      canvas.clear(CanvasKit.WHITE);
      this.renderingContext.root.forEach((object: DisplayObject) => {
        this.renderDisplayObject(object, canvas, CanvasKit);
      });
    });
  }

  private renderDisplayObject(object: DisplayObject, canvas: Canvas, CanvasKit: CanvasKit) {
    const { fill, stroke, lineWidth, lineCap, lineJoin, miterLimit, opacity } =
      object.parsedStyle as ParsedBaseStyleProps;

    const paint = new CanvasKit.Paint();

    paint.setAlphaf(opacity.value);

    if (fill instanceof CSSRGB && !fill.isNone) {
      paint.setStyle(CanvasKit.PaintStyle.Fill);
      paint.setColor(
        CanvasKit.Color4f(
          Number(fill.r) / 255,
          Number(fill.g) / 255,
          Number(fill.b) / 255,
          Number(fill.alpha),
        ),
      );
    }

    if (stroke instanceof CSSRGB && !stroke.isNone) {
      paint.setStyle(CanvasKit.PaintStyle.Stroke);
      paint.setColor(
        CanvasKit.Color4f(
          Number(stroke.r) / 255,
          Number(stroke.g) / 255,
          Number(stroke.b) / 255,
          Number(stroke.alpha),
        ),
      );
    }

    /**
     * stroke
     */
    paint.setStrokeWidth(lineWidth.value);
    const STROKE_CAP_MAP = {
      butt: CanvasKit.StrokeCap.Butt,
      round: CanvasKit.StrokeCap.Round,
      square: CanvasKit.StrokeCap.Square,
    };
    paint.setStrokeCap(STROKE_CAP_MAP[lineCap.value]);
    const STROKE_JOIN_MAP = {
      bevel: CanvasKit.StrokeJoin.Bevel,
      round: CanvasKit.StrokeJoin.Round,
      miter: CanvasKit.StrokeJoin.Miter,
    };
    paint.setStrokeJoin(STROKE_JOIN_MAP[lineJoin.value]);
    paint.setStrokeMiter(miterLimit);

    paint.setAntiAlias(true);

    switch (object.nodeName) {
      case Shape.CIRCLE: {
        const { r } = object.parsedStyle as ParsedCircleStyleProps;
        canvas.drawCircle(100, 100, r.value, paint);
        break;
      }
    }

    paint.delete();
  }
}
