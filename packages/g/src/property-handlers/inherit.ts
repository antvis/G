import type { DisplayObject } from '..';

/**
 * update descendants
 */
export function updateInherit(
  oldValue: any,
  newValue: any,
  o: DisplayObject,
  service: any,
  name: string,
) {
  o.children.forEach((child: DisplayObject) => {
    if (child.getAttribute(name) === 'inherit') {
      child.parsedStyle[name] = newValue;
      const oldParsedValue = child.parsedStyle[name];
      child.updateStyleProperty(name, oldParsedValue, newValue);
    }
  });
}

export function computeInheritStyleProperty(child: DisplayObject, name: string) {
  let ascendant = child.parentElement;
  while (ascendant) {
    if (ascendant.getAttribute(name) !== 'inherit' && ascendant.parsedStyle.hasOwnProperty(name)) {
      return ascendant.parsedStyle[name];
    }
    ascendant = ascendant.parentElement;
  }

  return null;
}
