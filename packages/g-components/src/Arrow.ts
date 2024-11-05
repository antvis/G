import type {
  BaseStyleProps,
  DisplayObject,
  DisplayObjectConfig,
  Line,
  MutationEvent,
  Polyline,
} from '@antv/g-lite';
import { CustomElement, ElementEvent, Path, Shape } from '@antv/g-lite';
import { isNil } from '@antv/util';
import { vec3 } from 'gl-matrix';

type ArrowHead = boolean | DisplayObject;
type ArrowBody = Line | Path | Polyline;
type ArrowHeadType = 'default' | 'custom';
export interface ArrowStyleProps extends BaseStyleProps {
  body?: ArrowBody;
  startHead?: ArrowHead;
  endHead?: ArrowHead;
  /**
   * offset along tangent for start head
   */
  startHeadOffset?: number;
  /**
   * offset along tangent for end head
   */
  endHeadOffset?: number;
  stroke?: string;
  lineWidth?: number;
  opacity?: number;
  strokeOpacity?: number;
}

/**
 * support 3 types of arrow line:
 * 1. Line
 * 2. Polyline
 * 3. Path
 *
 * support 2 types of arrow head:
 * 1. default(Path)
 * 2. custom
 */
export class Arrow extends CustomElement<ArrowStyleProps> {
  static tag = 'arrow';

  static PARSED_STYLE_LIST = new Set([
    ...CustomElement.PARSED_STYLE_LIST,
    'body',
    'startHead',
    'endHead',
    'startHeadOffset',
    'endHeadOffset',
    'stroke',
    'lineWidth',
    'opacity',
    'strokeOpacity',
  ]);

  private body: Line | Path | Polyline;
  private startHead?: DisplayObject;
  private endHead?: DisplayObject;
  private startHeadPosition: vec3;
  private startHeadRad: number;
  private endHeadPosition: vec3;
  private endHeadRad: number;

  constructor(config: DisplayObjectConfig<ArrowStyleProps>) {
    super({
      ...config,
      type: Arrow.tag,
    });

    const {
      body,
      startHead,
      endHead,
      startHeadOffset,
      endHeadOffset,
      ...rest
    } = this.attributes;

    if (!body) {
      throw new Error("Arrow's body is required");
    }

    // append arrow body
    this.body = body;
    this.appendChild(this.body);
    this.handleBodyAttributeChanged(this.body);

    if (startHead) {
      this.appendArrowHead(this.getArrowHeadType(startHead), true);
    }
    if (endHead) {
      this.appendArrowHead(this.getArrowHeadType(endHead), false);
    }

    this.applyArrowStyle(rest, [this.body, this.startHead, this.endHead]);
  }

  private handleBodyAttributeChanged(body: ArrowBody) {
    body.addEventListener(ElementEvent.ATTR_MODIFIED, (e: MutationEvent) => {
      const { attrName } = e;
      if (attrName === 'x1' || attrName === 'y1') {
        if (this.startHead) {
          this.transformArrowHead(this.startHead, true);
        }
      } else if (attrName === 'x2' || attrName === 'y2') {
        if (this.endHead) {
          this.transformArrowHead(this.endHead, false);
        }
      }
      // const { nodeName } = body;
      // if (nodeName === Shape.LINE) {
      //   body
      // }
    });
  }

  getBody() {
    return this.body;
  }

  getStartHead() {
    return this.startHead;
  }

  getEndHead() {
    return this.endHead;
  }

  attributeChangedCallback<Key extends keyof ArrowStyleProps>(
    name: Key,
    oldValue: ArrowStyleProps[Key],
    newValue: ArrowStyleProps[Key],
  ) {
    if (
      name === 'opacity' ||
      name === 'strokeOpacity' ||
      name === 'stroke' ||
      name === 'lineWidth' ||
      name === 'increasedLineWidthForHitTesting'
    ) {
      this.applyArrowStyle({ [name]: newValue }, [
        this.body,
        this.startHead,
        this.endHead,
      ]);
    } else if (name === 'startHead' || name === 'endHead') {
      const isStart = name === 'startHead';
      // delete existed arrow head first
      this.destroyArrowHead(isStart);

      if (newValue) {
        const {
          body,
          startHead,
          endHead,
          startHeadOffset,
          endHeadOffset,
          ...rest
        } = this.attributes;
        // append new arrow head

        this.appendArrowHead(
          this.getArrowHeadType(newValue as ArrowHead),
          isStart,
        );
        this.applyArrowStyle(rest, [isStart ? this.startHead : this.endHead]);
      }
    } else if (name === 'body') {
      const {
        body,
        startHead,
        endHead,
        startHeadOffset,
        endHeadOffset,
        ...rest
      } = this.attributes;
      this.body.destroy();
      // @ts-ignore
      this.body = newValue;
      this.appendChild(this.body);
      this.applyArrowStyle(rest, [this.body]);
    } else if (name === 'startHeadOffset') {
      this.moveArrowHeadAlongTangent(newValue as number, true);
    } else if (name === 'endHeadOffset') {
      this.moveArrowHeadAlongTangent(newValue as number, false);
    }
  }

  private getArrowHeadType(head: ArrowHead): ArrowHeadType {
    if (typeof head === 'boolean') {
      return 'default';
    }
    return 'custom';
  }

  private appendArrowHead(type: ArrowHeadType, isStart: boolean) {
    let head: DisplayObject;
    if (type === 'default') {
      head = this.createDefaultArrowHead();
    } else {
      // @ts-ignore
      head = isStart ? this.attributes.startHead : this.attributes.endHead;
    }

    // set position & rotation
    this.transformArrowHead(head, isStart);

    // heads should display on top of body
    head.setAttribute('zIndex', 1);

    if (isStart) {
      this.startHead = head;
    } else {
      this.endHead = head;
    }

    this.appendChild(head);

    const offset = isStart
      ? this.attributes.startHeadOffset
      : this.attributes.endHeadOffset;
    if (offset) {
      this.moveArrowHeadAlongTangent(offset, isStart);
    }
  }

  /**
   * transform arrow head according to arrow line
   */
  private transformArrowHead(head: DisplayObject, isStart: boolean) {
    let position = vec3.create();
    let rad = 0;
    let x1 = 0;
    let x2 = 0;
    let y1 = 0;
    let y2 = 0;

    const bodyType = this.body && this.body.nodeName;

    if (bodyType === Shape.LINE) {
      const {
        x1: _x1,
        x2: _x2,
        y1: _y1,
        y2: _y2,
      } = (this.body as Line).attributes;
      x1 = isStart ? _x2 : _x1;
      x2 = isStart ? _x1 : _x2;
      y1 = isStart ? _y2 : _y1;
      y2 = isStart ? _y1 : _y2;
    } else if (bodyType === Shape.POLYLINE) {
      const { points } = (this.body as Polyline).attributes;
      const { length } = points;
      x1 = isStart ? points[1][0] : points[length - 2][0];
      y1 = isStart ? points[1][1] : points[length - 2][1];
      x2 = isStart ? points[0][0] : points[length - 1][0];
      y2 = isStart ? points[0][1] : points[length - 1][1];
    } else if (bodyType === Shape.PATH) {
      const [p1, p2] = this.getTangent(this.body as Path, isStart);
      x1 = p1[0];
      y1 = p1[1];
      x2 = p2[0];
      y2 = p2[1];
    }

    const x = x1 - x2;
    const y = y1 - y2;
    rad = Math.atan2(y, x);
    position = vec3.fromValues(x2, y2, 0);

    if (isStart) {
      this.startHeadPosition = position;
      this.startHeadRad = rad;
    } else {
      this.endHeadPosition = position;
      this.endHeadRad = rad;
    }

    head.setLocalPosition(position);
    head.setLocalEulerAngles(
      (rad * 180) / Math.PI + head.getLocalEulerAngles(),
    );
  }

  private moveArrowHeadAlongTangent(offset: number, isStart: boolean) {
    const head = isStart ? this.startHead : this.endHead;
    if (head) {
      head.setLocalPosition(
        vec3.sub(
          vec3.create(),
          isStart ? this.startHeadPosition : this.endHeadPosition,
          vec3.fromValues(
            Math.cos(isStart ? this.startHeadRad : this.endHeadRad) * offset,
            Math.sin(isStart ? this.startHeadRad : this.endHeadRad) * offset,
            0,
          ),
        ),
      );
    }

    // cut body
    if (this.body) {
      // const bodyType = this.body && this.body.nodeName;
      // if (bodyType === Shape.LINE) {
      //   const {  } = this.body.style;
      //   const { x1: _x1, x2: _x2, y1: _y1, y2: _y2 } = (this.body as Line).attributes;
      //   x1 = isStart ? _x2 : _x1;
      //   x2 = isStart ? _x1 : _x2;
      //   y1 = isStart ? _y2 : _y1;
      //   y2 = isStart ? _y1 : _y2;
      // }
    }
  }

  private destroyArrowHead(isStart: boolean) {
    if (isStart && this.startHead) {
      this.startHead.destroy();
      this.startHead = undefined;
    }
    if (!isStart && this.endHead) {
      this.endHead.destroy();
      this.endHead = undefined;
    }
  }

  private getTangent(path: Path, isStart: boolean): number[][] {
    return isStart ? path.getStartTangent() : path.getEndTangent();
  }

  private createDefaultArrowHead() {
    const { stroke, lineWidth } = this.attributes;
    const { sin, cos, PI } = Math;
    const width = 10 * cos(PI / 6);
    return new Path({
      style: {
        // draw an angle '<'
        d: `M${width / 2},${10 * sin(PI / 6)} L-${width / 2},0 L${width / 2},-${
          10 * sin(PI / 6)
        }`,
        stroke,
        lineWidth,
        transformOrigin: 'center',
      },
    });
  }

  private applyArrowStyle(
    attributes: ArrowStyleProps,
    objects: (DisplayObject | undefined)[],
  ) {
    const {
      opacity,
      stroke,
      strokeOpacity,
      lineWidth,
      increasedLineWidthForHitTesting,
    } = attributes;
    objects.forEach((shape) => {
      if (shape) {
        if (!isNil(opacity)) {
          shape.style.opacity = opacity;
        }

        if (!isNil(stroke)) {
          shape.style.stroke = stroke;
        }

        if (!isNil(strokeOpacity)) {
          shape.style.strokeOpacity = strokeOpacity;
        }

        if (!isNil(lineWidth)) {
          shape.style.lineWidth = lineWidth;
        }

        if (!isNil(increasedLineWidthForHitTesting)) {
          shape.style.increasedLineWidthForHitTesting =
            increasedLineWidthForHitTesting;
        }
      }
    });
  }
}
