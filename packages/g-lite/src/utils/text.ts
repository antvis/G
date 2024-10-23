import { isNumber } from '@antv/util';
import type { ParsedTextStyleProps } from '../display-objects/Text';

const genericFontFamilies = [
  'serif',
  'sans-serif',
  'monospace',
  'cursive',
  'fantasy',
  'system-ui',
];
const stringRegExp = /([\"\'])[^\'\"]+\1/;

export function toFontString(attributes: Partial<ParsedTextStyleProps>) {
  const {
    fontSize = 16,
    fontFamily = 'sans-serif',
    fontStyle = 'normal',
    fontVariant = 'normal',
    fontWeight = 'normal',
  } = attributes;

  // build canvas api font setting from individual components. Convert a numeric this.fontSize to px
  // const fontSizeString: string = isNumber(fontSize) ? `${fontSize}px` : fontSize.toString();
  const fontSizeString: string =
    (isNumber(fontSize) && `${fontSize}px`) || '16px';
  // Clean-up fontFamily property by quoting each font name
  // this will support font names with spaces

  const fontFamilies: string[] = fontFamily.split(',');

  for (let i = fontFamilies.length - 1; i >= 0; i--) {
    // Trim any extra white-space
    let fontFamily = fontFamilies[i].trim();
    // Check if font already contains strings
    if (
      !stringRegExp.test(fontFamily) &&
      genericFontFamilies.indexOf(fontFamily) < 0
    ) {
      fontFamily = `"${fontFamily}"`;
    }
    fontFamilies[i] = fontFamily;
  }
  return `${fontStyle} ${fontVariant} ${fontWeight} ${fontSizeString} ${fontFamilies.join(
    ',',
  )}`;
}
