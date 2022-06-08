import type {
  DisplayObject,
  FederatedPointerEvent,
  IDocument,
  RenderingPlugin,
  RenderingService,
} from '@antv/g';
import {
  inject,
  RenderingContext,
  RenderingPluginContribution,
  SceneGraphService,
  singleton,
} from '@antv/g';
import { DragndropPluginOptions } from './tokens';

@singleton({ contrib: RenderingPluginContribution })
export class DragndropPlugin implements RenderingPlugin {
  static tag = 'Dragndrop';

  @inject(SceneGraphService)
  protected sceneGraphService: SceneGraphService;

  @inject(RenderingContext)
  private renderingContext: RenderingContext;

  @inject(DragndropPluginOptions)
  private dragndropPluginOptions: DragndropPluginOptions;

  apply(renderingService: RenderingService) {
    const document = this.renderingContext.root.ownerDocument;

    // TODO: should we add an option like `draggable` to Canvas
    const canvas = document.defaultView;
    const { overlap, isDocumentDraggable } = this.dragndropPluginOptions;

    const handlePointerdown = (event: FederatedPointerEvent) => {
      const target = event.target as DisplayObject;
      const isDocument = (target as unknown as IDocument) === document;
      if (
        (isDocument && isDocumentDraggable) ||
        (target.getAttribute && target.getAttribute('draggable'))
      ) {
        // @see https://developer.mozilla.org/zh-CN/docs/Web/API/Document/dragstart_event
        event.type = 'dragstart';
        target.dispatchEvent(event);

        let currentDroppable = null;
        // @ts-ignore
        async function onMouseMove(event: FederatedPointerEvent) {
          // @see https://developer.mozilla.org/zh-CN/docs/Web/API/Document/drag_event
          event.type = 'drag';

          target.dispatchEvent(event);

          if (!isDocument) {
            // prevent from picking the dragging element
            const pointerEventsOldValue = target.style.pointerEvents;
            target.style.pointerEvents = 'none';

            const point =
              overlap === 'pointer' ? [event.canvasX, event.canvasY] : target.getBounds().center;
            const elemBelow = await document.elementFromPoint(point[0], point[1]);
            target.style.pointerEvents = pointerEventsOldValue;

            const droppableBelow = elemBelow?.closest('[droppable=true]') || null;
            if (currentDroppable !== droppableBelow) {
              if (currentDroppable) {
                // null when we were not over a droppable before this event
                // @see https://developer.mozilla.org/zh-CN/docs/Web/API/Document/dragleave_event
                event.type = 'dragleave';
                event.target = currentDroppable;
                currentDroppable.dispatchEvent(event);
              }

              if (droppableBelow) {
                // @see https://developer.mozilla.org/zh-CN/docs/Web/API/Document/dragleave_event
                event.type = 'dragenter';
                event.target = droppableBelow;
                droppableBelow.dispatchEvent(event);
              }

              currentDroppable = droppableBelow;
              if (currentDroppable) {
                // null if we're not coming over a droppable now
                // @see https://developer.mozilla.org/zh-CN/docs/Web/API/Document/dragover_event
                event.type = 'dragover';
                event.target = currentDroppable;
                currentDroppable.dispatchEvent(event);
              }
            }
          }
        }

        canvas.addEventListener('pointermove', onMouseMove);
        target.addEventListener(
          'pointerup',
          function () {
            // drop should fire before dragend
            // @see https://javascript.tutorialink.com/is-there-a-defined-ordering-between-dragend-and-drop-events/

            if (currentDroppable) {
              // @see https://developer.mozilla.org/zh-CN/docs/Web/API/Document/drop_event
              event.type = 'drop';
              event.target = currentDroppable;
              currentDroppable.dispatchEvent(event);
            }

            // @see https://developer.mozilla.org/zh-CN/docs/Web/API/Document/dragend_event
            event.type = 'dragend';
            target.dispatchEvent(event);

            canvas.removeEventListener('pointermove', onMouseMove);
          },
          { once: true },
        );
      }
    };

    renderingService.hooks.init.tapPromise(DragndropPlugin.tag, async () => {
      canvas.addEventListener('pointerdown', handlePointerdown);
    });

    renderingService.hooks.destroy.tap(DragndropPlugin.tag, () => {
      canvas.removeEventListener('pointerdown', handlePointerdown);
    });
  }
}
