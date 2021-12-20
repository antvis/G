import TinySDF from '@mapbox/tiny-sdf';
import { injectable } from 'mana-syringe';
import { Device, Format, makeTextureDescriptor2D, Texture } from '../../platform';
import { AlphaImage, StyleGlyph } from './AlphaImage';
import GlyphAtlas from './GlyphAtlas';

export type PositionedGlyph = {
  glyph: number; // charCode
  x: number;
  y: number;
  scale: number; // 根据缩放等级计算的缩放比例
  fontStack: string;
};

export const BASE_FONT_WIDTH = 24;
export const BASE_FONT_BUFFER = 3;

const fontsize = BASE_FONT_WIDTH; // Font size in pixels
const buffer = BASE_FONT_BUFFER; // Whitespace buffer around a glyph in pixels
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

/**
 * TODO: use one atlas for all fontstacks, each fontstack has one texture now
 */
@injectable()
export class GlyphManager {
  private sdfGeneratorCache: {
    [fontStack: string]: TinySDF;
  } = {};

  private textMetricsCache: {
    [fontStack: string]: {
      [char: string]: number;
    };
  } = {};

  private glyphAtlas: GlyphAtlas;
  private glyphMap: { [key: string]: { [key: number]: StyleGlyph } } = {};
  private glyphAtlasTexture: Texture;

  getMap() {
    return this.glyphMap;
  }

  getAtlas() {
    return this.glyphAtlas;
  }

  getAtlasTexture() {
    return this.glyphAtlasTexture;
  }

  layout(
    lines: string[],
    fontStack: string,
    lineHeight: number,
    textAlign: 'start' | 'center' | 'end' | 'left' | 'right',
    letterSpacing: number,
    offsetY: number,
  ): PositionedGlyph[] {
    const positionedGlyphs: PositionedGlyph[] = [];
    const yOffset = offsetY;

    let x = 0;
    let y = yOffset;

    const justify =
      textAlign === 'right' || textAlign === 'end'
        ? 1
        : textAlign === 'left' || textAlign === 'start'
        ? 0
        : 0.5;

    lines.forEach((line) => {
      let lineStartIndex = positionedGlyphs.length;
      Array.from(line).forEach((char) => {
        // fontStack
        const positions = this.glyphMap[fontStack];
        const charCode = char.charCodeAt(0);
        const glyph = positions && positions[charCode];

        if (glyph) {
          positionedGlyphs.push({
            glyph: charCode,
            x,
            y,
            scale: 1,
            fontStack,
          });
          x += glyph.metrics.advance + letterSpacing;
        }
      });

      const lineWidth = x - letterSpacing;
      for (let i = lineStartIndex; i < positionedGlyphs.length; i++) {
        positionedGlyphs[i].x = positionedGlyphs[i].x - justify * lineWidth;
      }

      x = 0;
      y += lineHeight;
    });

    return positionedGlyphs;
  }

  generateAtlas(
    fontStack: string = '',
    fontFamily: string,
    fontWeight: 'normal' | 'bold' | 'bolder' | 'lighter' | number,
    text: string,
    device: Device,
  ) {
    let newChars: string[] = [];
    if (!this.glyphMap[fontStack]) {
      newChars = getDefaultCharacterSet();
    }

    const existedChars = Object.keys(this.glyphMap[fontStack] || {});
    Array.from(new Set(text.split(''))).forEach((char) => {
      if (existedChars.indexOf(char.charCodeAt(0).toString()) === -1) {
        newChars.push(char);
      }
    });

    if (newChars.length) {
      const glyphMap = newChars
        .map((char) => {
          return this.generateSDF(fontStack, fontFamily, fontWeight.toString(), char);
        })
        .reduce((prev, cur) => {
          // @ts-ignore
          prev[cur.id] = cur;
          return prev;
        }, {}) as StyleGlyph;

      this.glyphMap[fontStack] = {
        ...this.glyphMap[fontStack],
        ...glyphMap,
      };
      this.glyphAtlas = new GlyphAtlas(this.glyphMap);
      const { width: atlasWidth, height: atlasHeight, data } = this.glyphAtlas.image;

      if (this.glyphAtlasTexture) {
        this.glyphAtlasTexture.destroy();
      }

      this.glyphAtlasTexture = device.createTexture({
        ...makeTextureDescriptor2D(Format.ALPHA, atlasWidth, atlasHeight, 1),
        immutable: false,
      });
      this.glyphAtlasTexture.setImageData([data], 0);
    }
  }

  private generateSDF(
    fontStack: string = '',
    fontFamily: string,
    fontWeight: string,
    char: string,
  ): StyleGlyph {
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
      bitmap: new AlphaImage(
        {
          width: BASE_FONT_BUFFER * 2 + BASE_FONT_WIDTH,
          height: BASE_FONT_BUFFER * 2 + BASE_FONT_WIDTH,
        },
        sdfGenerator.draw(char),
      ),
      metrics: {
        width: BASE_FONT_WIDTH,
        height: BASE_FONT_WIDTH,
        left: 0,
        top: -2,
        advance: isCJK(charCode) ? BASE_FONT_WIDTH : this.textMetricsCache[fontStack][char],
      },
    };
  }
}
