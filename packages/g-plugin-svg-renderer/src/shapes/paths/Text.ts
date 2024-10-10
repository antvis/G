import type { GlobalRuntime, ParsedTextStyleProps, Text } from '@antv/g-lite';
import { TEXT_PATH_PREFIX } from '../../SVGRendererPlugin';
import { createSVGElement } from '../../utils/dom';
import { convertHTML } from '../../utils/format';

// @see https://github.com/plouc/nivo/issues/164
const BASELINE_MAP: Record<string, string> = {
  top: 'hanging', // Use hanging here.
  middle: 'central',
  bottom: 'text-after-edge', // FIXME: It is not a standard property.
  alphabetic: 'alphabetic',
  ideographic: 'ideographic',
  hanging: 'hanging',
};

export function updateTextElementAttribute(
  $el: SVGElement,
  parsedStyle: ParsedTextStyleProps,
  text: Text,
  runtime: GlobalRuntime,
) {
  // Trigger text geometry calculation.
  text.getBounds();
  const {
    lineWidth = 1,
    x = 0,
    y = 0,
    dx = 0,
    dy = 0,
    textPath,
    textPathSide = 'left',
    textPathStartOffset = 0,
    textDecorationLine = '',
    textDecorationColor = '',
    textDecorationStyle = '',
    metrics,
  } = parsedStyle;
  let { textBaseline = 'alphabetic' } = parsedStyle;

  if (textBaseline === 'alphabetic') {
    textBaseline = 'bottom';
  }

  $el.setAttribute('dominant-baseline', BASELINE_MAP[textBaseline]);

  $el.setAttribute('paint-order', 'stroke');

  const { lines, lineHeight, height } = metrics;

  const lineNum = lines.length;

  let styleCSSText = '';
  if (dx !== 0 || dy !== 0) {
    styleCSSText += `transform:translate(${dx}px, ${dy}px);`;
  }
  if (textDecorationLine && textDecorationLine !== 'none') {
    // use CSS text-decoration since the implementation in SVG is not good enough
    styleCSSText += `text-decoration:${textDecorationLine} ${textDecorationStyle} ${textDecorationColor};`;
  }
  if (styleCSSText) {
    $el.setAttribute('style', styleCSSText);
  }
  if (x !== 0) {
    $el.setAttribute('x', `${x}`);
  }
  if (y !== 0) {
    $el.setAttribute('y', `${y}`);
  }

  if (lineNum === 1) {
    const textContent = convertHTML(lines[0]);
    $el.setAttribute('dx', `${lineWidth / 2}`);

    // Since `text-after-edge` is not a standard property value, we use `dy` instead.
    if (textBaseline === 'bottom' || textBaseline === 'top') {
      $el.setAttribute('dominant-baseline', BASELINE_MAP.middle);
      $el.setAttribute(
        'dy',
        textBaseline === 'bottom' ? `-${height / 2}px` : `${height / 2}px`,
      );
    }

    // <textPath> only support one line
    // @see https://developer.mozilla.org/en-US/docs/Web/SVG/Element/textPath
    if (textPath) {
      // clear existed text content first
      $el.innerHTML = '';

      // append <textPath href="#MyPath">text</textPath>
      const $textPath = createSVGElement('textPath', $el.ownerDocument);
      $textPath.setAttribute('href', `#${TEXT_PATH_PREFIX + textPath.entity}`);
      if (textPathSide !== 'left') {
        $textPath.setAttribute('side', textPathSide);
      }
      if (textPathStartOffset !== 0) {
        $textPath.setAttribute('startOffset', `${textPathStartOffset}`);
      }
      $textPath.innerHTML = textContent;
      $el.appendChild($textPath);
    } else {
      $el.innerHTML = textContent;
    }
  } else {
    $el.innerHTML = lines
      .map((line: string, i: number) => {
        const dx = lineWidth / 2;
        let dy = 0;
        if (i === 0) {
          // TODO: handle other textBaseline values
          if (textBaseline === 'middle') {
            dy = lineHeight / 2 - height / 2;
          } else if (textBaseline === 'top' || textBaseline === 'hanging') {
            dy = 0;
          } else if (
            textBaseline === 'bottom' ||
            textBaseline === 'ideographic'
          ) {
            dy = -lineHeight * (lineNum - 1);
          }
        } else {
          dy = lineHeight;
        }
        return `<tspan x=${x} dx="${dx}" dy="${dy}">${convertHTML(
          line,
        )}</tspan>`;
      })
      .join('');
  }
}
