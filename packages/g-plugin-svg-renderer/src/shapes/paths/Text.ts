import { ParsedTextStyleProps } from '@antv/g';
import { detect } from 'detect-browser';
import { singleton } from 'mana-syringe';
import { ElementRenderer } from '.';

// @see https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/alignment-baseline
const BASELINE_MAP: Record<string, string> = {
  top: 'before-edge', // TODO: different with canvas' `top`
  middle: 'central',
  bottom: 'after-edge',
  alphabetic: 'alphabetic',
  ideographic: 'ideographic',
  hanging: 'hanging',
};

// for FireFox
// @see https://github.com/plouc/nivo/issues/164
const BASELINE_MAP_FOR_FIREFOX: Record<string, string> = {
  top: 'text-before-edge',
  middle: 'central',
  bottom: 'text-after-edge',
  alphabetic: 'alphabetic',
  ideographic: 'ideographic',
  hanging: 'hanging',
};

@singleton()
export class TextRenderer implements ElementRenderer<ParsedTextStyleProps> {
  dependencies = [
    'text',
    'font',
    'fontSize',
    'fontFamily',
    'fontStyle',
    'fontWeight',
    'fontVariant',
    'lineHeight',
    'letterSpacing',
    'wordWrap',
    'wordWrapWidth',
    'leading',
    'textBaseline',
    'textAlign',
    'textTransform',
    'whiteSpace',
    'dx',
    'dy',
  ];

  apply($el: SVGElement, parsedStyle: ParsedTextStyleProps) {
    const { textBaseline, lineWidth = 0, metrics, dx, dy } = parsedStyle;

    const browser = detect();
    if (browser && browser.name === 'firefox') {
      // compatible with FireFox browser, ref: https://github.com/antvis/g/issues/119
      $el.setAttribute(
        'dominant-baseline',
        BASELINE_MAP_FOR_FIREFOX[textBaseline!] || 'alphabetic',
      );
    } else {
      $el.setAttribute('dominant-baseline', BASELINE_MAP_FOR_FIREFOX[textBaseline!]);
      $el.setAttribute('alignment-baseline', BASELINE_MAP[textBaseline!]);
    }

    $el.setAttribute('paint-order', 'stroke');
    const { lines, lineHeight, height } = metrics;

    const lineNum = lines.length;

    $el.setAttribute('style', `transform:translate(${dx.value}${dx.unit}, ${dy.value}${dy.unit});`);

    if (lineNum === 1) {
      $el.innerHTML = lines[0];
      $el.setAttribute('dx', `${lineWidth / 2}`);
    } else {
      $el.innerHTML = lines
        .map((line: string, i: number) => {
          let dx = lineWidth / 2;
          let dy = 0;
          if (i === 0) {
            // TODO: handle other textBaseline values
            if (textBaseline === 'middle') {
              dy = lineHeight / 2 - height / 2;
            } else if (textBaseline === 'top' || textBaseline === 'hanging') {
              dy = 0;
            } else if (
              textBaseline === 'bottom' ||
              textBaseline === 'alphabetic' ||
              textBaseline === 'ideographic'
            ) {
              dy = -lineHeight * (lineNum - 1);
            }
          } else {
            dy = lineHeight;
          }
          return `<tspan x="0" dx="${dx}" dy="${dy}">${line}</tspan>`;
        })
        .join('');
    }
  }
}
