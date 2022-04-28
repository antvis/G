import { singleton } from 'mana-syringe';

/**
 *
 * @example
 *
 * // register layout
 * CSS.registerLayout('centering', class {});
 * // use with `display` property
 * group.style.display = 'layout(centering)';
 */
@singleton()
export class LayoutRegistry {
  // private cache: Record<string, any> = {};
}
