import type { ParsedTextStyleProps } from '../display-objects/Text';
import { isNumber } from './assert';
import { isString } from './string';

const genericFontFamilies = ['serif', 'sans-serif', 'monospace', 'cursive', 'fantasy', 'system-ui'];

export function toFontString(attributes: Partial<ParsedTextStyleProps>) {
  const { fontSize, fontFamily, fontStyle, fontVariant, fontWeight } = attributes;

  // build canvas api font setting from individual components. Convert a numeric this.fontSize to px
  const fontSizeString: string = isNumber(fontSize) ? `${fontSize}px` : fontSize.toString();
  // Clean-up fontFamily property by quoting each font name
  // this will support font names with spaces

  // @ts-ignore
  const fontFamilies: string[] = isString(fontFamily) ? fontFamily.split(',') : [fontFamily.value];

  for (let i = fontFamilies.length - 1; i >= 0; i--) {
    // Trim any extra white-space
    let fontFamily = fontFamilies[i].trim();
    // Check if font already contains strings
    if (!/([\"\'])[^\'\"]+\1/.test(fontFamily) && genericFontFamilies.indexOf(fontFamily) < 0) {
      fontFamily = `"${fontFamily}"`;
    }
    (fontFamilies as string[])[i] = fontFamily;
  }
  return `${fontStyle} ${fontVariant} ${fontWeight} ${fontSizeString} ${(
    fontFamilies as string[]
  ).join(',')}`;
}
