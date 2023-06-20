import type {
  DisplayObject,
  FederatedPointerEvent,
  IDocument,
  RenderingPlugin,
  RenderingPluginContext,
} from '@antv/g-lite';
import { distanceSquareRoot } from '@antv/util';
import type { DragndropPluginOptions } from './interfaces';

export class DragndropPlugin implements RenderingPlugin {
  static tag = 'Dragndrop';

  constructor(public dragndropPluginOptions: DragndropPluginOptions) {}

  apply(context: RenderingPluginContext) {
    const { renderingService, renderingContext } = context;
    const document = renderingContext.root.ownerDocument;

    // TODO: should we add an option like `draggable` to Canvas
    const canvas = document.defaultView;

    const handlePointerdown = (event: FederatedPointerEvent) => {
      const target = event.target as DisplayObject;
      const isDocument = (target as unknown as IDocument) === document;

      const draggableEventTarget =
        isDocument && this.dragndropPluginOptions.isDocumentDraggable
          ? document
          : target.closest && target.closest('[draggable=true]');

      // `draggable` may be set on ancestor nodes:
      // @see https://github.com/antvis/G/issues/1088
      if (draggableEventTarget) {
        // delay triggering dragstart event
        let dragstartTriggered = false;
        const dragstartTimeStamp = event.timeStamp;
        const dragstartClientCoordinates: [number, number] = [
          event.clientX,
          event.clientY,
        ];

        let currentDroppable = null;
        let lastDragClientCoordinates = [event.clientX, event.clientY];
        // @ts-ignore
        // eslint-disable-next-line no-inner-declarations
        const handlePointermove = async (event: FederatedPointerEvent) => {
          if (!dragstartTriggered) {
            const timeElapsed = event.timeStamp - dragstartTimeStamp;
            const distanceMoved = distanceSquareRoot(
              [event.clientX, event.clientY],
              dragstartClientCoordinates,
            );
            // check thresholds
            if (
              timeElapsed <=
                this.dragndropPluginOptions.dragstartTimeThreshold ||
              distanceMoved <=
                this.dragndropPluginOptions.dragstartDistanceThreshold
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
              this.dragndropPluginOptions.overlap === 'pointer'
                ? [event.canvasX, event.canvasY]
                : target.getBounds().center;
            const elementsBelow = await document.elementsFromPoint(
              point[0],
              point[1],
            );

            // prevent from picking the dragging element
            const elementBelow =
              elementsBelow[elementsBelow.indexOf(target) + 1];

            const droppableBelow =
              elementBelow?.closest('[droppable=true]') ||
              (this.dragndropPluginOptions.isDocumentDroppable
                ? document
                : null);
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
        };

        canvas.addEventListener('pointermove', handlePointermove);

        const stopDragging = function (
          originalPointerUpEvent: FederatedPointerEvent,
        ) {
          if (dragstartTriggered) {
            // prevent click event being triggerd
            // @see https://github.com/antvis/G/issues/1091
            originalPointerUpEvent.detail = {
              preventClick: true,
            };

            // clone event first
            const event = originalPointerUpEvent.clone();

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
            draggableEventTarget.dispatchEvent(event);

            dragstartTriggered = false;
          }

          canvas.removeEventListener('pointermove', handlePointermove);
        };

        target.addEventListener('pointerup', stopDragging, { once: true });
        target.addEventListener('pointerupoutside', stopDragging, {
          once: true,
        });
      }
    };

    renderingService.hooks.init.tap(DragndropPlugin.tag, () => {
      canvas.addEventListener('pointerdown', handlePointerdown);
    });

    renderingService.hooks.destroy.tap(DragndropPlugin.tag, () => {
      canvas.removeEventListener('pointerdown', handlePointerdown);
    });
  }
}
