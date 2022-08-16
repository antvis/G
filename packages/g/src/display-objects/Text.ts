import type { CSSGlobalKeywords } from '../css';
import type { DisplayObjectConfig } from '../dom/interfaces';
import type { TextMetrics } from '../services';
import type { BaseStyleProps, ParsedBaseStyleProps } from '../types';
import { Shape } from '../types';
import { DisplayObject } from './DisplayObject';

export interface TextStyleProps extends BaseStyleProps {
  x?: number | string;
  y?: number | string;
  text: string;
  /** 设置文本内容的当前对齐方式 */
  textAlign?: CSSGlobalKeywords | 'start' | 'center' | 'end' | 'left' | 'right';
  /** 设置在绘制文本时使用的当前文本基线 */
  textBaseline?:
    | CSSGlobalKeywords
    | 'top'
    | 'hanging'
    | 'middle'
    | 'alphabetic'
    | 'ideographic'
    | 'bottom';
  /** 字体样式 */
  fontStyle?: CSSGlobalKeywords | 'normal' | 'italic' | 'oblique';
  /** 文本字体大小 */
  fontSize?: number | string;
  /** 文本字体 */
  fontFamily?: string;
  /** 文本粗细 */
  fontWeight?: CSSGlobalKeywords | 'normal' | 'bold' | 'bolder' | 'lighter' | number;
  /** 字体变体 */
  fontVariant?: CSSGlobalKeywords | 'normal' | 'small-caps' | string;
  /** 文本行高 */
  lineHeight?: number | string;
  letterSpacing?: number | string;
  whiteSpace?: 'pre';
  leading?: number;
  wordWrap?: boolean;
  wordWrapWidth?: number;
  // dropShadow?: boolean;
  // dropShadowDistance?: number;
  dx?: number | string;
  dy?: number | string;
}
export interface ParsedTextStyleProps extends ParsedBaseStyleProps {
  x: number;
  y: number;
  text: string;
  textAlign?: 'start' | 'center' | 'end' | 'left' | 'right';
  /** 设置在绘制文本时使用的当前文本基线 */
  textBaseline?: 'top' | 'hanging' | 'middle' | 'alphabetic' | 'ideographic' | 'bottom';
  /** 字体样式 */
  fontStyle?: 'normal' | 'italic' | 'oblique';
  /** 文本字体大小 */
  fontSize?: number;
  /** 文本字体 */
  fontFamily?: string;
  /** 文本粗细 */
  fontWeight?: 'normal' | 'bold' | 'bolder' | 'lighter' | number;
  /** 字体变体 */
  fontVariant?: 'normal' | 'small-caps' | string;
  /** 文本行高 */
  lineHeight?: number;
  letterSpacing?: number;
  whiteSpace?: 'pre';
  leading?: number;
  wordWrap?: boolean;
  wordWrapWidth?: number;
  // dropShadow?: boolean;
  // dropShadowDistance?: number;
  metrics?: TextMetrics;
  dx?: number;
  dy?: number;
}

/**
 * <text> @see https://developer.mozilla.org/en-US/docs/Web/API/SVGTextElement
 */
export class Text extends DisplayObject<TextStyleProps, ParsedTextStyleProps> {
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/SVGTextContentElement#constants
   */
  // LENGTHADJUST_SPACING: number = 1;
  // LENGTHADJUST_SPACINGANDGLYPHS: number = 2;
  // LENGTHADJUST_UNKNOWN: number = 0;

  constructor({ style, ...rest }: DisplayObjectConfig<TextStyleProps> = {}) {
    super({
      type: Shape.TEXT,
      style: {
        x: '',
        y: '',
        text: '',
        fontSize: '',
        fontFamily: '',
        fontStyle: '',
        fontWeight: '',
        fontVariant: '',
        textAlign: '',
        textBaseline: '',
        textTransform: '',
        fill: 'black',
        letterSpacing: '',
        lineHeight: '',
        miterLimit: '',
        whiteSpace: 'pre',
        wordWrap: false,
        wordWrapWidth: 0,
        leading: 0,
        dx: '',
        dy: '',
        ...style,
      },
      ...rest,
    });
  }

  // lengthAdjust: SVGAnimatedEnumeration;
  // textLength: SVGAnimatedLength;
  // getCharNumAtPosition(point?: DOMPointInit): number {
  //   throw new Error('Method not implemented.');
  // }

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/SVGTextContentElement
   */
  getComputedTextLength(): number {
    return this.parsedStyle.metrics?.maxLineWidth || 0;
  }

  // getEndPositionOfChar(charnum: number): DOMPoint {
  //   throw new Error('Method not implemented.');
  // }
  // getExtentOfChar(charnum: number): DOMRect {
  //   throw new Error('Method not implemented.');
  // }
  // getNumberOfChars(): number {
  //   throw new Error('Method not implemented.');
  // }
  // getRotationOfChar(charnum: number): number {
  //   throw new Error('Method not implemented.');
  // }
  // getStartPositionOfChar(charnum: number): DOMPoint {
  //   throw new Error('Method not implemented.');
  // }

  // getSubStringLength(charnum: number, nchars: number): number {
  //   throw new Error('Method not implemented.');
  // }

  // selectSubString(charnum: number, nchars: number): void {
  //   throw new Error('Method not implemented.');
  // }

  getLineBoundingRects() {
    return this.parsedStyle.metrics?.lineMetrics || [];
  }
}
