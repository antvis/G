import type {
  DisplayObject,
  GlobalRuntime,
  PickingResult,
  RenderingPlugin,
  RenderingPluginContext,
} from '@antv/g-lite';

/**
 * pick shape(s) with Mouse/Touch event
 *
 * 1. find AABB with r-tree
 * 2. use elementFromPoint
 */
export class SVGPickerPlugin implements RenderingPlugin {
  static tag = 'SVGPicker';

  apply(context: RenderingPluginContext, runtime: GlobalRuntime) {
    const {
      config: { document: doc },
      renderingService,
      // @ts-ignore
      svgElementMap,
    } = context;

    renderingService.hooks.pick.tapPromise(
      SVGPickerPlugin.tag,
      async (result: PickingResult) => {
        return this.pick(svgElementMap, doc, result);
      },
    );

    renderingService.hooks.pickSync.tap(
      SVGPickerPlugin.tag,
      (result: PickingResult) => {
        return this.pick(svgElementMap, doc, result);
      },
    );
  }

  private pick(
    svgElementMap: WeakMap<SVGElement, DisplayObject>,
    doc: Document | ShadowRoot,
    result: PickingResult,
  ) {
    const {
      topmost,
      position: { clientX, clientY },
    } = result;

    try {
      const targets: DisplayObject[] = [];
      // @see https://developer.mozilla.org/zh-CN/docs/Web/API/Document/elementsFromPoint
      for (const element of (doc || document).elementsFromPoint(
        clientX,
        clientY,
      )) {
        if (element.shadowRoot && element.shadowRoot !== doc) {
          return this.pick(svgElementMap, element.shadowRoot, result);
        }
        const target = svgElementMap.get(element as SVGElement);
        // don't need to account for `visibility` since DOM API already does
        if (target && target.isInteractive()) {
          targets.push(target);

          if (topmost) {
            result.picked = targets;
            return result;
          }
        }
      }

      result.picked = targets;
    } catch {
      result.picked = [];
    }
    return result;
  }
}
