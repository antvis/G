import type { TextMetrics } from '../services/text';
import type { DisplayObjectConfig } from '../dom/interfaces';
import { Shape } from '../types';
import type { BaseStyleProps, ParsedBaseStyleProps } from '../types';
import { DisplayObject } from './DisplayObject';
import type { CSSUnitValue, CSSGlobalKeywords, CSSKeywordValue } from '../css';

export interface TextStyleProps extends BaseStyleProps {
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
  lineHeight?: number;
  letterSpacing?: number;
  miterLimit?: number;
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
  text: string;
  /** 设置文本内容的当前对齐方式 */
  textAlign?: CSSKeywordValue;
  /** 设置在绘制文本时使用的当前文本基线 */
  textBaseline?: CSSKeywordValue;
  /** 字体样式 */
  fontStyle?: CSSKeywordValue;
  /** 文本字体大小 */
  fontSize?: CSSUnitValue;
  /** 文本字体 */
  fontFamily?: string;
  /** 文本粗细 */
  fontWeight?: CSSKeywordValue;
  /** 字体变体 */
  fontVariant?: CSSKeywordValue;
  /** 文本行高 */
  lineHeight?: number;
  letterSpacing?: number;
  miterLimit?: number;
  whiteSpace?: 'pre';
  leading?: number;
  wordWrap?: boolean;
  wordWrapWidth?: number;
  // dropShadow?: boolean;
  // dropShadowDistance?: number;
  metrics?: TextMetrics;
  dx?: CSSUnitValue;
  dy?: CSSUnitValue;
}

/**
 * <text> @see https://developer.mozilla.org/en-US/docs/Web/API/SVGTextElement
 */
export class Text extends DisplayObject<TextStyleProps, ParsedTextStyleProps> {
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/SVGTextContentElement#constants
   */
  LENGTHADJUST_SPACING: number = 1;
  LENGTHADJUST_SPACINGANDGLYPHS: number = 2;
  LENGTHADJUST_UNKNOWN: number = 0;

  constructor({ style, ...rest }: DisplayObjectConfig<TextStyleProps> = {}) {
    super({
      type: Shape.TEXT,
      style: {
        text: '',
        fontSize: '',
        fontFamily: '',
        fontStyle: '',
        fontWeight: '',
        fontVariant: '',
        textAlign: '',
        textBaseline: '',
        textTransform: '',
        // dropShadow: false,
        // dropShadowAlpha: 1,
        // dropShadowAngle: Math.PI / 6,
        // dropShadowBlur: 0,
        // dropShadowColor: '#000',
        // dropShadowDistance: 5,
        fill: 'black',
        stroke: 'black',
        letterSpacing: 0,
        lineHeight: 0,
        lineWidth: 0,
        miterLimit: 10,
        whiteSpace: 'pre',
        wordWrap: false,
        wordWrapWidth: 0,
        leading: 0,
        dx: 0,
        dy: 0,
        ...style,
      },
      ...rest,
    });
  }

  lengthAdjust: SVGAnimatedEnumeration;
  textLength: SVGAnimatedLength;
  getCharNumAtPosition(point?: DOMPointInit): number {
    throw new Error('Method not implemented.');
  }

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/SVGTextContentElement
   */
  getComputedTextLength(): number {
    return this.parsedStyle.metrics?.maxLineWidth || 0;
  }

  getEndPositionOfChar(charnum: number): DOMPoint {
    throw new Error('Method not implemented.');
  }
  getExtentOfChar(charnum: number): DOMRect {
    throw new Error('Method not implemented.');
  }
  getNumberOfChars(): number {
    throw new Error('Method not implemented.');
  }
  getRotationOfChar(charnum: number): number {
    throw new Error('Method not implemented.');
  }
  getStartPositionOfChar(charnum: number): DOMPoint {
    throw new Error('Method not implemented.');
  }

  getSubStringLength(charnum: number, nchars: number): number {
    throw new Error('Method not implemented.');
  }

  selectSubString(charnum: number, nchars: number): void {
    throw new Error('Method not implemented.');
  }

  getLineBoundingRects() {
    return this.parsedStyle.metrics?.lineMetrics || [];
  }
}
