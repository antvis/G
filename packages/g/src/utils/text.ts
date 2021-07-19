import { isNumber } from '@antv/util';
import { TextStyleProps } from '../shapes-export';

const genericFontFamilies = ['serif', 'sans-serif', 'monospace', 'cursive', 'fantasy', 'system-ui'];

export function toFontString(attributes: TextStyleProps) {
  const { fontSize, fontFamily, fontStyle, fontVariant, fontWeight } = attributes;

  // build canvas api font setting from individual components. Convert a numeric this.fontSize to px
  const fontSizeString = isNumber(fontSize) ? `${fontSize}px` : fontSize;
  // Clean-up fontFamily property by quoting each font name
  // this will support font names with spaces
  // @ts-ignore
  let fontFamilies: string[] | string = fontFamily;
  if (!Array.isArray(fontFamily)) {
    fontFamilies = (fontFamily as string).split(',');
  }
  for (let i = fontFamilies.length - 1; i >= 0; i--) {
    // Trim any extra white-space
    let fontFamily = fontFamilies[i].trim();
    // Check if font already contains strings
    if (!/([\"\'])[^\'\"]+\1/.test(fontFamily) && genericFontFamilies.indexOf(fontFamily) < 0) {
      fontFamily = `"${fontFamily}"`;
    }
    (fontFamilies as string[])[i] = fontFamily;
  }
  return `${fontStyle} ${fontVariant} ${fontWeight} ${fontSizeString} ${(fontFamilies as string[]).join(',')}`;
}
