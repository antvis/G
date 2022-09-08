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
import { distanceSquareRoot } from '@antv/util';
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
    const {
      overlap,
      isDocumentDraggable,
      isDocumentDroppable,
      dragstartDistanceThreshold,
      dragstartTimeThreshold,
    } = this.dragndropPluginOptions;

    const handlePointerdown = (event: FederatedPointerEvent) => {
      const target = event.target as DisplayObject;
      const isDocument = (target as unknown as IDocument) === document;

      const draggableEventTarget =
        isDocument && isDocumentDraggable
          ? document
          : target.closest && target.closest('[draggable=true]');

      // `draggable` may be set on ancestor nodes:
      // @see https://github.com/antvis/G/issues/1088
      if (!!draggableEventTarget) {
        // delay triggering dragstart event
        let dragstartTriggered = false;
        const dragstartTimeStamp = event.timeStamp;
        const dragstartClientCoordinates: [number, number] = [event.clientX, event.clientY];

        let currentDroppable = null;
        let lastDragClientCoordinates = [event.clientX, event.clientY];
        // @ts-ignore
        async function handlePointermove(event: FederatedPointerEvent) {
          if (!dragstartTriggered) {
            const timeElapsed = event.timeStamp - dragstartTimeStamp;
            const distanceMoved = distanceSquareRoot(
              [event.clientX, event.clientY],
              dragstartClientCoordinates,
            );
            // check thresholds
            if (
              timeElapsed <= dragstartTimeThreshold ||
              distanceMoved <= dragstartDistanceThreshold
            ) {
              return;
            }

            // @see https://developer.mozilla.org/zh-CN/docs/Web/API/Document/dragstart_event
            event.type = 'dragstart';

            draggableEventTarget.dispatchEvent(event);
            dragstartTriggered = true;
          }

          // @see https://developer.mozilla.org/zh-CN/docs/Web/API/Document/drag_event
          event.type = 'drag';
          // @ts-ignore
          event.dx = event.clientX - lastDragClientCoordinates[0];
          // @ts-ignore
          event.dy = event.clientY - lastDragClientCoordinates[1];
          draggableEventTarget.dispatchEvent(event);
          lastDragClientCoordinates = [event.clientX, event.clientY];

          if (!isDocument) {
            const point =
              overlap === 'pointer' ? [event.canvasX, event.canvasY] : target.getBounds().center;
            const elementsBelow = await document.elementsFromPoint(point[0], point[1]);

            // prevent from picking the dragging element
            const elementBelow = elementsBelow[elementsBelow.indexOf(target) + 1];

            const droppableBelow =
              elementBelow?.closest('[droppable=true]') || (isDocumentDroppable ? document : null);
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

        canvas.addEventListener('pointermove', handlePointermove);

        const stopDragging = function () {
          if (dragstartTriggered) {
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
            // prevent click event being triggerd
            // @see https://github.com/antvis/G/issues/1091
            event.detail = {
              preventClick: true,
            };
            draggableEventTarget.dispatchEvent(event);

            dragstartTriggered = false;
          }

          canvas.removeEventListener('pointermove', handlePointermove);
        };

        target.addEventListener('pointerup', stopDragging, { once: true });
        target.addEventListener('pointerupoutside', stopDragging, { once: true });
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
