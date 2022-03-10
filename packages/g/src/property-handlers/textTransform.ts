import { TextTransform } from '../types';
import type { DisplayObject, Text } from '../display-objects';
import { SHAPE } from '..';

/**
 * @see https://developer.mozilla.org/zh-CN/docs/Web/CSS/text-transform
 */
export function updateTextTransform(
  oldTextTransform: TextTransform,
  newTextTransform: TextTransform,
  o: DisplayObject,
) {
  if (o.nodeName === SHAPE.Text) {
    const object = o as Text;
    if (newTextTransform === TextTransform.CAPITALIZE) {
      object.style.text = object.style.text.charAt(0).toUpperCase() + object.style.text.slice(1);
    } else if (newTextTransform === TextTransform.LOWERCASE) {
      object.style.text = object.style.text.toLowerCase();
    } else if (newTextTransform === TextTransform.UPPERCASE) {
      object.style.text = object.style.text.toUpperCase();
      // } else if (newTextTransform === TextTransform.NONE) {
    }
  }
}
