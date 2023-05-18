import type { DisplayObject, FederatedEvent } from '@antv/g-lite';
import { Circle, CustomEvent, Shape } from '@antv/g-lite';
import { SelectableEvent } from '../constants/enum';
import { AbstractSelectable } from './AbstractSelectable';

/**
 * Circle with no anchors
 */
export class SelectableCircle extends AbstractSelectable<Circle> {
  init() {
    const {
      selectionFill,
      selectionFillOpacity,
      selectionStroke,
      selectionStrokeOpacity,
      selectionStrokeWidth,
      target,
    } = this.style;

    const { cx, cy, r } = target.parsedStyle;

    this.mask = new Circle({
      style: {
        cx,
        cy,
        r,
        draggable: target.style.maskDraggable === false ? false : true,
        increasedLineWidthForHitTesting:
          this.plugin.annotationPluginOptions.selectableStyle
            .maskIncreasedLineWidthForHitTesting,
        cursor: 'move',
      },
    });
    this.appendChild(this.mask);

    // resize according to target
    this.mask.style.fill = selectionFill;
    this.mask.style.stroke = selectionStroke;
    this.mask.style.fillOpacity = selectionFillOpacity;
    this.mask.style.strokeOpacity = selectionStrokeOpacity;
    this.mask.style.lineWidth = selectionStrokeWidth;

    this.bindEventListeners();
  }

  deleteSelectedAnchors(): void {}

  destroy(): void {}

  moveMask(dx: number, dy: number) {
    const { cx, cy } = this.mask.parsedStyle;
    this.mask.attr({
      cx: cx + dx,
      cy: cy + dy,
    });
  }

  triggerMovingEvent(dx: number, dy: number) {
    const { cx, cy } = this.mask.parsedStyle;
    this.style.target.dispatchEvent(
      new CustomEvent(SelectableEvent.MOVING, {
        movingX: dx + cx,
        movingY: dy + cy,
        dx,
        dy,
      }),
    );
  }

  triggerMovedEvent() {
    const { cx, cy } = this.mask.parsedStyle;
    this.style.target.dispatchEvent(
      new CustomEvent(SelectableEvent.MOVED, {
        circle: {
          cx,
          cy,
        },
      }),
    );
  }

  private bindEventListeners() {
    const { target: targetObject } = this.style;
    // listen to drag'n'drop events
    let shiftX = 0;
    let shiftY = 0;
    const moveAt = (canvasX: number, canvasY: number) => {
      const { cx, cy } = this.mask.parsedStyle;

      // account for multi-selection
      this.plugin.selected.forEach((selected) => {
        const selectable = this.plugin.getOrCreateSelectableUI(selected);
        selectable.triggerMovingEvent(
          canvasX - shiftX - cx,
          canvasY - shiftY - cy,
        );
      });
    };

    this.addEventListener('dragstart', (e: FederatedEvent) => {
      const target = e.target as DisplayObject;

      if (target === this.mask) {
        const { cx, cy } = this.mask.parsedStyle;
        shiftX = e.canvasX - cx;
        shiftY = e.canvasY - cy;

        moveAt(e.canvasX, e.canvasY);
      }
    });
    this.addEventListener('drag', (e: FederatedEvent) => {
      const target = e.target as DisplayObject;
      const { canvasX, canvasY } = e;

      if (target === this.mask) {
        moveAt(canvasX, canvasY);
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
      } else if (targetObject.nodeName === Shape.CIRCLE) {
        targetObject.dispatchEvent(
          new CustomEvent(SelectableEvent.MODIFIED, {
            circle: {
              cx: this.mask.style.cx,
              cy: this.mask.style.cy,
              r: this.mask.style.r,
            },
          }),
        );
      }
    });
  }
}
