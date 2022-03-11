import { TextAlign } from '../types';
import type { DisplayObject } from '../display-objects';

export function updateTextAlign(
  oldTextAlign: TextAlign | 'inherit',
  newTextAlign: TextAlign | 'inherit',
  o: DisplayObject,
) {
  // default to 'start'
  // @ts-ignore
  let calculatedTextAlign: TextAlign = newTextAlign;
  if (newTextAlign === 'inherit') {
    let tmp = o.parentElement as DisplayObject;
    while (tmp) {
      if (tmp.style.textAlign !== 'inherit') {
        calculatedTextAlign = tmp.parsedStyle.textAlign;
        break;
      }
      tmp = tmp.parentElement as DisplayObject;
    }
  }

  o.parsedStyle.textAlign = calculatedTextAlign;

  // update descendants if their align is 'inherit'
  // o.forEach((child: DisplayObject) => {
  //   if (child !== o && child.getAttribute('text-align') === 'inherit') {
  //     child.parsedStyle.textAlign = calculatedTextAlign;
  //   }
  // });
}
