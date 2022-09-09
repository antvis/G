import type {
  Canvas,
  DisplayObject,
  FederatedPointerEvent,
  RenderingPlugin,
  RenderingService,
} from '@antv/g-lite';
import {
  CustomEvent,
  ElementEvent,
  Group,
  inject,
  RenderingContext,
  RenderingPluginContribution,
  Shape,
  singleton,
} from '@antv/g-lite';
import { SelectableEvent } from './constants/enum';
import { SelectableCircle, SelectablePolyline, SelectableRect } from './selectable';
import type { Selectable } from './selectable/interface';
import { SelectablePolygon } from './selectable/SelectablePolygon';
import { AnnotationPluginOptions } from './tokens';

/**
 * Make shape selectable and interactive.
 * @see http://fabricjs.com/
 *
 * @example
 * circle.style.selectable = true;
 */
@singleton({ contrib: RenderingPluginContribution })
export class SelectablePlugin implements RenderingPlugin {
  static tag = 'Selectable';

  constructor(
    @inject(RenderingContext)
    private renderingContext: RenderingContext,

    @inject(AnnotationPluginOptions)
    private annotationPluginOptions: AnnotationPluginOptions,
  ) {}

  /**
   * the topmost operation layer, which will be appended to documentElement directly
   */
  private activeSelectableLayer = new Group({
    className: 'g-annotation-active-layer',
    style: {
      zIndex: 999,
    },
  });

  /**
   * selected objects on current canvas
   */
  selected: DisplayObject[] = [];

  /**
   * each selectable has an operation UI
   */
  private selectableMap: Record<number, Selectable> = {};

  getSelectedDisplayObjects() {
    return this.selected;
  }

  selectDisplayObject(displayObject: DisplayObject) {
    const selectable = this.getOrCreateSelectableUI(displayObject);
    if (selectable && this.selected.indexOf(displayObject) === -1) {
      selectable.style.visibility = 'visible';
      this.selected.push(displayObject);
      displayObject.dispatchEvent(new CustomEvent(SelectableEvent.SELECTED));
    }
  }

  deselectDisplayObject(displayObject: DisplayObject) {
    const index = this.selected.indexOf(displayObject);
    if (index > -1) {
      const selectable = this.getOrCreateSelectableUI(displayObject);
      if (selectable) {
        selectable.style.visibility = 'hidden';
      }
      this.selected.splice(index, 1);
      displayObject.dispatchEvent(new CustomEvent(SelectableEvent.DESELECTED));
    }
  }

  private deselectAllDisplayObjects() {
    [...this.selected].forEach((target) => {
      this.deselectDisplayObject(target);
    });
  }

  getOrCreateSelectableUI(object: DisplayObject): Selectable {
    if (!this.selectableMap[object.entity]) {
      let created: Selectable;
      if (
        object.nodeName === Shape.IMAGE ||
        object.nodeName === Shape.RECT ||
        object.nodeName === Shape.ELLIPSE
      ) {
        created = new SelectableRect({
          style: {
            target: object,
            ...this.annotationPluginOptions.selectableStyle,
            // TODO: use object's selectable style to override
          },
        });
      } else if (object.nodeName === Shape.CIRCLE) {
        created = new SelectableCircle({
          style: {
            target: object,
            ...this.annotationPluginOptions.selectableStyle,
          },
        });
      } else if (object.nodeName === Shape.LINE || object.nodeName === Shape.POLYLINE) {
        created = new SelectablePolyline({
          style: {
            target: object,
            ...this.annotationPluginOptions.selectableStyle,
          },
        });
      } else if (object.nodeName === Shape.POLYGON) {
        created = new SelectablePolygon({
          style: {
            target: object,
            ...this.annotationPluginOptions.selectableStyle,
          },
        });
      }

      if (created) {
        created.plugin = this;
        this.selectableMap[object.entity] = created;
        this.activeSelectableLayer.appendChild(created);
      }
    }

    return this.selectableMap[object.entity];
  }

  /**
   * Update all existed selectable UIs.
   * @example
   *
   * plugin.updateSelectableStyle({
   *   selectionStroke: 'red',
   * });
   */
  updateSelectableStyle() {
    const { selectableStyle } = this.annotationPluginOptions;

    for (const entity in this.selectableMap) {
      this.selectableMap[entity].attr(selectableStyle);
    }
  }

  apply(renderingService: RenderingService) {
    const document = this.renderingContext.root.ownerDocument;
    const canvas = document.defaultView as Canvas;

    const handleClick = (e: FederatedPointerEvent) => {
      const object = e.target as DisplayObject;
      // @ts-ignore
      if (object === document) {
        this.deselectAllDisplayObjects();
        this.selected = [];
      } else if (object.style?.selectable) {
        if (!e.shiftKey) {
          // multi-select
          this.deselectAllDisplayObjects();
        }

        this.selectDisplayObject(object);
      }
    };

    const handleMovingTarget = (e: CustomEvent) => {
      const { dx, dy } = e.detail;
      // move selectableUI at the same time
      const selectable = this.getOrCreateSelectableUI(e.target as DisplayObject);
      if (selectable) {
        selectable.moveMask(dx, dy);
      }
    };

    const handleModifiedTarget = (e: CustomEvent) => {
      const target = e.target as DisplayObject;
      const { circle, rect, polyline, polygon } = e.detail;

      if (target.nodeName === Shape.RECT) {
        const { x, y, width, height } = rect;
        target.attr({
          x,
          y,
          width,
          height,
        });
      } else if (target.nodeName === Shape.POLYLINE) {
        target.attr({
          points: polyline.points,
        });
      } else if (target.nodeName === Shape.POLYGON) {
        target.attr({
          points: polygon.points,
        });
      } else if (target.nodeName === Shape.CIRCLE) {
        const { cx, cy, r } = circle;
        target.attr({
          cx,
          cy,
          r,
        });
      }

      // re-position target
      // target.setPosition(positionX, positionY);

      // if (target.nodeName === Shape.RECT) {
      //   target.attr({
      //     width: maskWidth,
      //     height: maskHeight,
      //   });
      // } else {
      //   target.scale(scaleX, scaleY);
      // }
    };

    const handleMovedTarget = (e: CustomEvent) => {
      const target = e.target as DisplayObject;
      const { circle, rect, polyline, polygon } = e.detail;

      if (target.nodeName === Shape.RECT) {
        target.attr({
          x: rect.x,
          y: rect.y,
        });
      } else if (target.nodeName === Shape.POLYLINE) {
        target.attr({
          points: polyline.points,
        });
      } else if (target.nodeName === Shape.POLYGON) {
        target.attr({
          points: polygon.points,
        });
      } else if (target.nodeName === Shape.CIRCLE) {
        target.attr({
          cx: circle.cx,
          cy: circle.cy,
        });
      }
    };

    // deselected when removed
    const handleUnmounted = (e: CustomEvent) => {
      this.deselectDisplayObject(e.target as DisplayObject);
    };

    // Use arrow key to move selectable UI.
    const handleKeyDown = (e: KeyboardEvent) => {
      if (this.annotationPluginOptions.isDrawingMode) {
        return;
      }

      if (
        e.key === 'ArrowLeft' ||
        e.key === 'ArrowUp' ||
        e.key === 'ArrowRight' ||
        e.key === 'ArrowDown'
      ) {
        e.stopPropagation();
        e.preventDefault();

        let dx = 0;
        let dy = 0;
        const { arrowKeyStepLength } = this.annotationPluginOptions;
        if (e.key === 'ArrowLeft') {
          dx -= arrowKeyStepLength;
        }
        if (e.key === 'ArrowUp') {
          dy -= arrowKeyStepLength;
        }
        if (e.key === 'ArrowRight') {
          dx += arrowKeyStepLength;
        }
        if (e.key === 'ArrowDown') {
          dy += arrowKeyStepLength;
        }

        // account for multi-selection
        this.selected.forEach((selected) => {
          const selectable = this.getOrCreateSelectableUI(selected);
          if (selectable) {
            selectable.triggerMovingEvent(dx, dy);
            selectable.triggerMovedEvent();
          }
        });
      }
    };

    renderingService.hooks.init.tapPromise(SelectablePlugin.tag, async () => {
      canvas.addEventListener('pointerdown', handleClick);
      canvas.addEventListener(ElementEvent.UNMOUNTED, handleUnmounted);
      window.addEventListener('keydown', handleKeyDown);
      canvas.appendChild(this.activeSelectableLayer);

      canvas.addEventListener(SelectableEvent.MOVED, handleMovedTarget);
      canvas.addEventListener(SelectableEvent.MODIFIED, handleModifiedTarget);
      canvas.addEventListener(SelectableEvent.MOVING, handleMovingTarget);
    });

    renderingService.hooks.destroy.tap(SelectablePlugin.tag, () => {
      canvas.removeEventListener('pointerdown', handleClick);
      canvas.removeEventListener(ElementEvent.UNMOUNTED, handleUnmounted);
      window.removeEventListener('keydown', handleKeyDown);
      canvas.removeChild(this.activeSelectableLayer);

      canvas.removeEventListener(SelectableEvent.MOVED, handleMovedTarget);
      canvas.removeEventListener(SelectableEvent.MODIFIED, handleModifiedTarget);
      canvas.removeEventListener(SelectableEvent.MOVING, handleMovingTarget);
    });
  }
}
