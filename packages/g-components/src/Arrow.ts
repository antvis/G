import {
  CustomElement,
  DisplayObject,
  Line,
  Path,
  Polyline,
  SHAPE,
  ShapeAttrs,
  ShapeCfg,
} from '@antv/g';
import { vec3 } from 'gl-matrix';

type ArrowHead = boolean | DisplayObject;
type ArrowBody = Line | Path | Polyline;
type ArrowHeadType = 'default' | 'custom';
export interface ArrowConfig extends ShapeCfg {
  attrs: {
    body: ArrowBody;
    startHead?: ArrowHead;
    endHead?: ArrowHead;
    cursor?: string;
    stroke?: string;
    lineWidth?: number;
    opacity?: number;
    strokeOpacity?: number;
  };
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
export class Arrow extends CustomElement {
  static tag = 'arrow';

  private body: DisplayObject;
  private startHead?: DisplayObject;
  private endHead?: DisplayObject;

  constructor(config: ArrowConfig) {
    super({
      ...config,
      type: Arrow.tag,
    });

    const { body, startHead, endHead, ...rest } = this.attributes;

    if (!body) {
      throw new Error("Arrow's body is required");
    }

    // append arrow body
    this.body = body;
    this.appendChild(this.body!);

    if (startHead) {
      this.appendArrowHead(this.getArrowHeadType(startHead), true);
    }
    if (endHead) {
      this.appendArrowHead(this.getArrowHeadType(endHead), false);
    }

    this.applyArrowStyle(rest, [this.body, this.startHead, this.endHead]);
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

  attributeChangedCallback(name: string, value: any) {
    if (
      name === 'opacity' ||
      name === 'strokeOpacity' ||
      name === 'stroke' ||
      name === 'lineWidth'
    ) {
      this.applyArrowStyle({ [name]: value }, [this.body, this.startHead, this.endHead]);
    } else if (name === 'startHead' || name === 'endHead') {
      const isStart = name === 'startHead';
      // delete existed arrow head first
      this.destroyArrowHead(isStart);

      if (value) {
        const { body, startHead, endHead, ...rest } = this.attributes;
        // append new arrow head
        this.appendArrowHead(this.getArrowHeadType(value), isStart);
        this.applyArrowStyle(rest, [isStart ? this.startHead : this.endHead]);
      }
    } else if (name === 'body') {
      const { body, startHead, endHead, ...rest } = this.attributes;
      this.removeChild(this.body!, true);
      this.body = value;
      this.appendChild(this.body!);
      this.applyArrowStyle(rest, [this.body]);
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
      head = isStart ? this.attributes.startHead : this.attributes.endHead;
    }

    // set position & rotation
    this.transformArrowHead(head, isStart);

    // heads should display on top of body
    head.setAttribute('z-index', 1);

    if (isStart) {
      this.startHead = head;
    } else {
      this.endHead = head;
    }

    this.appendChild(head);
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

    const bodyType = this.body && this.body.nodeType;

    if (bodyType === SHAPE.Line) {
      const { x1: _x1, x2: _x2, y1: _y1, y2: _y2 } = this.body!.attributes;
      x1 = isStart ? _x1 : _x2;
      x2 = isStart ? _x2 : _x1;
      y1 = isStart ? _y1 : _y2;
      y2 = isStart ? _y2 : _y1;
    } else if (bodyType === SHAPE.Polyline) {
      const points = this.body.attributes.points as number[][];
      const length = points.length;
      x1 = isStart ? points[1][0] : points[length - 2][0];
      y1 = isStart ? points[1][1] : points[length - 2][1];
      x2 = isStart ? points[0][0] : points[length - 1][0];
      y2 = isStart ? points[0][1] : points[length - 1][1];
    } else if (bodyType === SHAPE.Path) {
      const [p1, p2] = this.getTangent(this.body! as Path, isStart);
      x1 = p1[0];
      y1 = p1[1];
      x2 = p2[0];
      y2 = p2[1];
    }

    const x = x1 - x2;
    const y = y1 - y2;
    rad = Math.atan2(y, x);
    position = vec3.fromValues(x2, y2, 0);

    head.setLocalPosition(position);
    head.setLocalEulerAngles((rad * 180) / Math.PI + head.getLocalEulerAngles());
  }

  private destroyArrowHead(isStart: boolean) {
    if (isStart && this.startHead) {
      this.removeChild(this.startHead, true);
      this.startHead = null;
    }
    if (!isStart && this.endHead) {
      this.removeChild(this.endHead, true);
      this.endHead = null;
    }
  }

  private getTangent(path: Path, isStart: boolean): [number, number][] {
    const { segments } = path.attributes;
    const length = segments.length;

    let result: [number, number][] = [];
    if (length > 1) {
      let startPoint = isStart ? segments[0].currentPoint : segments[length - 2].currentPoint;
      let endPoint = isStart ? segments[1].currentPoint : segments[length - 1].currentPoint;
      const tangent = isStart ? segments[1].startTangent : segments[length - 1].endTangent;
      let tmpPoint;

      if (!isStart) {
        tmpPoint = startPoint;
        startPoint = endPoint;
        endPoint = tmpPoint;
      }

      if (tangent) {
        result.push([startPoint[0] - tangent[0], startPoint[1] - tangent[1]]);
        result.push([startPoint[0], startPoint[1]]);
      } else {
        result.push([endPoint[0], endPoint[1]]);
        result.push([startPoint[0], startPoint[1]]);
      }
    }
    return result;
  }

  private createDefaultArrowHead() {
    const { stroke, lineWidth } = this.attributes;
    const { sin, cos, PI } = Math;
    return new Path({
      attrs: {
        // draw an angle '<'
        path: `M${10 * cos(PI / 6)},${10 * sin(PI / 6)} L0,0 L${10 * cos(PI / 6)},-${
          10 * sin(PI / 6)
        }`,
        stroke,
        lineWidth,
        anchor: [0.5, 0.5], // set anchor to center
      },
    });
  }

  private applyArrowStyle(attributes: ShapeAttrs, objects: (DisplayObject | null)[]) {
    objects.forEach((shape) => {
      if (shape) {
        shape.attr(attributes);
      }
    });
  }
}
