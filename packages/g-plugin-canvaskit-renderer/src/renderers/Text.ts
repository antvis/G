import { ContextService, CSSRGB, DisplayObject, ParsedTextStyleProps } from '@antv/g';
import { EmbindEnumEntity } from 'canvaskit-wasm';
import { inject, singleton } from 'mana-syringe';
import { FontLoader } from '../FontLoader';
import {
  CanvasKitContext,
  RendererContribution,
  RendererContributionContext,
  TextRendererContribution,
} from '../interfaces';

/**
 * One of the biggest features that CanvasKit offers over the HTML Canvas API is paragraph shaping.
 * To use text your applicatoin, supply a font file and use Promise.all to run your code when both CanvasKit and the font file are ready.
 *
 * @see https://skia.org/docs/user/modules/quickstart/#text-shaping
 * @see https://fiddle.skia.org/c/@Canvas_drawText
 *
 * Depend on volatile Google Fonts:
 * @see https://github.com/flutter/flutter/issues/85793
 *
 * CJK Fonts:
 * @see https://github.com/flutter/flutter/issues/77212
 * @see https://github.com/flutter/flutter/issues/53897
 *
 * Emoji:
 * @see https://github.com/flutter/flutter/issues/76248
 */
@singleton({
  token: TextRendererContribution,
})
export class TextRenderer implements RendererContribution {
  @inject(ContextService)
  private contextService: ContextService<CanvasKitContext>;

  @inject(FontLoader)
  private fontLoader: FontLoader;

  render(object: DisplayObject, context: RendererContributionContext) {
    const { CanvasKit } = this.contextService.getContext();
    const { canvas, strokePaint, shadowStrokePaint } = context;
    const {
      text,
      fontSize,
      fontWeight,
      fontStyle,
      lineWidth,
      textAlign,
      textBaseline,
      lineJoin,
      miterLimit = 0,
      letterSpacing = 0,
      stroke,
      fill,
      fillOpacity,
      strokeOpacity,
      opacity,
      metrics,
      wordWrap,
      wordWrapWidth,
      dx,
      dy,
    } = object.parsedStyle as ParsedTextStyleProps;

    const { font, lines, height, lineHeight, lineMetrics } = metrics;

    const TEXT_ALIGN_MAP: Record<CanvasTextAlign, EmbindEnumEntity> = {
      left: CanvasKit.TextAlign.Left,
      center: CanvasKit.TextAlign.Center,
      right: CanvasKit.TextAlign.Right,
      end: CanvasKit.TextAlign.End,
      start: CanvasKit.TextAlign.Start,
    };
    const TEXT_BASELINE_MAP: Record<CanvasTextBaseline, EmbindEnumEntity> = {
      alphabetic: CanvasKit.TextBaseline.Alphabetic,
      bottom: undefined,
      hanging: undefined,
      ideographic: CanvasKit.TextBaseline.Ideographic,
      middle: undefined,
      top: undefined,
    };

    const paraStyle = new CanvasKit.ParagraphStyle({
      textStyle: {
        // backgroundColor?: InputColor;
        color: CanvasKit.Color4f(
          Number((fill as CSSRGB).r) / 255,
          Number((fill as CSSRGB).g) / 255,
          Number((fill as CSSRGB).b) / 255,
          Number((fill as CSSRGB).alpha),
        ),
        // decoration?: number;
        // decorationColor?: InputColor;
        // decorationThickness?: number;
        // decorationStyle?: DecorationStyle;
        fontFamilies: ['sans-serif'],
        // fontFeatures?: TextFontFeatures[];
        fontSize: fontSize.value,
        // fontStyle: {
        //   weight: {
        //     value: Number(fontWeight.value),
        //   },
        //   // width?: FontWidth;
        //   // slant?: FontSlant;
        // },
        // foregroundColor?: InputColor;
        // heightMultiplier?: number;
        // halfLeading?: boolean;
        letterSpacing: letterSpacing,
        // locale?: string;
        // shadows?: TextShadow[];
        textBaseline: TEXT_BASELINE_MAP[textBaseline.value],
        // wordSpacing?: number;
      },
      textAlign: TEXT_ALIGN_MAP[textAlign.value],

      // disableHinting?: boolean;
      // ellipsis?: string;
      // heightMultiplier?: number;
      // maxLines?: number;
      // strutStyle?: StrutStyle;
      // textDirection?: TextDirection;
      // textHeightBehavior?: TextHeightBehavior;
    });

    const fontSrc = this.fontLoader.getTypefaceFontProvider('sans-serif');
    const builder = CanvasKit.ParagraphBuilder.MakeFromFontProvider(paraStyle, fontSrc);
    builder.addText(text);
    const paragraph = builder.build();

    if (wordWrap) {
      // width in pixels to use when wrapping text
      paragraph.layout(wordWrapWidth);
    } else {
      paragraph.layout(400);
    }
    canvas.drawParagraph(paragraph, 0, 0);

    paragraph.delete();
    builder.delete();
  }
}
