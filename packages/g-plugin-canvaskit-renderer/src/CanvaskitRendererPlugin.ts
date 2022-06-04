import {
  CanvasConfig,
  ContextService,
  CSSGradientValue,
  CSSRGB,
  DisplayObject,
  GradientPatternType,
  isNil,
  LinearGradient,
  parseColor,
  ParsedBaseStyleProps,
  RadialGradient,
  RenderingContext,
  RenderingPlugin,
  RenderingPluginContribution,
  RenderingService,
  Shape,
} from '@antv/g';
import type { Canvas, CanvasKit, Paint } from 'canvaskit-wasm';
import { inject, singleton } from 'mana-syringe';
import { FontLoader } from './FontLoader';
import {
  CanvasKitContext,
  CanvaskitRendererPluginOptions,
  RendererContribution,
  RendererContributionFactory,
} from './interfaces';

/**
 * @see https://skia.org/docs/user/modules/quickstart/
 */
@singleton({ contrib: RenderingPluginContribution })
export class CanvaskitRendererPlugin implements RenderingPlugin {
  static tag = 'CanvaskitRenderer';

  @inject(CanvasConfig)
  private canvasConfig: CanvasConfig;

  @inject(ContextService)
  private contextService: ContextService<CanvasKitContext>;

  @inject(RenderingContext)
  private renderingContext: RenderingContext;

  @inject(RendererContributionFactory)
  private rendererContributionFactory: (tagName: Shape | string) => RendererContribution;

  @inject(FontLoader)
  private fontLoader: FontLoader;

  @inject(CanvaskitRendererPluginOptions)
  private canvaskitRendererPluginOptions: CanvaskitRendererPluginOptions;

  private destroyed = false;

  apply(renderingService: RenderingService) {
    renderingService.hooks.init.tapPromise(CanvaskitRendererPlugin.tag, async () => {
      const canvasKitContext = this.contextService.getContext();
      const { surface, CanvasKit } = canvasKitContext;
      const { fonts } = this.canvaskitRendererPluginOptions;

      // load default fonts 'sans-serif', 'NotoSansCJK-Regular.ttf'
      await Promise.all(
        fonts.map(({ name, url }) => this.fontLoader.loadFont(CanvasKit, name, url)),
      );

      const { background } = this.canvasConfig;
      const clearColor = parseColor(background) as CSSRGB;

      // scale all drawing operations by the dpr
      // @see https://www.html5rocks.com/en/tutorials/canvas/hidpi/
      const dpr = this.contextService.getDPR();
      surface.getCanvas().scale(dpr, dpr);
      const drawFrame = (canvas: Canvas) => {
        if (this.destroyed) {
          return;
        }

        canvas.clear(
          CanvasKit.Color4f(
            Number(clearColor.r) / 255,
            Number(clearColor.g) / 255,
            Number(clearColor.b) / 255,
            Number(clearColor.alpha),
          ),
        );

        this.drawWithSurface(canvas, CanvasKit);

        surface.requestAnimationFrame(drawFrame);
      };
      surface.requestAnimationFrame(drawFrame);
    });

    renderingService.hooks.destroy.tap(CanvaskitRendererPlugin.tag, () => {
      this.destroyed = true;
    });
  }

  private drawWithSurface(canvas: Canvas, CanvasKit: CanvasKit) {
    this.renderingContext.root.forEach((object: DisplayObject) => {
      this.renderDisplayObject(object, canvas, CanvasKit);
    });
  }

  private addGradient(
    object: DisplayObject,
    stroke: CSSGradientValue,
    paint: Paint,
    CanvasKit: CanvasKit,
  ) {
    const bounds = object.getGeometryBounds();
    const width = (bounds && bounds.halfExtents[0] * 2) || 0;
    const height = (bounds && bounds.halfExtents[1] * 2) || 0;

    if (stroke.type === GradientPatternType.LinearGradient) {
      // @see https://fiddle.skia.org/c/@GradientShader_MakeLinear
      const { x0, y0, x1, y1, steps } = stroke.value as LinearGradient;
      const pos: number[] = [];
      const colors: Float32Array[] = [];
      steps.forEach(([offset, color]) => {
        pos.push(Number(offset));
        const c = parseColor(color) as CSSRGB;
        colors.push(
          new Float32Array([
            Number(c.r) / 255,
            Number(c.g) / 255,
            Number(c.b) / 255,
            Number(c.alpha),
          ]),
        );
      });
      const gradient = CanvasKit.Shader.MakeLinearGradient(
        [x0 * width, y0 * height],
        [x1 * width, y1 * height],
        colors,
        pos,
        CanvasKit.TileMode.Mirror,
      );
      paint.setShader(gradient);
    } else if (stroke.type === GradientPatternType.RadialGradient) {
      const { x0, y0, x1, y1, r1, steps } = stroke.value as RadialGradient;
      const r = Math.sqrt(width * width + height * height) / 2;
      const pos: number[] = [];
      const colors: Float32Array[] = [];
      steps.forEach(([offset, color]) => {
        pos.push(Number(offset));
        const c = parseColor(color) as CSSRGB;
        colors.push(
          new Float32Array([
            Number(c.r) / 255,
            Number(c.g) / 255,
            Number(c.b) / 255,
            Number(c.alpha),
          ]),
        );
      });
      // @see https://fiddle.skia.org/c/@radial_gradient_test
      const gradient = CanvasKit.Shader.MakeRadialGradient(
        [x0 * width, y0 * height],
        r1 * r,
        colors,
        pos,
        CanvasKit.TileMode.Mirror,
      );
      paint.setShader(gradient);
    }
  }

  private renderDisplayObject(object: DisplayObject, canvas: Canvas, CanvasKit: CanvasKit) {
    if (
      !object.isVisible() ||
      object.isCulled() ||
      object.nodeName == Shape.GROUP ||
      object.nodeName == Shape.HTML ||
      object.nodeName == Shape.MESH
    ) {
      return;
    }

    canvas.save();

    const {
      fill,
      stroke,
      lineWidth,
      lineCap,
      lineJoin,
      lineDash,
      lineDashOffset,
      miterLimit,
      opacity,
      fillOpacity,
      strokeOpacity,
      shadowBlur,
      shadowColor,
    } = object.parsedStyle as ParsedBaseStyleProps;

    const hasFill = !isNil(fill) && !(fill as CSSRGB).isNone;
    const hasStroke = !isNil(stroke) && !(stroke as CSSRGB).isNone;

    let fillPaint: Paint = null;
    let strokePaint: Paint = null;
    let shadowFillPaint: Paint = null;
    let shadowStrokePaint: Paint = null;

    if (hasFill) {
      fillPaint = new CanvasKit.Paint();
      fillPaint.setAntiAlias(true);
      fillPaint.setStyle(CanvasKit.PaintStyle.Fill);
      if (fill instanceof CSSRGB && !fill.isNone) {
        fillPaint.setColor(
          CanvasKit.Color4f(
            Number(fill.r) / 255,
            Number(fill.g) / 255,
            Number(fill.b) / 255,
            Number(fill.alpha),
          ),
        );
      } else if (fill instanceof CSSGradientValue) {
        this.addGradient(object, fill, fillPaint, CanvasKit);
      }
      fillPaint.setAlphaf(fillOpacity.value * opacity.value);
    }

    if (hasStroke) {
      strokePaint = new CanvasKit.Paint();
      /**
       * stroke
       */
      if (!isNil(lineWidth) && lineWidth.value > 0) {
        strokePaint.setAntiAlias(true);
        strokePaint.setStyle(CanvasKit.PaintStyle.Stroke);
        if (stroke instanceof CSSRGB && !stroke.isNone) {
          strokePaint.setColor(
            CanvasKit.Color4f(
              Number(stroke.r) / 255,
              Number(stroke.g) / 255,
              Number(stroke.b) / 255,
              Number(stroke.alpha),
            ),
          );
        } else if (stroke instanceof CSSGradientValue) {
          this.addGradient(object, stroke, strokePaint, CanvasKit);
        }

        strokePaint.setAlphaf(strokeOpacity.value * opacity.value);

        strokePaint.setStrokeWidth(lineWidth.value);
        const STROKE_CAP_MAP = {
          butt: CanvasKit.StrokeCap.Butt,
          round: CanvasKit.StrokeCap.Round,
          square: CanvasKit.StrokeCap.Square,
        };
        strokePaint.setStrokeCap(STROKE_CAP_MAP[lineCap.value]);
        const STROKE_JOIN_MAP = {
          bevel: CanvasKit.StrokeJoin.Bevel,
          round: CanvasKit.StrokeJoin.Round,
          miter: CanvasKit.StrokeJoin.Miter,
        };
        strokePaint.setStrokeJoin(STROKE_JOIN_MAP[lineJoin.value]);
        strokePaint.setStrokeMiter(miterLimit);

        if (lineDash) {
          strokePaint.setPathEffect(
            CanvasKit.PathEffect.MakeDash(
              lineDash.map((d) => d.value),
              lineDashOffset?.value || 0,
            ),
          );
        }
      }
    }

    if (hasFill && !isNil(shadowColor)) {
      shadowFillPaint = fillPaint.copy();
      shadowFillPaint.setAntiAlias(true);
      shadowFillPaint.setColor(
        CanvasKit.Color4f(
          Number(shadowColor.r) / 255,
          Number(shadowColor.g) / 255,
          Number(shadowColor.b) / 255,
          Number(shadowColor.alpha),
        ),
      );
      const blurSigma = ((shadowBlur && shadowBlur.value) || 0) / 2;
      shadowFillPaint.setMaskFilter(
        CanvasKit.MaskFilter.MakeBlur(CanvasKit.BlurStyle.Normal, blurSigma, false),
      );
    }
    if (hasStroke && !isNil(shadowColor)) {
      shadowStrokePaint = strokePaint.copy();
      shadowStrokePaint.setAntiAlias(true);
      shadowStrokePaint.setColor(
        CanvasKit.Color4f(
          Number(shadowColor.r) / 255,
          Number(shadowColor.g) / 255,
          Number(shadowColor.b) / 255,
          Number(shadowColor.alpha),
        ),
      );
      const blurSigma = ((shadowBlur && shadowBlur.value) || 0) / 2;
      shadowStrokePaint.setMaskFilter(
        CanvasKit.MaskFilter.MakeBlur(CanvasKit.BlurStyle.Normal, blurSigma, false),
      );
    }

    /**
     * world transform
     */
    const [tx, ty] = object.getPosition();
    const [sx, sy] = object.getScale();
    const rot = object.getEulerAngles();

    // @see https://fiddle.skia.org/c/68b54cb7d3435f46e532e6d565a59c49
    canvas.translate(tx, ty);
    canvas.rotate(rot, 0, 0);
    canvas.scale(sx, sy);

    const contentBounds = object.getGeometryBounds();
    if (contentBounds) {
      const { halfExtents } = contentBounds;

      // apply anchor, use true size, not include stroke,
      // eg. bounds = true size + half lineWidth
      const { anchor } = (object.parsedStyle || {}) as ParsedBaseStyleProps;
      canvas.translate(
        -((anchor && anchor[0].value) || 0) * halfExtents[0] * 2,
        -((anchor && anchor[1].value) || 0) * halfExtents[1] * 2,
      );
    }

    const renderer = this.rendererContributionFactory(object.nodeName);
    if (renderer) {
      renderer.render(object, {
        fillPaint,
        strokePaint,
        shadowFillPaint,
        shadowStrokePaint,
        canvas,
      });
    }

    fillPaint?.delete();
    strokePaint?.delete();
    shadowFillPaint?.delete();
    shadowStrokePaint?.delete();

    canvas.restore();
  }
}
