import type {
  BaseCustomElementStyleProps,
  DisplayObject,
  DisplayObjectConfig,
  FederatedEvent,
  ParsedPolygonStyleProps,
} from '@antv/g';
import { Circle, CustomElement, Polygon, Shape } from '@antv/g';
import { mat4, vec3 } from 'gl-matrix';
import type { SelectableStyle } from '../tokens';

interface Props extends BaseCustomElementStyleProps, Partial<SelectableStyle> {
  target: DisplayObject;
}

type SelectableStatus = 'active' | 'deactive' | 'moving' | 'resizing';

export class SelectablePolygon extends CustomElement<Props> {
  /**
   * transparent mask
   */
  private mask: Polygon;

  // private rotateAnchor: Circle;

  private anchors: Circle[] = [];

  status: SelectableStatus;

  constructor({ style, ...rest }: Partial<DisplayObjectConfig<Props>>) {
    super({
      style: {
        selectionFill: 'transparent',
        selectionFillOpacity: 1,
        selectionStroke: 'black',
        selectionStrokeOpacity: 1,
        selectionStrokeWidth: 1,
        anchorFill: 'black',
        anchorStroke: 'black',
        anchorStrokeOpacity: 1,
        anchorFillOpacity: 1,
        anchorSize: 6,
        ...style,
      },
      ...rest,
    });

    const {
      points: parsedPoints,
      defX,
      defY,
    } = this.style.target.parsedStyle as ParsedPolygonStyleProps;
    const points = parsedPoints.points.map(([x, y]) => [x - defX, y - defY] as [number, number]);

    this.mask = new Polygon({
      style: {
        points,
        draggable: true,
        increasedLineWidthForHitTesting: 20,
        cursor: 'move',
      },
    });
    this.appendChild(this.mask);

    points.forEach((point) => {
      const anchor = new Circle({
        style: {
          cx: point[0],
          cy: point[1],
          r: 10,
          cursor: 'move',
          draggable: true,
        },
      });
      this.anchors.push(anchor);
      this.mask.appendChild(anchor);
    });
  }
  connectedCallback() {
    const {
      anchorFill,
      anchorStroke,
      anchorFillOpacity,
      anchorStrokeOpacity,
      anchorSize,
      selectionFill,
      selectionFillOpacity,
      selectionStroke,
      selectionStrokeOpacity,
      selectionStrokeWidth,
      target,
    } = this.style;

    const transform = target.getWorldTransform();

    // resize according to target
    this.mask.style.fill = selectionFill;
    this.mask.style.stroke = selectionStroke;
    this.mask.style.fillOpacity = selectionFillOpacity;
    this.mask.style.strokeOpacity = selectionStrokeOpacity;
    this.mask.style.lineWidth = selectionStrokeWidth;

    // set anchors' style
    this.anchors.forEach((anchor) => {
      anchor.style.stroke = anchorStroke;
      anchor.style.fill = anchorFill;
      anchor.style.fillOpacity = anchorFillOpacity;
      anchor.style.strokeOpacity = anchorStrokeOpacity;
      anchor.style.r = anchorSize;
    });

    this.setLocalTransform(transform);
    this.bindEventListeners();
  }
  disconnectedCallback() {}
  attributeChangedCallback<Key extends never>(name: Key, oldValue: {}[Key], newValue: {}[Key]) {
    if (name === 'selectionStroke') {
      this.mask.style.stroke = newValue;
    } else if (name === 'selectionFill') {
      this.mask.style.fill = newValue;
    } else if (name === 'selectionFillOpacity') {
      this.mask.style.fillOpacity = newValue;
    } else if (name === 'selectionStrokeOpacity') {
      this.mask.style.strokeOpacity = newValue;
    } else if (name === 'selectionStrokeWidth') {
      this.mask.style.lineWidth = newValue;
    } else if (name === 'anchorFill') {
      this.anchors.forEach((anchor) => {
        anchor.style.fill = newValue;
      });
    } else if (name === 'anchorStroke') {
      this.anchors.forEach((anchor) => {
        anchor.style.stroke = newValue;
      });
    } else if (name === 'anchorSize') {
      this.anchors.forEach((anchor) => {
        anchor.style.r = newValue;
      });
    } else if (name === 'anchorStrokeOpacity') {
      this.anchors.forEach((anchor) => {
        anchor.style.strokeOpacity = newValue;
      });
    } else if (name === 'anchorFillOpacity') {
      this.anchors.forEach((anchor) => {
        anchor.style.fillOpacity = newValue;
      });
    }
  }

  private repositionAnchors() {
    const { points, defX, defY } = this.mask.parsedStyle;
    points.points.forEach((point, i) => {
      const anchor = this.anchors[i];
      anchor.style.cx = point[0] - defX;
      anchor.style.cy = point[1] - defY;
    });
  }

  private bindEventListeners() {
    const { target: targetObject } = this.style;

    // listen to drag'n'drop events
    let shiftX = 0;
    let shiftY = 0;
    const moveAt = (canvasX: number, canvasY: number) => {
      this.setPosition(canvasX - shiftX, canvasY - shiftY);
      targetObject.setPosition(canvasX - shiftX, canvasY - shiftY);
    };

    this.addEventListener('dragstart', (e: FederatedEvent) => {
      const target = e.target as DisplayObject;

      if (target === this.mask) {
        this.status = 'moving';

        const [x, y] = this.getPosition();
        shiftX = e.canvasX - x;
        shiftY = e.canvasY - y;

        moveAt(e.canvasX, e.canvasY);
      }
    });
    this.addEventListener('drag', (e: FederatedEvent) => {
      const target = e.target as DisplayObject;
      const { canvasX, canvasY } = e;

      const anchorIndex = this.anchors.indexOf(target);

      if (target === this.mask) {
        this.status = 'moving';

        moveAt(canvasX, canvasY);
      } else if (anchorIndex > -1) {
        const { points } = this.mask.parsedStyle;
        const originPoints = [...points.points];

        const transform = targetObject.getWorldTransform();
        const invert = mat4.invert(mat4.create(), transform);
        const inverted = vec3.transformMat4(
          vec3.create(),
          vec3.fromValues(canvasX, canvasY, 0),
          invert,
        );

        // change polyline definition
        originPoints[anchorIndex] = [inverted[0], inverted[1]];
        this.mask.style.points = originPoints;

        // change anchors' position
        this.repositionAnchors();

        // reposition target
        if (targetObject.nodeName === Shape.LINE) {
          // if (anchorIndex === 0) {
          //   (targetObject as Line).attr({
          //     x1: inverted[0],
          //     y1: inverted[1],
          //   });
          // } else if (anchorIndex === 1) {
          //   (targetObject as Line).attr({
          //     x2: inverted[0],
          //     y2: inverted[1],
          //   });
          // }
        } else if (targetObject.nodeName === Shape.POLYLINE) {
          // (selectedTarget as Polyline).style.
        }
      }
    });
    this.addEventListener('dragend', (e: FederatedEvent) => {
      const target = e.target as DisplayObject;

      if (target === this.mask) {
        this.status = 'active';
      }
    });
  }
}
