import { Entity } from '@antv/g-ecs';
import { inject, injectable, named } from 'inversify';
import { ShapeAttrs } from '../../types';
import { toFontString } from '../../utils/text';
import { OffscreenCanvasCreator } from './OffscreenCanvasCreator';

interface IFontMetrics {
  ascent: number;
  descent: number;
  fontSize: number;
}
type CharacterWidthCache = { [key: string]: number };

const TEXT_METRICS = {
  MetricsString: '|ÉqÅ',
  BaselineSymbol: 'M',
  BaselineMultiplier: 1.4,
  HeightMultiplier: 2,
  Newlines: [
    0x000a, // line feed
    0x000d, // carriage return
  ],
  BreakingSpaces: [
    0x0009, // character tabulation
    0x0020, // space
    0x2000, // en quad
    0x2001, // em quad
    0x2002, // en space
    0x2003, // em space
    0x2004, // three-per-em space
    0x2005, // four-per-em space
    0x2006, // six-per-em space
    0x2008, // punctuation space
    0x2009, // thin space
    0x200a, // hair space
    0x205f, // medium mathematical space
    0x3000, // ideographic space
  ],
};

const LATIN_REGEX = /[a-zA-Z0-9\u00C0-\u00D6\u00D8-\u00f6\u00f8-\u00ff!"#$%&'()*+,-./:;]/;

// Line breaking rules in CJK (Kinsoku Shori)
// Refer from https://en.wikipedia.org/wiki/Line_breaking_rules_in_East_Asian_languages
const regexCannotStartZhCn = /[!%),.:;?\]}¢°·'""†‡›℃∶、。〃〆〕〗〞﹚﹜！＂％＇），．：；？！］｝～]/;
const regexCannotEndZhCn = /[$(£¥·'"〈《「『【〔〖〝﹙﹛＄（．［｛￡￥]/;
const regexCannotStartZhTw =
  /[!),.:;?\]}¢·–—'"•"、。〆〞〕〉》」︰︱︲︳﹐﹑﹒﹓﹔﹕﹖﹘﹚﹜！），．：；？︶︸︺︼︾﹀﹂﹗］｜｝､]/;
const regexCannotEndZhTw = /[([{£¥'"‵〈《「『〔〝︴﹙﹛（｛︵︷︹︻︽︿﹁﹃﹏]/;
const regexCannotStartJaJp =
  /[)\]｝〕〉》」』】〙〗〟'"｠»ヽヾーァィゥェォッャュョヮヵヶぁぃぅぇぉっゃゅょゎゕゖㇰㇱㇲㇳㇴㇵㇶㇷㇸㇹㇺㇻㇼㇽㇾㇿ々〻‐゠–〜?!‼⁇⁈⁉・、:;,。.]/;
const regexCannotEndJaJp = /[([｛〔〈《「『【〘〖〝'"｟«—...‥〳〴〵]/;
const regexCannotStartKoKr = /[!%),.:;?\]}¢°'"†‡℃〆〈《「『〕！％），．：；？］｝]/;
const regexCannotEndKoKr = /[$([{£¥'"々〇〉》」〔＄（［｛｠￥￦#]/;

const regexCannotStart = new RegExp(
  `${regexCannotStartZhCn.source}|${regexCannotStartZhTw.source}|${regexCannotStartJaJp.source}|${regexCannotStartKoKr.source}`
);
const regexCannotEnd = new RegExp(
  `${regexCannotEndZhCn.source}|${regexCannotEndZhTw.source}|${regexCannotEndJaJp.source}|${regexCannotEndKoKr.source}`
);

@injectable()
export class TextService {
  private cache: Record<string, IFontMetrics> = {};

  @inject(OffscreenCanvasCreator)
  private offscreenCanvas: OffscreenCanvasCreator;

  measureFont(font: string): IFontMetrics {
    // as this method is used for preparing assets, don't recalculate things if we don't need to
    if (this.cache[font]) {
      return this.cache[font];
    }
    const properties: IFontMetrics = {
      ascent: 0,
      descent: 0,
      fontSize: 0,
    };

    const canvas = this.offscreenCanvas.getOrCreateCanvas();
    const context = this.offscreenCanvas.getOrCreateContext();

    context.font = font;
    const metricsString = TEXT_METRICS.MetricsString + TEXT_METRICS.BaselineSymbol;
    const width = Math.ceil(context.measureText(metricsString).width);
    let baseline = Math.ceil(context.measureText(TEXT_METRICS.BaselineSymbol).width);
    const height = TEXT_METRICS.HeightMultiplier * baseline;
    baseline = (baseline * TEXT_METRICS.BaselineMultiplier) | 0;
    canvas.width = width;
    canvas.height = height;
    context.fillStyle = '#f00';
    context.fillRect(0, 0, width, height);
    context.font = font;
    context.textBaseline = 'alphabetic';
    context.fillStyle = '#000';
    context.fillText(metricsString, 0, baseline);
    const imagedata = context.getImageData(0, 0, width, height).data;
    const pixels = imagedata.length;
    const line = width * 4;
    let i = 0;
    let idx = 0;
    let stop = false;
    // ascent. scan from top to bottom until we find a non red pixel
    for (i = 0; i < baseline; ++i) {
      for (let j = 0; j < line; j += 4) {
        if (imagedata[idx + j] !== 255) {
          stop = true;
          break;
        }
      }
      if (!stop) {
        idx += line;
      } else {
        break;
      }
    }
    properties.ascent = baseline - i;
    idx = pixels - line;
    stop = false;
    // descent. scan from bottom to top until we find a non red pixel
    for (i = height; i > baseline; --i) {
      for (let j = 0; j < line; j += 4) {
        if (imagedata[idx + j] !== 255) {
          stop = true;
          break;
        }
      }
      if (!stop) {
        idx -= line;
      } else {
        break;
      }
    }
    properties.descent = i - baseline;
    properties.fontSize = properties.ascent + properties.descent;

    this.cache[font] = properties;
    return properties;
  }

  measureText(text: string, attributes: ShapeAttrs) {
    const {
      fontSize = 0,
      wordWrap,
      lineHeight: strokeHeight = 0,
      lineWidth: strokeThickness = 0,
      letterSpacing = 0,
      dropShadow,
      dropShadowDistance = 0,
      leading = 0,
    } = attributes;

    const font = toFontString(attributes);
    const fontProperties = this.measureFont(font);
    // fallback in case UA disallow canvas data extraction
    // (toDataURI, getImageData functions)
    if (fontProperties.fontSize === 0) {
      fontProperties.fontSize = fontSize;
      fontProperties.ascent = fontSize;
    }

    const context = this.offscreenCanvas.getOrCreateContext();
    context.font = font;
    const outputText = wordWrap ? this.wordWrap(text, attributes) : text;

    const lines = outputText.split(/(?:\r\n|\r|\n)/);
    const lineWidths = new Array<number>(lines.length);
    let maxLineWidth = 0;
    for (let i = 0; i < lines.length; i++) {
      const lineWidth = context.measureText(lines[i]).width + (lines[i].length - 1) * letterSpacing;
      lineWidths[i] = lineWidth;
      maxLineWidth = Math.max(maxLineWidth, lineWidth);
    }
    let width = maxLineWidth + strokeThickness;
    if (dropShadow) {
      width += dropShadowDistance;
    }
    const lineHeight = strokeHeight || fontProperties.fontSize + strokeThickness;
    let height =
      Math.max(lineHeight, fontProperties.fontSize + strokeThickness) + (lines.length - 1) * (lineHeight + leading);
    if (dropShadow) {
      height += dropShadowDistance;
    }

    return {
      font,
      width,
      height,
      lines,
      lineWidths,
      lineHeight: lineHeight + leading,
      maxLineWidth,
      fontProperties,
    };
  }

  private wordWrap(text: string, { wordWrapWidth, letterSpacing }: ShapeAttrs): string {
    const context = this.offscreenCanvas.getOrCreateContext();
    const maxWidth = wordWrapWidth + letterSpacing;

    let lines: string[] = [];
    let currentIndex = 0;
    let currentWidth = 0;

    const cache: { [key in string]: number } = {};
    const calcWidth = (char: string): number => {
      return this.getFromCache(char, letterSpacing, cache, context);
    };

    Array.from(text).forEach((char: string, i: number) => {
      const prevChar = text[i - 1];
      const nextChar = text[i + 1];
      const width = calcWidth(char);

      if (this.isNewline(char)) {
        currentIndex++;
        currentWidth = 0;
        lines[currentIndex] = '';
        return;
      }

      if (currentWidth > 0 && currentWidth + width > maxWidth) {
        currentIndex++;
        currentWidth = 0;
        lines[currentIndex] = '';

        if (this.isBreakingSpace(char)) {
          return;
        }

        if (!this.canBreakInLastChar(char)) {
          lines = this.trimToBreakable(lines);
          currentWidth = this.sumTextWidthByCache(lines[currentIndex] || '', cache);
        }

        if (this.shouldBreakByKinsokuShorui(char, nextChar)) {
          lines = this.trimByKinsokuShorui(lines);
          currentWidth += calcWidth(prevChar || '');
        }
      }

      currentWidth += width;
      lines[currentIndex] = (lines[currentIndex] || '') + char;
    });
    return lines.join('\n');
  }

  private isBreakingSpace(char: string, _nextChar?: string): boolean {
    if (typeof char !== 'string') {
      return false;
    }
    return TEXT_METRICS.BreakingSpaces.indexOf(char.charCodeAt(0)) >= 0;
  }

  private isNewline(char: string): boolean {
    if (typeof char !== 'string') {
      return false;
    }
    return TEXT_METRICS.Newlines.indexOf(char.charCodeAt(0)) >= 0;
  }

  private trimToBreakable(prev: string[]): string[] {
    const next = [...prev];
    const prevLine = next[next.length - 2];

    const index = this.findBreakableIndex(prevLine);
    if (index === -1 || !prevLine) return next;

    const trimmedChar = prevLine.slice(index, index + 1);
    const isTrimmedWithSpace = this.isBreakingSpace(trimmedChar);

    const trimFrom = index + 1;
    const trimTo = index + (isTrimmedWithSpace ? 0 : 1);
    next[next.length - 1] += prevLine.slice(trimFrom, prevLine.length);
    next[next.length - 2] = prevLine.slice(0, trimTo);

    return next;
  }

  private shouldBreakByKinsokuShorui = (char: string | undefined, nextChar: string): boolean => {
    if (this.isBreakingSpace(nextChar)) return false;

    if (char) {
      // Line breaking rules in CJK (Kinsoku Shori)
      if (regexCannotEnd.exec(nextChar) || regexCannotStart.exec(char)) {
        return true;
      }
    }
    return false;
  };

  private trimByKinsokuShorui = (prev: string[]): string[] => {
    const next = [...prev];
    const prevLine = next[next.length - 2];
    if (!prevLine) {
      return prev;
    }

    const lastChar = prevLine[prevLine.length - 1];

    next[next.length - 2] = prevLine.slice(0, -1);
    next[next.length - 1] = lastChar + next[next.length - 1];
    return next;
  };

  private canBreakInLastChar(char: string | undefined): boolean {
    if (char && LATIN_REGEX.test(char)) return false;
    return true;
  }

  private sumTextWidthByCache(text: string, cache: { [key in string]: number }) {
    return text.split('').reduce((sum: number, c) => {
      if (!cache[c]) throw Error('cannot count the word without cache');
      return sum + cache[c];
    }, 0);
  }

  private findBreakableIndex(line: string): number {
    for (let i = line.length - 1; i >= 0; i--) {
      if (!LATIN_REGEX.test(line[i])) return i;
    }
    return -1;
  }

  private getFromCache(
    key: string,
    letterSpacing: number,
    cache: CharacterWidthCache,
    context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D
  ): number {
    let width = cache[key];
    if (typeof width !== 'number') {
      const spacing = key.length * letterSpacing;
      width = context.measureText(key).width + spacing;
      cache[key] = width;
    }
    return width;
  }
}
