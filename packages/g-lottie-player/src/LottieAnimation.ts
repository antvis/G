import type { IAnimation, PointLike } from '@antv/g-lite';
import {
  Canvas,
  DisplayObject,
  definedProps,
  Ellipse,
  Group,
  Rect,
  Path,
  Image,
  Shape,
  isCanvas,
  isDisplayObject,
} from '@antv/g-lite';
import { isNil, PathArray, path2String } from '@antv/util';
// import { mat4, quat, vec3 } from 'gl-matrix';
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
    this.displayObjects = elements.map((element) =>
      this.buildHierachy(element),
    );

    // TODO: preload images
    // TODO: preload fonts
  }

  private displayObjects: DisplayObject[];
  private keyframeAnimationMap = new WeakMap<
    DisplayObject,
    KeyframeAnimation[]
  >();
  private displayObjectElementMap = new WeakMap<
    DisplayObject,
    CustomElementOption
  >();

  private animations: IAnimation[] = [];

  private generateTransform(
    tx: number,
    ty: number,
    scaleX: number,
    scaleY: number,
    rotation,
  ) {
    let transformStr = '';
    if (tx !== 0 || ty !== 0) {
      transformStr += `translate(${tx}, ${ty})`;
    }
    if (scaleX !== 1 || scaleY !== 1) {
      transformStr += ` scale(${scaleX === 0 ? eps : scaleX}, ${
        scaleY === 0 ? eps : scaleY
      })`;
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
    const transform = this.generateTransform(
      x - anchorX,
      y - anchorY,
      scaleX,
      scaleY,
      rotation,
    );
    // const transformMat = mat4.fromRotationTranslationScaleOrigin(
    //   mat4.create(),
    //   quat.fromEuler(quat.create(), 0, 0, rotation),
    //   [x - anchorX, y - anchorY, 0],
    //   [scaleX, scaleY, 1],
    //   [anchorX, anchorY, 0],
    // );

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
      // const center = vec3.fromValues(cx, cy, 0);
      // vec3.transformMat4(center, center, transformMat);

      displayObject = new Ellipse({
        style: {
          // cx: center[0],
          // cy: center[1],
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
      const d = this.generatePathFromShape(shape);
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
          x: cx - width / 2,
          y: cy - height / 2,
          width,
          height,
          // anchor: [0.5, 0.5], // position means the center of the rectangle
          radius: r,
          transformOrigin: `${anchorX - cx + width / 2}px ${
            anchorY - cy + height / 2
          }px`,
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
      // { fill, fillOpacity, fillRule, opacity, lineDash, lineDashOffset }
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

  getAnimations() {
    return this.animations;
  }

  /**
   * Returns the animation duration in seconds or frames.
   * @see https://github.com/airbnb/lottie-web#getdurationinframes
   */
  getDuration(inFrames = false) {
    return (
      ((inFrames ? this.fps() : 1) *
        (this.context.endFrame - this.context.startFrame) *
        this.context.frameTime) /
      1000
    );
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
      options1.easing === options2.easing
    );
  }

  private isSameKeyframes(
    keyframe1: KeyframeAnimationKeyframe,
    keyframe2: KeyframeAnimationKeyframe,
  ) {
    // const { offset: o1, easing: e1, ...rest1 } = keyframe1;
    // const { offset: o2, easing: e2, ...rest2 } = keyframe2;
    // const isAllApplyToTransform =
    //   Object.keys(rest1).every((key) =>
    //     ['x', 'y', 'scaleX', 'scaleY', 'rotation'].includes(key),
    //   ) &&
    //   Object.keys(rest2).every((key) =>
    //     ['x', 'y', 'scaleX', 'scaleY', 'rotation'].includes(key),
    //   );

    return (
      keyframe1.offset === keyframe2.offset &&
      keyframe1.easing === keyframe2.easing
      // (keyframe1.easing === keyframe2.easing || isAllApplyToTransform)
    );
  }

  private generatePathFromShape(shape: Record<string, any>): PathArray {
    // @see https://lottiefiles.github.io/lottie-docs/shapes/#path
    const { close, v, in: i, out } = shape;
    const d: PathArray = [] as unknown as PathArray;

    d.push(['M', v[0][0], v[0][1]]);

    for (let n = 1; n < v.length; n++) {
      // @see https://lottiefiles.github.io/lottie-docs/concepts/#bezier
      // The nth bezier segment is defined as:
      // v[n], v[n]+o[n], v[n+1]+i[n+1], v[n+1]
      d.push([
        'C',
        out[n - 1][0],
        out[n - 1][1],
        i[n][0],
        i[n][1],
        v[n][0],
        v[n][1],
      ]);
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

    return d;
  }

  /**
   * render Lottie Group to canvas or a mounted display object
   */
  render(canvasOrDisplayObject: Canvas | DisplayObject) {
    const wrapper = new Group();
    wrapper.append(...this.displayObjects);

    if (isCanvas(canvasOrDisplayObject)) {
      canvasOrDisplayObject.appendChild(wrapper);
    } else if (isDisplayObject(canvasOrDisplayObject)) {
      if (!canvasOrDisplayObject.isConnected) {
        throw new Error(
          '[g-lottie-player]: Cannot render Lottie to an unmounted DisplayObject.',
        );
      } else {
        canvasOrDisplayObject.appendChild(wrapper);
      }
    } else {
      throw new Error(
        '[g-lottie-player]: We should render Lottie to a mounted DisplayObject or Canvas.',
      );
    }

    this.displayObjects.forEach((parent) => {
      parent.forEach((child: DisplayObject) => {
        let keyframeAnimation = this.keyframeAnimationMap.get(child);

        // console.log('keyframeAnimation', keyframeAnimation);

        const element = this.displayObjectElementMap.get(child);
        if (element && element.clipPath) {
          const { shape, keyframeAnimation } = element.clipPath;

          const clipPath = new Path();
          // use clipPath as target's siblings
          child.parentElement.appendChild(clipPath);
          child.style.clipPath = clipPath;
          if (shape) {
            clipPath.style.d = this.generatePathFromShape(shape);
          }

          // TODO: only support one clipPath now
          if (keyframeAnimation && keyframeAnimation.length) {
            const { delay, duration, easing, keyframes } = keyframeAnimation[0];

            // animate clipPath with its `d` property
            const clipPathAnimation = clipPath.animate(
              keyframes.map(({ offset, shape, easing }) => {
                return {
                  offset,
                  d: path2String(this.generatePathFromShape(shape)),
                  easing,
                };
              }),
              {
                delay,
                duration,
                easing,
                iterations: this.context.iterations,
              },
            );
            this.animations.push(clipPathAnimation);
          }
        }

        // account for animation only apply to visibility, e.g. spring
        const { visibilityStartOffset, visibilityEndOffset, visibilityFrame } =
          element;
        if (
          visibilityFrame &&
          (!keyframeAnimation || !keyframeAnimation.length)
        ) {
          keyframeAnimation = [
            {
              duration: this.context.frameTime * visibilityFrame,
              keyframes: [
                { offset: 0, style: { opacity: 1 } },
                { offset: 1, style: { opacity: 1 } },
              ],
            },
          ];
        }

        if (keyframeAnimation && keyframeAnimation.length) {
          const keyframesOptions: [
            KeyframeAnimationKeyframe[],
            Omit<KeyframeAnimation, 'keyframes'>,
          ][] = [];

          keyframeAnimation.forEach(
            ({ delay = 0, duration, easing, keyframes }) => {
              const formattedKeyframes = keyframes.map((keyframe) =>
                definedProps(keyframe),
              ) as KeyframeAnimationKeyframe[];
              const options = definedProps({
                delay,
                duration,
                easing,
                iterations: this.context.iterations,
                fill: this.context.fill,
              }) as Omit<KeyframeAnimation, 'keyframes'>;

              keyframesOptions.push([formattedKeyframes, options]);
            },
          );

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
                const existedKeyframe = existedKeyframeOptions[0].find(
                  (keyframe) => this.isSameKeyframes(currentKeyframe, keyframe),
                );

                if (existedKeyframe) {
                  const {
                    offset,
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    easing = 'linear',
                    ...rest
                  } = currentKeyframe;

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

          // restore animations for later use
          this.animations.push(
            ...mergedKeyframesOptions
              .map(([merged, options]) => {
                // format interpolated properties, e.g. scaleX -> transform
                const formatted = this.formatKeyframes(merged, child);

                if (formatted.length) {
                  // console.log(child, formatted);

                  const animation = child.animate(formatted, options);
                  if (
                    !isNil(visibilityStartOffset) &&
                    !isNil(visibilityEndOffset)
                  ) {
                    child.hide();
                    animation.onframe = () => {
                      const { progress } = animation.effect.getComputedTiming();
                      if (
                        progress >= visibilityStartOffset &&
                        progress < visibilityEndOffset
                      ) {
                        child.show();
                      } else {
                        child.hide();
                      }
                    };
                  }

                  if (!this.context.autoplay) {
                    animation.pause();
                  }
                  return animation;
                }

                return null;
              })
              .filter((animation) => !!animation),
          );
        }
      });
    });

    return wrapper;
  }

  private formatKeyframes(
    keyframes: Record<string, any>[],
    object: DisplayObject,
  ) {
    keyframes.forEach((keyframe) => {
      // if ('offsetPath' in keyframe) {
      //   if (!object.style.offsetPath) {
      //     const [ox, oy] = object.getOrigin();
      //     (keyframe.offsetPath as AbsoluteArray).forEach((segment) => {
      //       if (segment[0] === 'M') {
      //         segment[1] -= ox;
      //         segment[2] -= oy;
      //       } else if (segment[0] === 'C') {
      //         segment[1] -= ox;
      //         segment[2] -= oy;
      //         segment[3] -= ox;
      //         segment[4] -= oy;
      //         segment[5] -= ox;
      //         segment[6] -= oy;
      //       }
      //     });

      //     const offsetPath = new Path({
      //       style: {
      //         d: keyframe.offsetPath,
      //       },
      //     });

      //     object.style.offsetPath = offsetPath;

      //     console.log(offsetPath);
      //   }
      //   delete keyframe.offsetPath;
      //   // offsetPath should override x/y
      //   delete keyframe.x;
      //   delete keyframe.y;
      // }

      // should keep transform during initialization
      // if (!object.style.offsetPath) {
      //   keyframe.transform = object.style.transform || '';
      // }

      keyframe.transform = object.style.transform || '';

      // TODO: transforms with different easing functions will conflict

      if ('scaleX' in keyframe) {
        keyframe.transform = `${
          keyframe.transform || ''
        } scaleX(${keyframe.scaleX === 0 ? eps : keyframe.scaleX})`;
        delete keyframe.scaleX;
      }
      if ('scaleY' in keyframe) {
        keyframe.transform = `${
          keyframe.transform || ''
        } scaleY(${keyframe.scaleY === 0 ? eps : keyframe.scaleY})`;
        delete keyframe.scaleY;
      }

      if ('rotation' in keyframe) {
        keyframe.transform = `${keyframe.transform || ''} rotate(${keyframe.rotation}deg)`;
        delete keyframe.rotation;
      }

      // TODO: skew & skewAxis
      // if ('skew' in keyframe) {
      //   keyframe.transform = (keyframe.transform || '') + ` skew(${keyframe.skew}deg)`;
      //   delete keyframe.skew;
      // }

      if ('x' in keyframe) {
        keyframe.transform = `${keyframe.transform || ''} translateX(${keyframe.x}px)`;
        delete keyframe.x;
      }
      if ('y' in keyframe) {
        keyframe.transform = `${keyframe.transform || ''} translateY(${keyframe.y}px)`;
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
      // TODO: support negative offset

      const { ignore, easing, offset, ...rest } = keyframe;
      return offset >= 0 && Object.keys(rest).length > 0;
      // return Object.keys(rest).length > 0;
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

    // sort by offset
    keyframes.sort((a, b) => a.offset - b.offset);

    // remove empty attributes
    keyframes.forEach((keyframe) => {
      Object.keys(keyframe).forEach((name) => {
        if (keyframe[name] === '') {
          delete keyframe[name];
        }
      });
    });

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

  private isPaused = false;
  play() {
    this.isPaused = false;
    this.animations.forEach((animation) => {
      animation.play();
    });
  }

  /**
   * Can contain 2 numeric values that will be used as first and last frame of the animation.
   * @see https://github.com/airbnb/lottie-web#playsegmentssegments-forceflag
   */
  playSegments(segments: [number, number]) {
    const [firstFrame, lastFrame] = segments;

    this.isPaused = false;
    this.animations.forEach((animation) => {
      animation.currentTime = (firstFrame / this.fps()) * 1000;
      const originOnFrame = animation.onframe;
      animation.onframe = (e) => {
        if (originOnFrame) {
          // @ts-ignore
          originOnFrame(e);
        }

        if (animation.currentTime >= (lastFrame / this.fps()) * 1000) {
          animation.finish();

          if (originOnFrame) {
            animation.onframe = originOnFrame;
          } else {
            animation.onframe = null;
          }
        }
      };
      animation.play();
    });
  }

  pause() {
    this.isPaused = true;
    this.animations.forEach((animation) => {
      animation.pause();
    });
  }

  /**
   *
   */
  togglePause() {
    if (this.isPaused) {
      this.play();
    } else {
      this.pause();
    }
  }

  /**
   * Goto and stop at a specific time(in seconds) or frame.
   * Split goToAndStop/Play into goTo & stop/play
   * @see https://github.com/airbnb/lottie-web
   */
  goTo(value: number, isFrame = false) {
    if (isFrame) {
      this.animations.forEach((animation) => {
        animation.currentTime = (value / this.fps()) * 1000;
      });
    } else {
      this.animations.forEach((animation) => {
        animation.currentTime = value * 1000;
      });
    }
  }

  /**
   * @see https://github.com/airbnb/lottie-web#stop
   */
  stop() {
    this.animations.forEach((animation) => {
      animation.finish();
    });
  }

  /**
   * 1 is normal speed.
   * @see https://github.com/airbnb/lottie-web#setspeedspeed
   */
  setSpeed(speed: number) {
    this.animations.forEach((animation) => {
      animation.playbackRate = speed * this.direction;
    });
  }

  private direction = 1;

  /**
   * 1 is forward, -1 is reverse.
   * @see https://github.com/airbnb/lottie-web#setdirectiondirection
   */
  setDirection(direction: 1 | -1) {
    this.direction = direction;
    this.animations.forEach((animation) => {
      animation.playbackRate *= direction;
    });
  }
}
