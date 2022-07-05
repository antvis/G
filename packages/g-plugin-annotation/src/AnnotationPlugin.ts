import {
  Canvas,
  ContextService,
  DisplayObject,
  FederatedEvent,
  Group,
  inject,
  RenderingContext,
  RenderingPlugin,
  RenderingPluginContribution,
  RenderingService,
  Shape,
  singleton,
} from '@antv/g';
import { SelectableRect } from './SelectableRect';
import { AnnotationPluginOptions } from './tokens';

/**
 * make shape selectable:
 * @example
 * circle.style.selectable = true;
 */
@singleton({ contrib: RenderingPluginContribution })
export class AnnotationPlugin implements RenderingPlugin {
  static tag = 'Annotation';

  @inject(RenderingContext)
  private renderingContext: RenderingContext;

  @inject(ContextService)
  private contextService: ContextService<unknown>;

  @inject(AnnotationPluginOptions)
  private annotationPluginOptions: AnnotationPluginOptions;

  private activeSelectableLayer = new Group({
    className: 'g-annotation-active-layer',
    style: {
      zIndex: 999,
    },
  });

  apply(renderingService: RenderingService) {
    const document = this.renderingContext.root.ownerDocument;
    const canvas = document.defaultView as Canvas;

    const handleClick = (e: FederatedEvent) => {
      const object = e.target as DisplayObject;

      if (object.style?.selectable) {
        const selectable = this.getOrCreateSelectableUI(object);

        if (selectable) {
          selectable.style.visibility = 'visible';
        }
      } else {
        this.activeSelectableLayer.children.forEach((selectable) => {
          selectable.style.visibility = 'hidden';
        });
      }
    };

    renderingService.hooks.init.tapPromise(AnnotationPlugin.tag, async () => {
      canvas.addEventListener('click', handleClick);
      canvas.appendChild(this.activeSelectableLayer);
    });

    renderingService.hooks.destroy.tap(AnnotationPlugin.tag, () => {
      canvas.removeEventListener('click', handleClick);
      canvas.removeChild(this.activeSelectableLayer);
    });
  }

  private getOrCreateSelectableUI(object: DisplayObject): DisplayObject {
    if (!object.style.selectableUI) {
      let created: DisplayObject;
      if (object.nodeName === Shape.IMAGE) {
        created = new SelectableRect({
          style: {
            target: object,
          },
        });
      }

      if (created) {
        object.style.selectableUI = created;
        this.activeSelectableLayer.appendChild(created);
      }
    }

    return object.style.selectableUI;
  }
}
