import { runtime } from '../global-runtime';
import { DisplayObject } from '../display-objects';
import {
  type FederatedEvent,
  type CustomEvent,
  type MutationRecord,
  ElementEvent,
} from '../dom';
import type { RenderingPlugin, RenderingPluginContext } from '../services';
import { raf } from '../utils';

/**
 * PrepareRendererPlugin handles rendering preparation tasks
 * Simplified implementation focused on core rendering needs
 */
export class PrepareRendererPlugin implements RenderingPlugin {
  static tag = 'Prepare';

  private mutationRecords: MutationRecord[] = [];
  private isFirstTimeRendering = true;

  isFirstTimeRenderingFinished = false;

  apply(context: RenderingPluginContext) {
    const { config, renderingService, renderingContext } = context;
    const canvas = renderingContext.root.ownerDocument.defaultView;

    const handleAttributeChanged = (e: FederatedEvent) => {
      renderingService.dirty();
    };

    const handleBoundsChanged = (
      e: CustomEvent<{ detail: MutationRecord[] }>,
    ) => {
      const records = e.detail;
      // Store mutation records for potential future processing
      this.mutationRecords.push(...records);
      renderingService.dirty();
    };

    const handleMounted = (e: FederatedEvent) => {
      const object = e.target as DisplayObject;

      if (runtime.enableSizeAttenuation) {
        runtime.styleValueRegistry.updateSizeAttenuation(
          object,
          canvas.getCamera().getZoom(),
        );
      }
    };

    const handleUnmounted = (e: FederatedEvent) => {
      const object = e.target as DisplayObject;

      // No spatial index cleanup needed
      runtime.sceneGraphService.dirtyToRoot(object);
      renderingService.dirty();
    };

    renderingService.hooks.init.tap(PrepareRendererPlugin.tag, () => {
      canvas.addEventListener(ElementEvent.MOUNTED, handleMounted);
      canvas.addEventListener(ElementEvent.UNMOUNTED, handleUnmounted);
      canvas.addEventListener(
        ElementEvent.ATTR_MODIFIED,
        handleAttributeChanged,
      );
      canvas.addEventListener(ElementEvent.BOUNDS_CHANGED, handleBoundsChanged);
    });

    renderingService.hooks.destroy.tap(PrepareRendererPlugin.tag, () => {
      canvas.removeEventListener(ElementEvent.MOUNTED, handleMounted);
      canvas.removeEventListener(ElementEvent.UNMOUNTED, handleUnmounted);
      canvas.removeEventListener(
        ElementEvent.ATTR_MODIFIED,
        handleAttributeChanged,
      );
      canvas.removeEventListener(
        ElementEvent.BOUNDS_CHANGED,
        handleBoundsChanged,
      );

      this.mutationRecords = [];
    });

    const ric =
      runtime.globalThis.requestIdleCallback ?? raf.bind(runtime.globalThis);

    renderingService.hooks.endFrame.tap(PrepareRendererPlugin.tag, () => {
      if (this.isFirstTimeRendering) {
        this.isFirstTimeRendering = false;
        ric(() => {
          this.isFirstTimeRenderingFinished = true;
        });
      }

      // Clear mutation records after each frame
      this.mutationRecords = [];
    });
  }
}
