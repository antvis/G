import { inject, singleton } from 'mana-syringe';
import { DisplayObject } from '..';
import { RenderingContext, RenderingPluginContribution } from '../services';
import type { RenderingService, RenderingPlugin } from '../services/RenderingService';

const INHERIT_PROPERTIES = ['textAlign', 'fontSize', 'fontFamily', 'fontWeight', 'fontStyle'];
const RELATIVE_PROPERTIES = ['dx', 'dy'];

/**
 * calculate style for every display object at the beginning of each frame
 *
 * @see https://hacks.mozilla.org/2017/08/inside-a-super-fast-css-engine-quantum-css-aka-stylo/
 */
@singleton({ contrib: RenderingPluginContribution })
export class CSSCalculatorPlugin implements RenderingPlugin {
  static tag = 'CSSCalculatorPlugin';

  @inject(RenderingContext)
  private renderingContext: RenderingContext;

  apply(renderingService: RenderingService) {
    renderingService.hooks.beginFrame.tap(CSSCalculatorPlugin.tag, () => {
      // calculate layout properties such as 'inherit'
      this.renderingContext.root.forEach((child: DisplayObject) => {
        INHERIT_PROPERTIES.forEach((name) => {
          if (child.getAttribute(name) === 'inherit') {
            // const calculated = this.calculateInheritStyleProperty(child, name);
            // child.parsedStyle[name] = calculated;
            // child.updateStyleProperty(name, 'inherit', calculated);
          }
        });

        RELATIVE_PROPERTIES.forEach((name) => {
          if (child.parsedStyle.hasOwnProperty(name)) {
            // const oldParsedValue = child.parsedStyle[name];
            // const { unit, value } = oldParsedValue;
            // if (unit === 'em') {
            //   const { value: parentFontSize } = (child.parentElement as DisplayObject).parsedStyle
            //     .fontSize;
            //   child.parsedStyle[name] = { unit: 'px', value: value * parentFontSize };
            //   child.updateStyleProperty(name, oldParsedValue, child.parsedStyle[name]);
            // }
          }
        });
      });
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
