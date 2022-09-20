import type { Canvas, DisplayObject, PointLike, Rectangle } from '@antv/g-lite';
import { definedProps, Ellipse, Group, Rect, Shape } from '@antv/g-lite';
import { isNil } from '@antv/util';
import type { CustomElementOption, KeyframeAnimation } from './parser';

export class LottieAnimation {
  constructor(
    private width: number,
    private height: number,
    private elements: CustomElementOption[],
  ) {
    this.displayObjects = elements.map((element) => this.buildHierachy(element));

    console.log(elements, this.displayObjects);
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
      rotation,
      scaleX,
      scaleY,
      x,
      y,
      children,
      shape,
      style,
      keyframeAnimation,
    } = element;

    let displayObject: DisplayObject;

    // @see https://lottiefiles.github.io/lottie-docs/shapes/#shape
    // TODO: polystar
    if (type === Shape.GROUP) {
      displayObject = new Group();
    } else if (type === Shape.ELLIPSE) {
      displayObject = new Ellipse({
        style: {
          cx: shape.cx,
          cy: shape.cy,
          rx: shape.rx,
          ry: shape.ry,
        },
      });
    } else if (type === Shape.PATH) {
    } else if (type === Shape.RECT) {
      displayObject = new Rect({
        style: {
          x: shape.x,
          y: shape.y,
          width: shape.width,
          height: shape.height,
        },
      });
    }

    if (name) {
      displayObject.name = name;
    }

    if (style) {
      // { fill, fillOpacity, opacity }
      displayObject.attr(style);
    }

    /**
     * RTS
     */
    if (anchorX !== 0 || anchorY !== 0) {
      displayObject.setOrigin(anchorX, anchorY);
    }

    if (!isNil(rotation) && rotation !== 0) {
      // clockwise in degrees
      displayObject.setEulerAngles(rotation);
    }

    if (!isNil(x) && x !== 0) {
      const [, py] = displayObject.getLocalPosition();
      displayObject.setLocalPosition(x, py);
    }
    if (!isNil(y) && y !== 0) {
      const [px] = displayObject.getLocalPosition();
      displayObject.setLocalPosition(px, y);
    }

    if (!isNil(scaleX) && scaleX !== 1) {
      const [, sy] = displayObject.getLocalScale();
      displayObject.setLocalScale(scaleX, sy);
    }
    if (!isNil(scaleY) && scaleY !== 1) {
      const [sx] = displayObject.getLocalScale();
      displayObject.setLocalScale(sx, scaleY);
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
    return 0;
  }
  /**
   * Returns the animation frame rate (frames / second).
   */
  fps() {
    return 0;
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
          keyframeAnimation.map(({ delay = 0, duration, easing, loop, keyframes }, i) => {
            const formattedKeyframes = this.formatKeyframes(keyframes, child);
            const options = definedProps({
              delay,
              duration,
              easing,
              // iterations: !!loop ? Infinity : 1,
              iterations: Infinity,
            });
            // console.log(formattedKeyframes, options);

            return child.animate(formattedKeyframes, options);
          });
        }
      });
    });
  }

  private formatKeyframes(keyframes: Record<string, any>[], object: DisplayObject) {
    keyframes = keyframes.map((keyframe) => definedProps(keyframe));

    keyframes.forEach((keyframe) => {
      if ('scaleX' in keyframe) {
        keyframe.transform = `scaleX(${keyframe.scaleX})`;
        delete keyframe.scaleX;
      }
      if ('scaleY' in keyframe) {
        keyframe.transform = `scaleY(${keyframe.scaleY})`;
        delete keyframe.scaleY;
      }

      // TODO: rotation, skew

      if ('x' in keyframe && object.nodeName === Shape.ELLIPSE) {
        keyframe.cx = keyframe.x;
        delete keyframe.x;
      }
      if ('y' in keyframe && object.nodeName === Shape.ELLIPSE) {
        keyframe.cy = keyframe.y;
        delete keyframe.y;
      }
    });

    // merge

    // offset = 1
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

  version() {}
}
