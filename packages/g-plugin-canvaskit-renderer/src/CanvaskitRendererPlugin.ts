import {
  Camera,
  CanvasConfig,
  ContextService,
  CSSGradientValue,
  CSSRGB,
  DefaultCamera,
  DisplayObject,
  getEuler,
  GradientPatternType,
  inject,
  isNil,
  LinearGradient,
  parseColor,
  ParsedBaseStyleProps,
  rad2deg,
  RadialGradient,
  RenderingContext,
  RenderingPlugin,
  RenderingPluginContribution,
  RenderingService,
  Shape,
  singleton,
} from '@antv/g';
import type {
  Canvas,
  CanvasKit,
  InputRect,
  ManagedSkottieAnimation,
  Paint,
  Particles,
} from 'canvaskit-wasm';
import { mat4, quat, vec3 } from 'gl-matrix';
import { FontLoader } from './FontLoader';
import type { CanvasKitContext, RendererContribution } from './interfaces';
import { CanvaskitRendererPluginOptions, RendererContributionFactory } from './interfaces';

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

  @inject(DefaultCamera)
  private camera: Camera;

  @inject(RendererContributionFactory)
  private rendererContributionFactory: (tagName: Shape | string) => RendererContribution;

  @inject(FontLoader)
  private fontLoader: FontLoader;

  @inject(CanvaskitRendererPluginOptions)
  private canvaskitRendererPluginOptions: CanvaskitRendererPluginOptions;

  private destroyed = false;

  private animations: {
    name: string;
    jsonStr: string;
    bounds: InputRect;
    assets?: any;
    duration: number;
    size: Float32Array;
    animation: ManagedSkottieAnimation;
  }[] = [];

  private particlesList: {
    particles: Particles;
    onFrame: (canvas: Canvas) => void;
  }[] = [];

  playAnimation(name: string, jsonStr: string, bounds?: InputRect, assets?: any) {
    const canvasKitContext = this.contextService.getContext();
    const { CanvasKit } = canvasKitContext;
    const animation = CanvasKit.MakeManagedAnimation(jsonStr, assets);
    const duration = animation.duration() * 1000;
    const size = animation.size();
    this.animations.push({
      name,
      jsonStr,
      bounds: bounds || CanvasKit.LTRBRect(0, 0, size[0], size[1]),
      assets,
      duration,
      size,
      animation,
    });
    return animation;
  }

  createParticles(jsonStr: string, onFrame?: (canvas: Canvas) => void, assets?: any) {
    const canvasKitContext = this.contextService.getContext();
    const { CanvasKit } = canvasKitContext;
    const particles = CanvasKit.MakeParticles(jsonStr, assets);
    this.particlesList.push({ particles, onFrame });
    return particles;
  }

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

      const firstFrame = Date.now();
      const tmpVec3 = vec3.create();
      const tmpQuat = quat.create();

      const drawFrame = (canvas: Canvas) => {
        if (this.destroyed || surface.isDeleted()) {
          return;
        }

        canvas.save();

        this.applyCamera(canvas, tmpVec3, tmpQuat);

        canvas.clear(
          CanvasKit.Color4f(
            Number(clearColor.r) / 255,
            Number(clearColor.g) / 255,
            Number(clearColor.b) / 255,
            Number(clearColor.alpha),
          ),
        );

        this.drawAnimations(canvas, firstFrame);
        this.drawParticles(canvas);
        this.drawWithSurface(canvas, CanvasKit);

        canvas.restore();

        surface.requestAnimationFrame(drawFrame);
      };
      surface.requestAnimationFrame(drawFrame);
    });

    renderingService.hooks.destroy.tap(CanvaskitRendererPlugin.tag, () => {
      this.destroyed = true;
      this.animations.forEach(({ animation }) => {
        animation.delete();
      });
      this.animations = [];
      this.particlesList.forEach(({ particles }) => {
        particles.delete();
      });
      this.particlesList = [];
      this.fontLoader.destroy();
    });
  }

  private applyCamera(canvas: Canvas, tmpVec3: vec3, tmpQuat: quat) {
    const transform = this.camera.getOrthoMatrix();
    const [tx, ty] = mat4.getTranslation(tmpVec3, transform);
    const [sx, sy] = mat4.getScaling(tmpVec3, transform);
    const rotation = mat4.getRotation(tmpQuat, transform);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [eux, euy, euz] = getEuler(tmpVec3, rotation);
    const rot = rad2deg(euz);

    canvas.translate(tx, ty);
    canvas.rotate(rot, 0, 0);
    canvas.scale(sx, sy);
  }

  private drawAnimations(canvas: Canvas, firstFrame: number) {
    const rectLeft = 0;
    const rectTop = 1;
    const rectRight = 2;
    const rectBottom = 3;
    this.animations.forEach(({ duration, animation, bounds }, i) => {
      if (animation.isDeleted()) {
        this.animations.splice(i, 1);
      }

      const seek = ((Date.now() - firstFrame) / duration) % 1.0;
      const damage = animation.seek(seek);

      if (damage[rectRight] > damage[rectLeft] && damage[rectBottom] > damage[rectTop]) {
        animation.render(canvas, bounds);
      }
    });
  }

  private drawParticles(canvas: Canvas) {
    this.particlesList.forEach(({ particles, onFrame }, i) => {
      if (particles.isDeleted()) {
        this.particlesList.splice(i, 1);
      }

      canvas.save();
      if (onFrame) {
        onFrame(canvas);
      }
      particles.update(Date.now() / 1000.0);
      particles.draw(canvas);
      canvas.restore();
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
      const { x0, y0, r1, steps } = stroke.value as RadialGradient;
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
