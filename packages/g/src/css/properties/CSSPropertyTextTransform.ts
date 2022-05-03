import { singleton } from 'mana-syringe';
import { TextTransform, Shape } from '../../types';
import type { CSSProperty } from '../CSSProperty';
import type { Text, DisplayObject, ParsedPathStyleProps } from '../../display-objects';

@singleton()
export class CSSPropertyTextTransform
  implements Partial<CSSProperty<ParsedPathStyleProps, ParsedPathStyleProps>>
{
  postProcessor(o: DisplayObject) {
    if (o.nodeName === Shape.TEXT) {
      const object = o as Text;
      const newTextTransform = object.parsedStyle.textTransform.value;
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
