import { CanvasLike, GlobalRuntime } from '..';
import type { ParsedTextStyleProps } from '../display-objects';
import { Rectangle } from '../shapes';
import { toFontString } from '../utils';

export interface TextMetrics {
  font: string;
  width: number;
  height: number;
  lines: string[];
  lineWidths: number[];
  lineHeight: number;
  maxLineWidth: number;
  fontProperties: IFontMetrics;
  lineMetrics: Rectangle[];
}

interface IFontMetrics {
  ascent: number;
  descent: number;
  fontSize: number;
}
type CharacterWidthCache = Record<string, number>;

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

const LATIN_REGEX =
  /[a-zA-Z0-9\u00C0-\u00D6\u00D8-\u00f6\u00f8-\u00ff!"#$%&'()*+,-./:;]/;

// Line breaking rules in CJK (Kinsoku Shori)
// Refer from https://en.wikipedia.org/wiki/Line_breaking_rules_in_East_Asian_languages
const regexCannotStartZhCn =
  /[!%),.:;?\]}¢°·'""†‡›℃∶、。〃〆〕〗〞﹚﹜！＂％＇），．：；？！］｝～]/;
const regexCannotEndZhCn = /[$(£¥·'"〈《「『【〔〖〝﹙﹛＄（．［｛￡￥]/;
const regexCannotStartZhTw =
  /[!),.:;?\]}¢·–—'"•"、。〆〞〕〉》」︰︱︲︳﹐﹑﹒﹓﹔﹕﹖﹘﹚﹜！），．：；？︶︸︺︼︾﹀﹂﹗］｜｝､]/;
const regexCannotEndZhTw = /[([{£¥'"‵〈《「『〔〝︴﹙﹛（｛︵︷︹︻︽︿﹁﹃﹏]/;
const regexCannotStartJaJp =
  /[)\]｝〕〉》」』】〙〗〟'"｠»ヽヾーァィゥェォッャュョヮヵヶぁぃぅぇぉっゃゅょゎゕゖㇰㇱㇲㇳㇴㇵㇶㇷㇸㇹㇺㇻㇼㇽㇾㇿ々〻‐゠–〜?!‼⁇⁈⁉・、:;,。.]/;
const regexCannotEndJaJp = /[([｛〔〈《「『【〘〖〝'"｟«—...‥〳〴〵]/;
const regexCannotStartKoKr =
  /[!%),.:;?\]}¢°'"†‡℃〆〈《「『〕！％），．：；？］｝]/;
const regexCannotEndKoKr = /[$([{£¥'"々〇〉》」〔＄（［｛｠￥￦#]/;

const regexCannotStart = new RegExp(
  `${regexCannotStartZhCn.source}|${regexCannotStartZhTw.source}|${regexCannotStartJaJp.source}|${regexCannotStartKoKr.source}`,
);
const regexCannotEnd = new RegExp(
  `${regexCannotEndZhCn.source}|${regexCannotEndZhTw.source}|${regexCannotEndJaJp.source}|${regexCannotEndKoKr.source}`,
);

/**
 * Borrow from pixi/packages/text/src/TextMetrics.ts
 */
export class TextService {
  constructor(private runtime: GlobalRuntime) {}

  /**
   * font metrics cache
   */
  private fontMetricsCache: Record<string, IFontMetrics> = {};

  /**
   * Calculates the ascent, descent and fontSize of a given font-style.
   */
  measureFont(font: string, offscreenCanvas: CanvasLike): IFontMetrics {
    // as this method is used for preparing assets, don't recalculate things if we don't need to
    if (this.fontMetricsCache[font]) {
      return this.fontMetricsCache[font];
    }
    const properties: IFontMetrics = {
      ascent: 0,
      descent: 0,
      fontSize: 0,
    };

    const canvas =
      this.runtime.offscreenCanvasCreator.getOrCreateCanvas(offscreenCanvas);
    const context = this.runtime.offscreenCanvasCreator.getOrCreateContext(
      offscreenCanvas,
      {
        willReadFrequently: true,
      },
    );

    context.font = font;
    const metricsString =
      TEXT_METRICS.MetricsString + TEXT_METRICS.BaselineSymbol;
    const width = Math.ceil(context.measureText(metricsString).width);
    let baseline = Math.ceil(
      context.measureText(TEXT_METRICS.BaselineSymbol).width,
    );
    const height = TEXT_METRICS.HeightMultiplier * baseline;
    baseline = (baseline * TEXT_METRICS.BaselineMultiplier) | 0;
    // @ts-ignore
    canvas.width = width;
    // @ts-ignore
    canvas.height = height;
    context.fillStyle = '#f00';
    context.fillRect(0, 0, width, height);
    context.font = font;
    context.textBaseline = 'alphabetic';
    context.fillStyle = '#000';
    context.fillText(metricsString, 0, baseline);
    const imagedata = context.getImageData(0, 0, width || 1, height || 1).data;
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

    this.fontMetricsCache[font] = properties;
    return properties;
  }

  measureText(
    text: string,
    parsedStyle: ParsedTextStyleProps,
    offscreenCanvas: CanvasLike,
  ): TextMetrics {
    const {
      fontSize = 16,
      wordWrap = false,
      lineHeight: strokeHeight,
      lineWidth = 1,
      textBaseline = 'alphabetic',
      textAlign = 'start',
      letterSpacing = 0,
      textPath,
      textPathSide,
      textPathStartOffset,
      // dropShadow = 0,
      // dropShadowDistance = 0,
      leading = 0,
    } = parsedStyle;

    const font = toFontString(parsedStyle);

    const fontProperties = this.measureFont(font, offscreenCanvas);
    // fallback in case UA disallow canvas data extraction
    if (fontProperties.fontSize === 0) {
      fontProperties.fontSize = fontSize;
      fontProperties.ascent = fontSize;
    }

    const context =
      this.runtime.offscreenCanvasCreator.getOrCreateContext(offscreenCanvas);
    context.font = font;

    // no overflowing by default
    parsedStyle.isOverflowing = false;
    const outputText = wordWrap
      ? this.wordWrap(text, parsedStyle, offscreenCanvas)
      : text;

    const lines = outputText.split(/(?:\r\n|\r|\n)/);
    const lineWidths = new Array<number>(lines.length);
    let maxLineWidth = 0;

    // account for textPath
    if (textPath) {
      const totalPathLength = textPath.getTotalLength();

      // const startingPoint = textPath.getPoint(0);

      for (let i = 0; i < lines.length; i++) {
        let positionInPath: number;
        const width =
          context.measureText(lines[i]).width +
          (lines[i].length - 1) * letterSpacing;
        const reverse = textPathSide === 'right';

        // TODO: should we support textPathStartOffsetY?
        switch (textAlign) {
          case 'left':
          case 'start':
            positionInPath = reverse ? totalPathLength - width : 0;
            break;
          case 'center':
          case 'middle':
            positionInPath = (totalPathLength - width) / 2;
            break;
          case 'right':
          case 'end':
            positionInPath = reverse ? 0 : totalPathLength - width;
            break;
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        positionInPath += textPathStartOffset * (reverse ? -1 : 1);
        // for (
        //   let i = reverse ? lines[0].length - 1 : 0;
        //   reverse ? i >= 0 : i < lines[0].length;
        //   reverse ? i-- : i++
        // ) {
        //   graphemeInfo = lineBounds[i];
        //   if (positionInPath > totalPathLength) {
        //     positionInPath %= totalPathLength;
        //   } else if (positionInPath < 0) {
        //     positionInPath += totalPathLength;
        //   }
        //   // it would probably much faster to send all the grapheme position for a line
        //   // and calculate path position/angle at once.
        //   this.setGraphemeOnPath(
        //     positionInPath,
        //     graphemeInfo,
        //     startingPoint
        //   );
        //   positionInPath += graphemeInfo.kernedWidth;
        // }
      }
    } else {
      for (let i = 0; i < lines.length; i++) {
        // char width + letterSpacing
        const lineWidth =
          context.measureText(lines[i]).width +
          (lines[i].length - 1) * letterSpacing;
        lineWidths[i] = lineWidth;
        maxLineWidth = Math.max(maxLineWidth, lineWidth);
      }
      const width = maxLineWidth + lineWidth;

      // if (dropShadow) {
      //   width += dropShadowDistance;
      // }
      let lineHeight = strokeHeight || fontProperties.fontSize + lineWidth;
      const height =
        Math.max(lineHeight, fontProperties.fontSize + lineWidth) +
        (lines.length - 1) * (lineHeight + leading);
      // if (dropShadow) {
      //   height += dropShadowDistance;
      // }
      lineHeight += leading;

      // handle vertical text baseline
      let offsetY = 0;
      if (textBaseline === 'middle') {
        offsetY = -height / 2;
      } else if (
        textBaseline === 'bottom' ||
        textBaseline === 'alphabetic' ||
        textBaseline === 'ideographic'
      ) {
        offsetY = -height;
      } else if (textBaseline === 'top' || textBaseline === 'hanging') {
        offsetY = 0;
      }

      return {
        font,
        width,
        height,
        lines,
        lineWidths,
        lineHeight,
        maxLineWidth,
        fontProperties,
        lineMetrics: lineWidths.map((width, i) => {
          let offsetX = 0;
          // handle horizontal text align
          if (textAlign === 'center' || textAlign === 'middle') {
            offsetX -= width / 2;
          } else if (textAlign === 'right' || textAlign === 'end') {
            offsetX -= width;
          }

          return new Rectangle(
            offsetX - lineWidth / 2,
            offsetY + i * lineHeight,
            width + lineWidth,
            lineHeight,
          );
        }),
      };
    }
  }

  private wordWrap(
    text: string,
    parsedStyle: ParsedTextStyleProps,
    offscreenCanvas: CanvasLike,
  ): string {
    const self = this;
    const {
      wordWrapWidth = 0,
      letterSpacing = 0,
      maxLines = Infinity,
      textOverflow,
    } = parsedStyle;
    const context =
      this.runtime.offscreenCanvasCreator.getOrCreateContext(offscreenCanvas);
    const maxWidth = wordWrapWidth + letterSpacing;

    let ellipsis = '';
    if (textOverflow === 'ellipsis') {
      ellipsis = '...';
    } else if (textOverflow && textOverflow !== 'clip') {
      ellipsis = textOverflow;
    }

    const chars = Array.from(text);
    let lines: string[] = [];
    let currentLineIndex = 0;
    let currentLineWidth = 0;
    // @see https://github.com/antvis/G/issues/1932
    let prevLineLastCharIndex = -1;

    const cache: { [key in string]: number } = {};
    const calcWidth = (txt: string): number => {
      return this.getFromCache(
        txt,
        letterSpacing,
        cache,
        context as CanvasRenderingContext2D,
      );
    };
    const ellipsisWidth = calcWidth(ellipsis);

    /**
     * Find text fragments that will take up as much of the given line width as possible when rendered.
     *
     * @see https://github.com/antvis/G/issues/1833
     *
     * @param lineTxt - Current line of text
     * @param txtLastCharIndex - The index of the last character of the current line in the entire text
     * @param txtStartCharIndex - The index of the start character of the current line in the entire text
     */
    function findCharIndexClosestWidthThreshold(
      lineTxt: string,
      txtLastCharIndex: number,
      txtStartCharIndex: number,
      widthThreshold: number,
    ) {
      while (
        calcWidth(lineTxt) < widthThreshold &&
        txtLastCharIndex < chars.length - 1
      ) {
        if (self.isNewline(chars[txtLastCharIndex + 1])) {
          break;
        }
        txtLastCharIndex += 1;
        lineTxt += chars[txtLastCharIndex];
      }

      while (
        calcWidth(lineTxt) > widthThreshold &&
        // @see https://github.com/antvis/G/issues/1932
        txtLastCharIndex >= txtStartCharIndex
      ) {
        txtLastCharIndex -= 1;
        lineTxt = lineTxt.slice(0, -1);
      }

      return {
        lineTxt,
        txtLastCharIndex,
      };
    }

    function appendEllipsis(lineIndex: number, textCharIndex: number) {
      // If there is not enough space to display the string itself, it is clipped.
      // @see https://developer.mozilla.org/en-US/docs/Web/CSS/text-overflow#values
      if (ellipsisWidth <= 0 || ellipsisWidth > maxWidth) {
        return;
      }

      if (!lines[lineIndex]) {
        lines[lineIndex] = ellipsis;

        return;
      }

      const result = findCharIndexClosestWidthThreshold(
        lines[lineIndex],
        textCharIndex,
        prevLineLastCharIndex + 1,
        maxWidth - ellipsisWidth,
      );

      lines[lineIndex] = result.lineTxt + ellipsis;
    }

    for (let i = 0; i < chars.length; i++) {
      let char = chars[i];
      let prevChar = chars[i - 1];
      let nextChar = chars[i + 1];
      let charWidth = calcWidth(char);

      if (this.isNewline(char)) {
        // exceed maxLines, break immediately
        if (currentLineIndex + 1 >= maxLines) {
          parsedStyle.isOverflowing = true;

          if (i < chars.length - 1) {
            appendEllipsis(currentLineIndex, i - 1);
          }

          break;
        }

        prevLineLastCharIndex = i - 1;
        currentLineIndex += 1;
        currentLineWidth = 0;
        lines[currentLineIndex] = '';

        continue;
      }

      if (currentLineWidth > 0 && currentLineWidth + charWidth > maxWidth) {
        const result = findCharIndexClosestWidthThreshold(
          lines[currentLineIndex],
          i - 1,
          prevLineLastCharIndex + 1,
          maxWidth,
        );
        if (result.txtLastCharIndex !== i - 1) {
          lines[currentLineIndex] = result.lineTxt;

          if (result.txtLastCharIndex === chars.length - 1) {
            break;
          }

          i = result.txtLastCharIndex + 1;
          char = chars[i];
          prevChar = chars[i - 1];
          nextChar = chars[i + 1];
          charWidth = calcWidth(char);
        }

        if (currentLineIndex + 1 >= maxLines) {
          parsedStyle.isOverflowing = true;

          appendEllipsis(currentLineIndex, i - 1);

          break;
        }

        prevLineLastCharIndex = i - 1;
        currentLineIndex += 1;
        currentLineWidth = 0;
        lines[currentLineIndex] = '';

        if (this.isBreakingSpace(char)) {
          continue;
        }

        if (!this.canBreakInLastChar(char)) {
          lines = this.trimToBreakable(lines);
          currentLineWidth = this.sumTextWidthByCache(
            lines[currentLineIndex] || '',
            calcWidth,
          );
        }

        if (this.shouldBreakByKinsokuShorui(char, nextChar)) {
          lines = this.trimByKinsokuShorui(lines);
          currentLineWidth += calcWidth(prevChar || '');
        }
      }

      currentLineWidth += charWidth;
      lines[currentLineIndex] = (lines[currentLineIndex] || '') + char;
    }

    return lines.join('\n');
  }

  private isBreakingSpace(char: string): boolean {
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

  private shouldBreakByKinsokuShorui = (
    char: string | undefined,
    nextChar: string,
  ): boolean => {
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

  private sumTextWidthByCache(
    text: string,
    calcWidthWithCache: (txt: string) => number,
  ) {
    return text.split('').reduce((sum: number, c) => {
      return sum + calcWidthWithCache(c);
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
    context: CanvasRenderingContext2D,
  ): number {
    let width = cache[key];
    if (typeof width !== 'number') {
      const spacing = key.length * letterSpacing;
      const metrics = context.measureText(key);

      width = metrics.width + spacing;
      cache[key] = width;
    }
    return width;
  }
}
