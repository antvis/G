import { singleton } from 'mana-syringe';
import type {
  Text,
  CSSProperty,
  ParsedPathStyleProps,
  DisplayObject} from '../..';
import {
  TextTransform,
  Shape,
} from '../..';

@singleton()
export class CSSPropertyTextTransform
  implements Partial<CSSProperty<ParsedPathStyleProps, ParsedPathStyleProps>>
{
  postProcessor(o: DisplayObject) {
    if (o.nodeName === Shape.TEXT) {
      const object = o as Text;
      const newTextTransform = object.parsedStyle.textTransform;
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
}
