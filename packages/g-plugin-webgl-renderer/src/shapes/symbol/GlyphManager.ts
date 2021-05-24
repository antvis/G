// @ts-ignore
import * as TinySDF from '@mapbox/tiny-sdf';
import { inject, injectable } from 'inversify';
import { TextService } from '@antv/g';
import { AlphaImage, StyleGlyph } from './AlphaImage';

const fontsize = 24; // Font size in pixels
const buffer = 3; // Whitespace buffer around a glyph in pixels
const radius = 8; // How many pixels around the glyph shape to use for encoding distance
const cutoff = 0.25; // How much of the radius (relative) is used for the inside part the glyph

export function isCJK(char: number): boolean {
  return char >= 0x4e00 && char <= 0x9fff;
}

export function getDefaultCharacterSet(): string[] {
  const charSet = [];
  for (let i = 32; i < 128; i++) {
    charSet.push(String.fromCharCode(i));
  }
  return charSet;
}

function extractFontStack(fontStack: string) {
  const fontFamily = fontStack.trim().substring(0, fontStack.lastIndexOf(' '));
  let fontWeight = '400';
  if (/bold/i.test(fontStack)) {
    fontWeight = '900';
  } else if (/medium/i.test(fontStack)) {
    fontWeight = '500';
  } else if (/light/i.test(fontStack)) {
    fontWeight = '200';
  }

  return {
    fontFamily,
    fontWeight,
  };
}

@injectable()
export class GlyphManager {
  @inject(TextService)
  private textService: TextService;

  private sdfGeneratorCache: {
    [fontStack: string]: TinySDF;
  } = {};

  private textMetricsCache: {
    [fontStack: string]: {
      [char: string]: number;
    };
  } = {};

  generateSDF(fontStack: string = '', char: string): StyleGlyph {
    const { fontFamily, fontWeight } = extractFontStack(fontStack);

    const charCode = char.charCodeAt(0);
    let sdfGenerator = this.sdfGeneratorCache[fontStack];
    if (!sdfGenerator) {
      // 创建 SDF
      sdfGenerator = this.sdfGeneratorCache[fontStack] =
        // TODO: use OffscreenCanvas in TextService
        new TinySDF(fontsize, buffer, radius, cutoff, fontFamily, fontWeight);
    }

    if (!this.textMetricsCache[fontStack]) {
      this.textMetricsCache[fontStack] = {};
    }

    if (!this.textMetricsCache[fontStack][char]) {
      // 使用 mapbox/tiny-sdf 中的 context
      // @see https://stackoverflow.com/questions/46126565/how-to-get-font-glyphs-metrics-details-in-javascript
      this.textMetricsCache[fontStack][char] = sdfGenerator.ctx.measureText(char).width;
    }

    return {
      id: charCode,
      // 在 canvas 中绘制字符，使用 Uint8Array 存储 30*30 sdf 数据
      bitmap: new AlphaImage({ width: 30, height: 30 }, sdfGenerator.draw(char)),
      metrics: {
        width: 24,
        height: 24,
        left: 0,
        top: -5,
        // 对于 CJK 需要调整字符间距
        // advance: getCharAdvance(charCode)
        advance: isCJK(charCode) ? 24 : this.textMetricsCache[fontStack][char],
      },
    };
  }
}
