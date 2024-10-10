import type {
  DisplayObject,
  FederatedEvent,
  ParsedPolygonStyleProps,
} from '@antv/g-lite';
import { Circle, CustomEvent, Polygon, Shape } from '@antv/g-lite';
import { SelectableEvent } from '../constants/enum';
import { AbstractSelectable } from './AbstractSelectable';

export class SelectablePolygon extends AbstractSelectable<Polygon> {
  init() {
    const {
      selectionFill,
      selectionFillOpacity,
      selectionStroke,
      selectionStrokeOpacity,
      selectionStrokeWidth,
      target,
    } = this.style;

    const { points: parsedPoints } =
      target.parsedStyle as ParsedPolygonStyleProps;
    const { points } = parsedPoints;

    this.mask = new Polygon({
      style: {
        points,
        draggable: target.style.maskDraggable !== false,
        increasedLineWidthForHitTesting:
          this.plugin.annotationPluginOptions.selectableStyle
            .maskIncreasedLineWidthForHitTesting,
        cursor: 'move',
        isSizeAttenuation: true,
        fill: selectionFill,
        stroke: selectionStroke,
        fillOpacity: selectionFillOpacity,
        strokeOpacity: selectionStrokeOpacity,
        lineWidth: selectionStrokeWidth,
      },
    });
    // @ts-ignore
    this.mask.style.originalPoints = points;
    this.appendChild(this.mask);

    points.forEach(() => {
      this.createAnchor();
      this.createMidAnchor();
    });

    this.repositionAnchors();

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
        r: anchorSize,
        stroke: anchorStroke,
        fill: anchorFill,
        fillOpacity: anchorFillOpacity,
        strokeOpacity: anchorStrokeOpacity,
        cursor: 'move',
        draggable: true,
        visibility:
          target.style.anchorsVisibility === 'hidden' ? 'hidden' : 'unset',
        isSizeAttenuation: true,
      },
    });
    this.anchors.push(anchor);
    this.mask.appendChild(anchor);

    if (this.plugin.annotationPluginOptions.enableDeleteAnchorsWithShortcuts) {
      this.bindAnchorEvent(anchor);
    }
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
        isSizeAttenuation: true,
      },
    });
    this.midAnchors.push(midAnchor);
    this.mask.appendChild(midAnchor);

    if (!this.plugin.midAnchorsVisible) {
      midAnchor.style.visibility = 'hidden';
    }
  }

  destroy(): void {}

  deleteSelectedAnchors() {
    const { target } = this.style;

    const points = this.mask.style.points.slice();
    this.selectedAnchors.forEach((anchor) => {
      const index = this.anchors.indexOf(anchor);
      this.anchors.splice(index, 1);
      anchor.destroy();

      const midAnchor = this.midAnchors[index];
      this.midAnchors.splice(index, 1);
      midAnchor.destroy();

      points.splice(index, 1);
    });

    this.mask.style.points = points;
    this.repositionAnchors();

    if (target.nodeName === Shape.POLYGON) {
      target.dispatchEvent(
        new CustomEvent(SelectableEvent.MODIFIED, {
          polygon: {
            points: this.mask.style.points,
          },
        }),
      );
    }

    this.selectedAnchors.clear();
  }

  moveMask(dx: number, dy: number) {
    // @ts-ignore
    this.mask.style.points = [...this.mask.style.pointsStartDragging].map(
      ([x, y]) => [x + dx, y + dy],
    );

    // re-position anchors in canvas coordinates
    this.repositionAnchors();
  }

  triggerMovingEvent(dx: number, dy: number) {
    this.style.target.dispatchEvent(
      new CustomEvent(SelectableEvent.MOVING, {
        movingX: dx,
        movingY: dy,
        dx,
        dy,
      }),
    );
  }

  triggerMovedEvent() {
    this.style.target.dispatchEvent(
      new CustomEvent(SelectableEvent.MOVED, {
        polygon: {
          points: this.mask.style.points,
        },
      }),
    );
  }

  private repositionAnchors() {
    const { points } = this.mask.parsedStyle;
    points.points.forEach((point, i) => {
      const anchor = this.anchors[i];
      anchor.style.cx = point[0];
      anchor.style.cy = point[1];

      if (this.plugin.annotationPluginOptions.enableDisplayMidAnchors) {
        const midAnchors = this.midAnchors[i];
        const nextPoint =
          i === points.points.length - 1
            ? points.points[0]
            : points.points[i + 1];
        midAnchors.setPosition([
          (nextPoint[0] + point[0]) / 2,
          (nextPoint[1] + point[1]) / 2,
        ]);
      }
    });
  }

  private bindEventListeners() {
    const { target: targetObject } = this.style;
    // listen to drag'n'drop events
    let shiftX = 0;
    let shiftY = 0;
    const moveAt = (canvasX: number, canvasY: number) => {
      // account for multi-selection
      this.plugin.selected.forEach((selected) => {
        const selectable = this.plugin.getOrCreateSelectableUI(selected);
        selectable.triggerMovingEvent(canvasX - shiftX, canvasY - shiftY);
      });
    };

    let midAnchorIndexInDrag = -1;
    this.addEventListener('dragstart', (e: FederatedEvent) => {
      const target = e.target as DisplayObject;

      midAnchorIndexInDrag = this.midAnchors.indexOf(target);

      if (target === this.mask) {
        shiftX = e.canvasX;
        shiftY = e.canvasY;
        // @ts-ignore
        this.mask.style.pointsStartDragging = this.mask.style.points;

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
      } else if (targetObject.nodeName === Shape.POLYGON) {
        targetObject.dispatchEvent(
          new CustomEvent(SelectableEvent.MODIFIED, {
            polygon: {
              points: this.mask.style.points,
            },
          }),
        );
      }
    });
  }
}
