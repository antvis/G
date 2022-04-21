import { singleton } from 'mana-syringe';
import type { CSSProperty, ParsedPathStyleProps, DisplayObject } from '../..';

@singleton()
export class CSSPropertyText
  implements Partial<CSSProperty<ParsedPathStyleProps, ParsedPathStyleProps>>
{
  postProcessor(object: DisplayObject) {
    object.nodeValue = `${object.parsedStyle.text}` || '';
  }
}
