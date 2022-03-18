import { inject, singleton } from 'mana-syringe';
import type { DisplayObject } from '..';
import type { Element, FederatedEvent } from '../dom';
import { ElementEvent } from '../dom';
import {
  RenderingContext,
  RenderReason,
  RenderingPluginContribution,
  dirtifyToRoot,
} from '../services';
import type { RenderingService, RenderingPlugin } from '../services/RenderingService';

const INHERIT_PROPERTIES = ['textAlign', 'fontSize', 'fontFamily', 'fontWeight', 'fontStyle'];
const RELATIVE_PROPERTIES = ['dx', 'dy'];

@singleton({ contrib: RenderingPluginContribution })
export class PrepareRendererPlugin implements RenderingPlugin {
  static tag = 'PrepareRendererPlugin';

  @inject(RenderingContext)
  private renderingContext: RenderingContext;

  apply(renderingService: RenderingService) {
    const handleAttributeChanged = () => {
      this.renderingContext.renderReasons.add(RenderReason.DISPLAY_OBJECT_CHANGED);
    };

    const handleBoundsChanged = () => {
      renderingService.dirtify();
    };

    const handleMounted = (e: FederatedEvent) => {
      const object = e.target as DisplayObject;
      // compute some style
      INHERIT_PROPERTIES.forEach((name) => {
        if (object.getAttribute(name) === 'inherit') {
          const calculated = this.calculateInheritStyleProperty(object, name);
          object.parsedStyle[name] = calculated;
          object.updateStyleProperty(name, 'inherit', calculated);

          console.log('parsed relative', name, calculated, object.style.text);
        }
      });

      // RELATIVE_PROPERTIES.forEach((name) => {
      //   if (object.parsedStyle.hasOwnProperty(name)) {
      //     const oldParsedValue = object.parsedStyle[name];
      //     const { unit, value } = oldParsedValue;
      //     if (unit === 'em') {
      //       const { value: parentFontSize } = (object.parentElement as DisplayObject).parsedStyle
      //         .fontSize;
      //       object.parsedStyle[name] = { unit: 'px', value: value * parentFontSize };
      //       object.updateStyleProperty(name, oldParsedValue, object.parsedStyle[name]);
      //     }
      //   }
      // });

      dirtifyToRoot(object);
      renderingService.dirtify();
    };

    const handleUnmounted = (e: FederatedEvent) => {
      dirtifyToRoot(e.target as Element);
      renderingService.dirtify();
    };

    renderingService.hooks.init.tap(PrepareRendererPlugin.tag, () => {
      this.renderingContext.root.addEventListener(ElementEvent.MOUNTED, handleMounted);
      this.renderingContext.root.addEventListener(ElementEvent.UNMOUNTED, handleUnmounted);
      this.renderingContext.root.addEventListener(
        ElementEvent.ATTR_MODIFIED,
        handleAttributeChanged,
      );
      this.renderingContext.root.addEventListener(ElementEvent.BOUNDS_CHANGED, handleBoundsChanged);
    });

    renderingService.hooks.destroy.tap(PrepareRendererPlugin.tag, () => {
      this.renderingContext.root.removeEventListener(ElementEvent.MOUNTED, handleMounted);
      this.renderingContext.root.removeEventListener(ElementEvent.UNMOUNTED, handleUnmounted);
      this.renderingContext.root.removeEventListener(
        ElementEvent.ATTR_MODIFIED,
        handleAttributeChanged,
      );
      this.renderingContext.root.removeEventListener(
        ElementEvent.BOUNDS_CHANGED,
        handleBoundsChanged,
      );
    });
  }

  private calculateInheritStyleProperty(child: DisplayObject, name: string) {
    let ascendant = child.parentElement;
    while (ascendant) {
      if (
        ascendant.getAttribute(name) !== 'inherit' &&
        ascendant.parsedStyle.hasOwnProperty(name)
      ) {
        return ascendant.parsedStyle[name];
      }
      ascendant = ascendant.parentElement;
    }
    return null;
  }
}
