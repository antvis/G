import type { BaseStyleProps, Canvas, DisplayObject, PointLike, Rectangle } from '@antv/g-lite';
import { definedProps, Ellipse, Group, Rect, Path, Image, Shape } from '@antv/g-lite';
import type { PathArray } from '@antv/util';
import type {
  CustomElementOption,
  KeyframeAnimation,
  KeyframeAnimationKeyframe,
  ParseContext,
} from './parser';

const eps = 0.0001;

/**
 * Provides some control methods like:
 * - play
 * - pause
 * - stop
 * - goToAndStop
 * - goToAndPlay
 * @see https://github.com/airbnb/lottie-web/blob/master/player/js/animation/AnimationItem.js
 */
export class LottieAnimation {
  constructor(
    private width: number,
    private height: number,
    private elements: CustomElementOption[],
    private context: ParseContext,
  ) {
    this.displayObjects = elements.map((element) => this.buildHierachy(element));

    // TODO: preload images
    // TODO: preload fonts
  }

  private displayObjects: DisplayObject[];
  private keyframeAnimationMap = new WeakMap<DisplayObject, KeyframeAnimation[]>();
  private displayObjectElementMap = new WeakMap<DisplayObject, CustomElementOption>();

  private generateTransform(tx: number, ty: number, scaleX: number, scaleY: number, rotation) {
    let transformStr = '';
    if (tx !== 0 || ty !== 0) {
      transformStr += `translate(${tx}, ${ty})`;
    }
    if (scaleX !== 1 || scaleY !== 1) {
      transformStr += ` scale(${scaleX === 0 ? eps : scaleX}, ${scaleY === 0 ? eps : scaleY})`;
    }
    if (rotation !== 0) {
      transformStr += ` rotate(${rotation}deg)`;
    }
    return transformStr;
  }

  private buildHierachy(element: CustomElementOption) {
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
    const transform = this.generateTransform(x - anchorX, y - anchorY, scaleX, scaleY, rotation);

    // TODO: repeater @see https://lottiefiles.github.io/lottie-docs/shapes/#repeater

    // @see https://lottiefiles.github.io/lottie-docs/shapes/#shape
    // TODO: polystar, convert to Bezier @see https://lottiefiles.github.io/lottie-docs/rendering/#polystar
    if (type === Shape.GROUP) {
      displayObject = new Group({
        style: {
          transformOrigin: `${anchorX}px ${anchorY}px`,
          transform,
        },
      });
    } else if (type === Shape.ELLIPSE) {
      const { cx, cy, rx, ry } = shape;
      displayObject = new Ellipse({
        style: {
          cx,
          cy,
          rx,
          ry,
          // reset transform-origin based on anchor & center
          transformOrigin: `${anchorX - cx + rx}px ${anchorY - cy + ry}px`,
          transform,
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
        d.push([
          'C',
          out[v.length - 1][0],
          out[v.length - 1][1],
          i[0][0],
          i[0][1],
          v[0][0],
          v[0][1],
        ]);
        d.push(['Z']);
      }
      displayObject = new Path({
        style: {
          d, // use Path Array which can be skipped when parsing
          transformOrigin: `${anchorX}px ${anchorY}px`,
          transform,
        },
      });
    } else if (type === Shape.RECT) {
      // @see https://lottiefiles.github.io/lottie-docs/shapes/#rectangle
      const { x: cx, y: cy, width, height, r } = shape;

      displayObject = new Rect({
        style: {
          x: cx,
          y: cy,
          width,
          height,
          anchor: [0.5, 0.5], // position means the center of the rectangle
          radius: r,
          transformOrigin: `${anchorX - cx + width / 2}px ${anchorY - cy + height / 2}px`,
          transform,
        },
      });
    } else if (type === Shape.IMAGE) {
      const { width, height, src } = shape;

      displayObject = new Image({
        style: {
          x: 0,
          y: 0,
          width,
          height,
          src,
          transformOrigin: `${anchorX}px ${anchorY}px`,
          transform,
        },
      });
    }

    if (name) {
      displayObject.name = name;
    }

    // TODO: match name `mn`, used in expressions

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

    this.displayObjectElementMap.set(displayObject, element);

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
   */
  render(canvas: Canvas) {
    const wrapper = new Group();
    wrapper.append(...this.displayObjects);
    canvas.appendChild(wrapper);

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

          // TODO: return animations
          mergedKeyframesOptions.map(([merged, options]) => {
            // format interpolated properties, e.g. scaleX -> transform
            const formatted = this.formatKeyframes(merged, child);

            if (formatted.length) {
              console.log(child, formatted);

              return child.animate(formatted, options);
            }
          });
        }
      });
    });

    return wrapper;
  }

  private formatKeyframes(keyframes: Record<string, any>[], object: DisplayObject) {
    keyframes.forEach((keyframe) => {
      if ('offsetPath' in keyframe) {
        if (!object.style.offsetPath) {
          object.style.offsetPath = new Path({
            style: {
              d: keyframe.offsetPath,
              // d: 'M200 200 L 400 200',
            },
          });
        }
        delete keyframe.offsetPath;
        // offsetPath should override x/y
        delete keyframe.x;
        delete keyframe.y;
      }

      if ('scaleX' in keyframe) {
        keyframe.transform =
          (keyframe.transform || '') + ` scaleX(${keyframe.scaleX === 0 ? eps : keyframe.scaleX})`;
        delete keyframe.scaleX;
      }
      if ('scaleY' in keyframe) {
        keyframe.transform =
          (keyframe.transform || '') + ` scaleY(${keyframe.scaleY === 0 ? eps : keyframe.scaleY})`;
        delete keyframe.scaleY;
      }

      // TODO: rotation, skew
      if ('rotation' in keyframe) {
        keyframe.transform = (keyframe.transform || '') + ` rotate(${keyframe.rotation}deg)`;
        delete keyframe.rotation;
      }

      // manipulate cx/cy instead of x/y on ellipse
      if ('x' in keyframe && object.nodeName === Shape.ELLIPSE) {
        keyframe.cx = keyframe.x;
        delete keyframe.x;
      }
      if ('y' in keyframe && object.nodeName === Shape.ELLIPSE) {
        keyframe.cy = keyframe.y;
        delete keyframe.y;
      }
      // { style: { opacity: 1 } }
      if ('style' in keyframe) {
        Object.keys(keyframe.style).forEach((name) => {
          keyframe[name] = keyframe.style[name];
        });
        delete keyframe.style;
      }
    });

    // ignore empty interpolable attributes
    keyframes = keyframes.filter((keyframe) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { ignore, easing, offset, ...rest } = keyframe;
      return Object.keys(rest).length > 0;
    });

    if (keyframes.length) {
      // padding offset = 1
      if (keyframes[keyframes.length - 1].offset !== 1) {
        keyframes.push({
          ...keyframes[keyframes.length - 1],
          offset: 1,
        });
      }
    }

    return keyframes;
  }

  /**
   * Destroy all internal displayobjects.
   */
  destroy() {
    this.displayObjects.forEach((object) => {
      object.destroy();
    });
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
   * Bodymovin version
   */
  version() {
    return this.context.version;
  }
}
