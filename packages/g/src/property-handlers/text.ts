import type { DisplayObject } from '../display-objects/DisplayObject';

export function updateText(oldValue: string, newValue: string, object: DisplayObject) {
  object.nodeValue = `${newValue}` || '';
}
