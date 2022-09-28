import type { BaseStyleProps, Canvas, DisplayObject, PointLike, Rectangle } from '@antv/g-lite';
import { definedProps, Ellipse, Group, Rect, Path, Shape } from '@antv/g-lite';
import type { PathArray } from '@antv/util';
import type {
  CustomElementOption,
  KeyframeAnimation,
  KeyframeAnimationKeyframe,
  ParseContext,
} from './parser';

export class LottieAnimation {
  constructor(
    private width: number,
    private height: number,
    private elements: CustomElementOption[],
    private context: ParseContext,
  ) {
    this.displayObjects = elements.map((element) => this.buildHierachy(element));

    // console.log(elements, this.displayObjects);
  }

  private displayObjects: DisplayObject[];
  private keyframeAnimationMap = new WeakMap<DisplayObject, KeyframeAnimation[]>();

  private buildHierachy(element: CustomElementOption) {
    // @ts-ignore
    const {
      type,
      name,
      anchorX = 0,
      anchorY = 0,
      rotation = 0,
      scaleX = 1,
      scaleY = 1,
      x = 0,
      y = 0,
      // skew = 0,
      // skewAxis = 0,
      children,
      shape,
      style,
      keyframeAnimation,
    } = element;

    let displayObject: DisplayObject;

    // @see https://lottiefiles.github.io/lottie-docs/concepts/#transform
    const transformStyle: Pick<BaseStyleProps, 'transform' | 'transformOrigin'> = {
      transformOrigin: `${anchorX}px ${anchorY}px`,
      transform: `translate(${x - anchorX}px, ${
        y - anchorY
      }px) scale(${scaleX}, ${scaleY}) rotate(${rotation}deg)`,
    };

    console.log(transformStyle);

    // TODO: repeater @see https://lottiefiles.github.io/lottie-docs/shapes/#repeater

    // @see https://lottiefiles.github.io/lottie-docs/shapes/#shape
    // TODO: polystar, convert to Bezier @see https://lottiefiles.github.io/lottie-docs/rendering/#polystar
    if (type === Shape.GROUP) {
      displayObject = new Group({
        style: {
          ...transformStyle,
        },
      });
    } else if (type === Shape.ELLIPSE) {
      displayObject = new Ellipse({
        style: {
          cx: shape.cx,
          cy: shape.cy,
          rx: shape.rx,
          ry: shape.ry,
          ...transformStyle,
        },
      });
    } else if (type === Shape.PATH) {
      // @see https://lottiefiles.github.io/lottie-docs/shapes/#path
      const { close, v, in: i, out } = shape;
      const d: PathArray = [] as unknown as PathArray;

      d.push(['M', v[0][0], v[0][1]]);

      for (let n = 1; n < v.length; n++) {
        // @see https://lottiefiles.github.io/lottie-docs/concepts/#bezier
        // The nth bezier segment is defined as:
        // v[n], v[n]+o[n], v[n+1]+i[n+1], v[n+1]
        d.push(['C', out[n - 1][0], out[n - 1][1], i[n][0], i[n][1], v[n][0], v[n][1]]);
      }

      if (close) {
        d.push(['Z']);
      }
      displayObject = new Path({
        style: {
          d, // use Path Array which can be skipped when parsing
          ...transformStyle,
        },
      });
    } else if (type === Shape.RECT) {
      // @see https://lottiefiles.github.io/lottie-docs/shapes/#rectangle
      const { x, y, width, height, r } = shape;
      displayObject = new Rect({
        style: {
          x,
          y,
          width,
          height,
          radius: r,
          anchor: [0.5, 0.5],
          ...transformStyle,
        },
      });
    }

    if (name) {
      displayObject.name = name;
    }

    if (style) {
      // { fill, fillOpacity, opacity, lineDash, lineDashOffset }
      displayObject.attr(style);
    }

    if (keyframeAnimation) {
      this.keyframeAnimationMap.set(displayObject, keyframeAnimation);
    }

    if (children) {
      const childNodes = children.map((child) => this.buildHierachy(child));
      displayObject.append(...childNodes);
    }

    return displayObject;
  }

  /**
   * Returns the animation duration in seconds.
   */
  duration() {
    return (this.context.endFrame - this.context.startFrame) * this.context.frameTime;
  }
  /**
   * Returns the animation frame rate (frames / second).
   */
  fps() {
    return this.context.fps;
  }

  private isSameKeyframeOptions(
    options1: Omit<KeyframeAnimation, 'keyframes'>,
    options2: Omit<KeyframeAnimation, 'keyframes'>,
  ) {
    return (
      options1.delay === options2.delay &&
      options1.duration === options2.duration &&
      options1.easing === options2.easing &&
      options1.loop === options2.loop
    );
  }

  private isSameKeyframes(
    keyframe1: KeyframeAnimationKeyframe,
    keyframe2: KeyframeAnimationKeyframe,
  ) {
    return keyframe1.easing === keyframe2.easing && keyframe1.offset === keyframe2.offset;
  }

  /**
   * Draws current animation frame. Must call seek or seekFrame first.
   * @param canvas
   * @param dstRect
   */
  render(canvas: Canvas, dstRect?: Rectangle) {
    this.displayObjects.forEach((object) => {
      canvas.appendChild(object);
    });

    this.displayObjects.forEach((parent) => {
      parent.forEach((child: DisplayObject) => {
        const keyframeAnimation = this.keyframeAnimationMap.get(child);
        if (keyframeAnimation && keyframeAnimation.length) {
          const keyframesOptions: [
            KeyframeAnimationKeyframe[],
            Omit<KeyframeAnimation, 'keyframes'>,
          ][] = [];

          keyframeAnimation.map(({ delay = 0, duration, easing, loop, keyframes }) => {
            const formattedKeyframes = keyframes.map((keyframe) =>
              definedProps(keyframe),
            ) as KeyframeAnimationKeyframe[];
            const options = definedProps({
              delay,
              duration,
              easing,
              iterations: !!loop ? Infinity : 1,
            }) as Omit<KeyframeAnimation, 'keyframes'>;

            keyframesOptions.push([formattedKeyframes, options]);
          });

          const mergedKeyframesOptions = [keyframesOptions[0]];
          // merge [{ offset: 0, cx: 1 }, { offset: 0, cy: 1 }] into { offset: 0, cx: 1, cy: 1 }
          for (let i = 1; i < keyframesOptions.length; i++) {
            const [currentKeyframes, currentOptions] = keyframesOptions[i];
            // can merge options?
            const existedKeyframeOptions = mergedKeyframesOptions.find(
              ([keyframes, options]) =>
                keyframes.length === currentKeyframes.length &&
                this.isSameKeyframeOptions(currentOptions, options),
            );

            if (existedKeyframeOptions) {
              currentKeyframes.forEach((currentKeyframe) => {
                const existedKeyframe = existedKeyframeOptions[0].find((keyframe) =>
                  this.isSameKeyframes(currentKeyframe, keyframe),
                );

                if (existedKeyframe) {
                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                  const { offset, easing: e = 'linear', ...rest } = currentKeyframe;

                  // merge interpolated properties
                  Object.assign(existedKeyframe, rest);
                } else {
                  // append if cannot be merged
                  existedKeyframeOptions[0].push(currentKeyframe);
                }
              });
            } else {
              // cannot be merged since options are different
              mergedKeyframesOptions.push(keyframesOptions[i]);
            }
          }

          // console.log(mergedKeyframesOptions);

          // TODO: return animations
          mergedKeyframesOptions.map(([formattedKeyframes, options]) => {
            // format interpolated properties, e.g. scaleX -> transform
            this.formatKeyframes(formattedKeyframes, child);
            return child.animate(formattedKeyframes, options);
          });
        }
      });
    });
  }

  private formatKeyframes(keyframes: Record<string, any>[], object: DisplayObject) {
    keyframes.forEach((keyframe) => {
      if ('scaleX' in keyframe) {
        keyframe.transform = (keyframe.transform || '') + ` scaleX(${keyframe.scaleX})`;
        delete keyframe.scaleX;
      }
      if ('scaleY' in keyframe) {
        keyframe.transform = (keyframe.transform || '') + ` scaleY(${keyframe.scaleY})`;
        delete keyframe.scaleY;
      }

      // TODO: rotation, skew
      if ('rotation' in keyframe) {
        keyframe.transform = (keyframe.transform || '') + ` rotate(${keyframe.rotation}deg)`;
        delete keyframe.rotation;
      }

      if ('x' in keyframe && object.nodeName === Shape.ELLIPSE) {
        keyframe.cx = keyframe.x;
        delete keyframe.x;
      }
      if ('y' in keyframe && object.nodeName === Shape.ELLIPSE) {
        keyframe.cy = keyframe.y;
        delete keyframe.y;
      }
    });

    // padding offset = 1
    if (keyframes[keyframes.length - 1].offset !== 1) {
      keyframes.push({
        ...keyframes[keyframes.length - 1],
        offset: 1,
      });
    }

    return keyframes;
  }

  /**
   * Update the animation state to match |t|, specified as a frame index
   * i.e. relative to duration() * fps().
   *
   * Returns the rectangle that was affected by this animation.
   *
   * @param frame - Fractional values are allowed and meaningful - e.g.
   *                0.0 -> first frame
   *                1.0 -> second frame
   *                0.5 -> halfway between first and second frame
   * @param damageRect - will copy damage frame into this if provided.
   */
  seekFrame(frame: number, damageRect?: Rectangle) {}

  /**
   * Return the size of this animation.
   * @param outputSize - If provided, the size will be copied into here as width, height.
   */
  size(outputSize?: PointLike) {
    return { width: this.width, height: this.height };
  }

  /**
   * Bodymoving version
   */
  version() {
    return this.context.version;
  }
}
