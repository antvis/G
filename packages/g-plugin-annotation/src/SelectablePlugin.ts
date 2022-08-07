import type {
  Canvas,
  DisplayObject,
  FederatedEvent,
  RenderingPlugin,
  RenderingService,
} from '@antv/g';
import {
  ElementEvent,
  Group,
  inject,
  RenderingContext,
  RenderingPluginContribution,
  Shape,
  singleton,
} from '@antv/g';
import { SelectablePolyline } from './selectable/SelectablePolyline';
import { SelectableRect } from './selectable/SelectableRect';
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

    const handleClick = (e: FederatedEvent) => {
      const object = e.target as DisplayObject;

      // @ts-ignore
      if (object === document) {
        this.activeSelectableLayer.children.forEach((selectable) => {
          selectable.style.visibility = 'hidden';
        });

        this.selected = [];
      } else if (object.style?.selectable) {
        // Whether to cancel the selected object?
        // TODO: multi-select
        this.selected.forEach((o) => {
          const selectable = this.getOrCreateSelectableUI(o);
          selectable.style.visibility = 'hidden';
        });

        const selectable = this.getOrCreateSelectableUI(object);
        if (selectable) {
          selectable.style.visibility = 'visible';
          this.selected.push(object);
        }
      }
    };

    renderingService.hooks.init.tapPromise(SelectablePlugin.tag, async () => {
      canvas.addEventListener('click', handleClick);
      canvas.appendChild(this.activeSelectableLayer);
    });

    renderingService.hooks.destroy.tap(SelectablePlugin.tag, () => {
      canvas.removeEventListener('click', handleClick);
      canvas.removeChild(this.activeSelectableLayer);
    });
  }
}
