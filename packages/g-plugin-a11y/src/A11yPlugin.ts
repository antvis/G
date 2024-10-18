import type {
  DisplayObject,
  FederatedEvent,
  MutationEvent,
  RenderingPlugin,
  RenderingPluginContext,
  Text,
} from '@antv/g-lite';
import { ElementEvent, isBrowser, Shape } from '@antv/g-lite';
import type { AriaManager } from './AriaManager';
import type { TextExtractor } from './TextExtractor';
import type { A11yPluginOptions } from './interfaces';

export class A11yPlugin implements RenderingPlugin {
  static tag = 'A11y';

  private context: RenderingPluginContext;

  constructor(
    private a11yPluginOptions: Partial<A11yPluginOptions>,
    private textExtractor: TextExtractor,
    private ariaManager: AriaManager,
  ) {}

  apply(context: RenderingPluginContext) {
    this.context = context;
    const { renderingService, renderingContext } = context;
    const canvas = renderingContext.root.ownerDocument.defaultView;
    const { enableExtractingText, enableARIA } = this.a11yPluginOptions;

    const handleMounted = (e: FederatedEvent) => {
      const object = e.target as DisplayObject;

      if (enableExtractingText && !this.isSVG()) {
        if (object.nodeName === Shape.TEXT) {
          this.textExtractor.getOrCreateEl(object as Text);

          Object.keys(object.attributes).forEach((name) => {
            this.textExtractor.updateAttribute(name, object as Text);
          });

          this.textExtractor.updateAttribute('modelMatrix', object as Text);
        }
      }

      if (enableARIA) {
        this.ariaManager.createOrUpdateA11yDOM(object);
      }
    };

    const handleAttributeChanged = (e: MutationEvent) => {
      const object = e.target as DisplayObject;
      const { attrName } = e;

      if (enableExtractingText && !this.isSVG()) {
        if (object.nodeName === Shape.TEXT) {
          this.textExtractor.updateAttribute(attrName, object as Text);
        }
      }
    };

    const handleBoundsChanged = (e: MutationEvent) => {
      const object = e.target as DisplayObject;
      if (enableExtractingText && !this.isSVG()) {
        const nodes =
          object.nodeName === Shape.FRAGMENT ? object.childNodes : [object];

        nodes.forEach((node: DisplayObject) => {
          if (node.nodeName === Shape.TEXT) {
            this.textExtractor.updateAttribute('modelMatrix', node as Text);
          }
        });
      }
    };

    const handleUnmounted = (e: FederatedEvent) => {
      const object = e.target as DisplayObject;

      if (enableExtractingText && !this.isSVG()) {
        if (object.nodeName === Shape.TEXT) {
          this.textExtractor.removeEl(object as Text);
        }
      }

      if (enableARIA) {
        this.ariaManager.removeA11yDOM(object);
      }
    };

    renderingService.hooks.init.tap(A11yPlugin.tag, () => {
      if (enableExtractingText && !this.isSVG()) {
        this.textExtractor.activate();
      }

      if (enableARIA) {
        this.ariaManager.activate();
      }

      canvas.addEventListener(ElementEvent.MOUNTED, handleMounted);
      canvas.addEventListener(ElementEvent.UNMOUNTED, handleUnmounted);
      canvas.addEventListener(
        ElementEvent.ATTR_MODIFIED,
        handleAttributeChanged,
      );
      canvas.addEventListener(ElementEvent.BOUNDS_CHANGED, handleBoundsChanged);
    });

    renderingService.hooks.destroy.tap(A11yPlugin.tag, () => {
      if (enableExtractingText && !this.isSVG()) {
        this.textExtractor.deactivate();
      }

      if (enableARIA) {
        this.ariaManager.deactivate();
      }

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
    });
  }

  private isSVG() {
    return (
      isBrowser &&
      this.context.contextService.getDomElement() instanceof SVGSVGElement
    );
  }
}
