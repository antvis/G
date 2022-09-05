import type { DisplayObject, FederatedEvent, ParsedPolylineStyleProps } from '@antv/g';
import { Circle, CustomEvent, Polyline, Shape } from '@antv/g';
import { SelectableEvent } from '../constants/enum';
import { AbstractSelectable } from './AbstractSelectable';

export class SelectablePolyline extends AbstractSelectable<Polyline> {
  init() {
    let points = [];
    if (this.style.target.nodeName === Shape.LINE) {
      const { x1, y1, x2, y2, defX, defY } = this.style.target.parsedStyle;
      points.push([x1 - defX, y1 - defY]);
      points.push([x2 - defX, y2 - defY]);
    } else if (this.style.target.nodeName === Shape.POLYLINE) {
      const { points: parsedPoints } = this.style.target.parsedStyle as ParsedPolylineStyleProps;
      points = parsedPoints.points;
    }

    this.mask = new Polyline({
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
          cx: 0,
          cy: 0,
          r: 10,
          cursor: 'move',
          draggable: true,
        },
      });
      this.anchors.push(anchor);
      this.mask.appendChild(anchor);

      // set anchor in canvas coordinates
      anchor.setPosition(point);
    });

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
    } = this.style;

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

    this.bindEventListeners();
  }

  destroy(): void {}

  moveMask(dx: number, dy: number) {
    // change definition of polyline
    this.mask.style.points = [...this.mask.style.points].map(([x, y]) => [x + dx, y + dy]);

    // re-position anchors in canvas coordinates
    this.repositionAnchors();
  }

  triggerMovingEvent(dx: number, dy: number) {
    const { defX, defY } = this.mask.parsedStyle;
    this.style.target.dispatchEvent(
      new CustomEvent(SelectableEvent.MOVING, {
        movingX: dx + defX,
        movingY: dy + defY,
        dx,
        dy,
      }),
    );
  }

  triggerMovedEvent() {
    this.style.target.dispatchEvent(
      new CustomEvent(SelectableEvent.MOVED, {
        polyline: {
          points: this.mask.style.points,
        },
      }),
    );
  }

  private repositionAnchors() {
    const { points } = this.mask.parsedStyle;
    points.points.forEach((point, i) => {
      const anchor = this.anchors[i];
      anchor.setPosition(point);
    });
  }

  private bindEventListeners() {
    const { target: targetObject } = this.style;
    // listen to drag'n'drop events
    let shiftX = 0;
    let shiftY = 0;
    const moveAt = (canvasX: number, canvasY: number) => {
      const { defX, defY } = this.mask.parsedStyle;

      // account for multi-selection
      this.plugin.selected.forEach((selected) => {
        const selectable = this.plugin.getOrCreateSelectableUI(selected);
        selectable.triggerMovingEvent(canvasX - shiftX - defX, canvasY - shiftY - defY);
      });
    };

    this.addEventListener('dragstart', (e: FederatedEvent) => {
      const target = e.target as DisplayObject;

      if (target === this.mask) {
        const { defX, defY } = this.mask.parsedStyle;
        shiftX = e.canvasX - defX;
        shiftY = e.canvasY - defY;

        moveAt(e.canvasX, e.canvasY);
      }
    });
    this.addEventListener('drag', (e: FederatedEvent) => {
      const target = e.target as DisplayObject;
      const { canvasX, canvasY } = e;

      const anchorIndex = this.anchors.indexOf(target);

      if (target === this.mask) {
        moveAt(canvasX, canvasY);
      } else if (anchorIndex > -1) {
        const { points } = this.mask.parsedStyle;
        const originPoints = [...points.points];

        // change polyline definition
        originPoints[anchorIndex] = [canvasX, canvasY];
        this.mask.style.points = originPoints;
        // change anchors' position
        this.repositionAnchors();
      }
    });
    this.addEventListener('dragend', (e: FederatedEvent) => {
      const target = e.target as DisplayObject;
      if (target === this.mask) {
        // account for multi-selection
        this.plugin.selected.forEach((selected) => {
          const selectable = this.plugin.getOrCreateSelectableUI(selected);
          selectable.triggerMovedEvent();
        });
      } else if (targetObject.nodeName === Shape.POLYLINE) {
        targetObject.dispatchEvent(
          new CustomEvent(SelectableEvent.MODIFIED, {
            polyline: {
              points: this.mask.style.points,
            },
          }),
        );
      }
    });
  }
}
