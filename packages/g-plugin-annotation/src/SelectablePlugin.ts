import type {
  Canvas,
  DisplayObject,
  FederatedPointerEvent,
  RenderingPlugin,
  RenderingService,
} from '@antv/g';
import {
  CustomEvent,
  ElementEvent,
  Group,
  inject,
  RenderingContext,
  RenderingPluginContribution,
  Shape,
  singleton,
} from '@antv/g';
import { SelectableEvent } from './constants/enum';
import { SelectablePolyline, SelectableRect } from './selectable';
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
  private selected: DisplayObject[] = [];

  /**
   * each selectable has an operation UI
   */
  private selectableMap: Record<number, DisplayObject> = {};

  @inject(RenderingContext)
  private renderingContext: RenderingContext;

  @inject(AnnotationPluginOptions)
  private annotationPluginOptions: AnnotationPluginOptions;

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
    const selectable = this.getOrCreateSelectableUI(displayObject);
    const index = this.selected.indexOf(displayObject);
    if (selectable && index > -1) {
      selectable.style.visibility = 'hidden';
      this.selected.splice(index, 1);
      displayObject.dispatchEvent(new CustomEvent(SelectableEvent.DESELECTED));
    }
  }

  private getOrCreateSelectableUI(object: DisplayObject): DisplayObject {
    if (!this.selectableMap[object.entity]) {
      let created: DisplayObject;
      if (
        object.nodeName === Shape.IMAGE ||
        object.nodeName === Shape.RECT ||
        object.nodeName === Shape.CIRCLE ||
        object.nodeName === Shape.ELLIPSE
      ) {
        created = new SelectableRect({
          style: {
            target: object,
            ...this.annotationPluginOptions.selectableStyle,
            // TODO: use object's selectable style to override
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
        this.selectableMap[object.entity] = created;
        this.activeSelectableLayer.appendChild(created);

        object.addEventListener(ElementEvent.UNMOUNTED, () => {
          this.activeSelectableLayer.removeChild(created);
        });
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
        this.selected.forEach((target) => {
          this.deselectDisplayObject(target);
        });
        this.selected = [];
      } else if (object.style?.selectable) {
        if (!e.shiftKey) {
          // multi-select
          this.selected.forEach((o) => {
            this.deselectDisplayObject(o);
          });
        }

        this.selectDisplayObject(object);
      }
    };

    const handleMovingTarget = (e: CustomEvent) => {
      const movingTarget = e.target as DisplayObject;
      const { movingX: canvasX, movingY: canvasY } = e.detail;

      const [ox, oy] = movingTarget.getPosition();
      const dx = canvasX - ox;
      const dy = canvasY - oy;

      // account for multi-select
      this.selected.forEach((target) => {
        // move selectableUI at the same time
        const selectable = this.getOrCreateSelectableUI(target);
        if (selectable) {
          selectable.translate(dx, dy);
        }

        target.translate(dx, dy);
      });
    };

    // const handleModifyingTarget = (e: CustomEvent) => {
    //   const target = e.target as DisplayObject;
    //   const { positionX, positionY, scaleX, scaleY, maskWidth, maskHeight } = e.detail;

    //   // re-position target
    //   target.setPosition(positionX, positionY);

    //   if (target.nodeName === Shape.RECT) {
    //     target.attr({
    //       width: maskWidth,
    //       height: maskHeight,
    //     });
    //   } else {
    //     target.scale(scaleX, scaleY);
    //   }
    // };

    // TODO: deselected when removed
    const handleUnmounted = (e: CustomEvent) => {
      // this.deselectDisplayObject(e.target as DisplayObject);
    };

    renderingService.hooks.init.tapPromise(SelectablePlugin.tag, async () => {
      canvas.addEventListener('pointerdown', handleClick);
      canvas.addEventListener(ElementEvent.UNMOUNTED, handleUnmounted);
      canvas.appendChild(this.activeSelectableLayer);

      canvas.addEventListener(SelectableEvent.MOVING, handleMovingTarget);
      // canvas.addEventListener(SelectableEvent.MODIFIED, handleModifyingTarget);
    });

    renderingService.hooks.destroy.tap(SelectablePlugin.tag, () => {
      canvas.removeEventListener('pointerdown', handleClick);
      canvas.removeEventListener(ElementEvent.UNMOUNTED, handleUnmounted);
      canvas.removeChild(this.activeSelectableLayer);

      canvas.removeEventListener(SelectableEvent.MOVING, handleMovingTarget);
      // canvas.removeEventListener(SelectableEvent.MODIFIED, handleModifyingTarget);
    });
  }
}
