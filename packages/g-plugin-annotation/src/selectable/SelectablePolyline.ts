import type {
  DisplayObject,
  FederatedEvent,
  ParsedPolylineStyleProps,
} from '@antv/g-lite';
import { Circle, CustomEvent, Polyline, Shape } from '@antv/g-lite';
import { SelectableEvent } from '../constants/enum';
import { AbstractSelectable } from './AbstractSelectable';

export class SelectablePolyline extends AbstractSelectable<Polyline> {
  init() {
    const {
      selectionFill,
      selectionFillOpacity,
      selectionStroke,
      selectionStrokeOpacity,
      selectionStrokeWidth,
      target,
    } = this.style;

    let points = [];
    if (target.nodeName === Shape.LINE) {
      const { x1, y1, x2, y2 } = target.parsedStyle;
      points.push([x1, y1]);
      points.push([x2, y2]);
    } else if (target.nodeName === Shape.POLYLINE) {
      const { points: parsedPoints } =
        target.parsedStyle as ParsedPolylineStyleProps;
      points = parsedPoints.points;
    }

    this.mask = new Polyline({
      style: {
        points,
        draggable: target.style.maskDraggable === false ? false : true,
        increasedLineWidthForHitTesting: 20,
        cursor: 'move',
      },
    });
    this.appendChild(this.mask);

    points.forEach((_, i) => {
      this.createAnchor();

      if (i !== points.length - 1) {
        this.createMidAnchor();
      }
    });

    this.repositionAnchors();

    // resize according to target
    this.mask.style.fill = selectionFill;
    this.mask.style.stroke = selectionStroke;
    this.mask.style.fillOpacity = selectionFillOpacity;
    this.mask.style.strokeOpacity = selectionStrokeOpacity;
    this.mask.style.lineWidth = selectionStrokeWidth;

    this.bindEventListeners();
  }

  private createAnchor() {
    const {
      anchorFill,
      anchorStroke,
      anchorFillOpacity,
      anchorStrokeOpacity,
      anchorSize,
      target,
    } = this.style;

    const anchor = new Circle({
      style: {
        cx: 0,
        cy: 0,
        r: anchorSize,
        stroke: anchorStroke,
        fill: anchorFill,
        fillOpacity: anchorFillOpacity,
        strokeOpacity: anchorStrokeOpacity,
        cursor: 'move',
        draggable: true,
        visibility:
          target.style.anchorsVisibility === 'hidden' ? 'hidden' : 'unset',
      },
    });
    this.anchors.push(anchor);
    this.mask.appendChild(anchor);

    this.bindAnchorEvent(anchor);
  }

  private createMidAnchor() {
    if (!this.plugin.annotationPluginOptions.enableDisplayMidAnchors) {
      return;
    }

    const {
      anchorFill,
      anchorStroke,
      anchorFillOpacity,
      anchorStrokeOpacity,
      anchorSize,
      midAnchorFill,
      midAnchorStroke,
      midAnchorFillOpacity,
      midAnchorStrokeOpacity,
      midAnchorSize,
      target,
    } = this.style;

    const midAnchor = new Circle({
      style: {
        cx: 0,
        cy: 0,
        r: midAnchorSize ?? anchorSize,
        stroke: midAnchorStroke ?? anchorStroke,
        fill: midAnchorFill ?? anchorFill,
        fillOpacity: midAnchorFillOpacity ?? anchorFillOpacity,
        strokeOpacity: midAnchorStrokeOpacity ?? anchorStrokeOpacity,
        cursor: 'move',
        draggable: true,
        visibility:
          target.style.anchorsVisibility === 'hidden' ? 'hidden' : 'unset',
      },
    });
    this.midAnchors.push(midAnchor);
    this.mask.appendChild(midAnchor);
  }

  destroy(): void {}

  deleteSelectedAnchors() {
    const target = this.style.target;

    const points = this.mask.style.points.slice();
    this.selectedAnchors.forEach((anchor) => {
      const index = this.anchors.indexOf(anchor);

      // Destroy anchor & midAnchor
      this.anchors.splice(index, 1);
      anchor.destroy();

      const midAnchor = this.midAnchors[index];
      if (midAnchor) {
        this.midAnchors.splice(index, 1);
        midAnchor.destroy();
      }

      points.splice(index, 1);
    });

    this.mask.style.points = points;
    this.repositionAnchors();

    if (target.nodeName === Shape.POLYLINE) {
      target.dispatchEvent(
        new CustomEvent(SelectableEvent.MODIFIED, {
          polyline: {
            points: this.mask.style.points,
          },
        }),
      );
    }

    this.selectedAnchors.clear();
  }

  moveMask(dx: number, dy: number) {
    // change definition of polyline
    this.mask.style.points = [...this.mask.style.points].map(([x, y]) => [
      x + dx,
      y + dy,
    ]);

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

      if (this.plugin.annotationPluginOptions.enableDisplayMidAnchors) {
        const midAnchors = this.midAnchors[i];
        if (midAnchors) {
          const nextPoint = points.points[i + 1];
          midAnchors.setPosition([
            (nextPoint[0] + point[0]) / 2,
            (nextPoint[1] + point[1]) / 2,
          ]);
        }
      }
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
        selectable.triggerMovingEvent(
          canvasX - shiftX - defX,
          canvasY - shiftY - defY,
        );
      });
    };

    let midAnchorIndexInDrag = -1;
    this.addEventListener('dragstart', (e: FederatedEvent) => {
      const target = e.target as DisplayObject;

      midAnchorIndexInDrag = this.midAnchors.indexOf(target);

      if (target === this.mask) {
        const { defX, defY } = this.mask.parsedStyle;
        shiftX = e.canvasX - defX;
        shiftY = e.canvasY - defY;

        moveAt(e.canvasX, e.canvasY);
      } else if (midAnchorIndexInDrag > -1) {
        this.createAnchor();
        this.createMidAnchor();

        const { points } = this.mask.parsedStyle;
        const originPoints = [...points.points];
        originPoints.splice(midAnchorIndexInDrag + 1, 0, [
          e.canvasX,
          e.canvasY,
        ]);
        this.mask.style.points = originPoints;
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
      } else if (midAnchorIndexInDrag > -1) {
        const { points } = this.mask.parsedStyle;
        const originPoints = [...points.points];

        // change polyline definition
        originPoints[midAnchorIndexInDrag + 1] = [canvasX, canvasY];
        this.mask.style.points = originPoints;
        // change anchors' position
        this.repositionAnchors();
      }
    });
    this.addEventListener('dragend', (e: FederatedEvent) => {
      midAnchorIndexInDrag = -1;
      const target = e.target as DisplayObject;
      if (target === this.mask) {
        // account for multi-selection
        this.plugin.selected.forEach((selected) => {
          const selectable = this.plugin.getOrCreateSelectableUI(selected);
          selectable.triggerMovedEvent();
        });
      } else if (
        targetObject.nodeName === Shape.POLYLINE ||
        targetObject.nodeName === Shape.LINE
      ) {
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
