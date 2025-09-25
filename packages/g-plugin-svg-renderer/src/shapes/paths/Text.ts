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
    textDecorationThickness,
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

  let styleCSSText = `transform:translate(${dx}px, ${dy}px);`;
  if (textDecorationLine && textDecorationLine !== 'none') {
    // Use CSS text-decoration for basic support
    // Include textDecorationThickness if provided
    if (textDecorationThickness !== undefined) {
      styleCSSText += `text-decoration:${textDecorationLine} ${textDecorationStyle} ${textDecorationColor};text-decoration-thickness:${textDecorationThickness};`;
    } else {
      styleCSSText += `text-decoration:${textDecorationLine} ${textDecorationStyle} ${textDecorationColor};`;
    }
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
    } else {
      $el.setAttribute('dy', '0px');
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

  // For advanced text decoration styles (dashed, dotted, wavy), we need to manually draw them
  // But only if we're not using the basic CSS approach
  if (
    textDecorationLine &&
    textDecorationLine !== 'none' &&
    textDecorationStyle &&
    textDecorationStyle !== 'solid'
  ) {
    // Remove any existing decoration elements first
    const existingDecorations = $el.querySelectorAll('[data-g-decorations]');
    existingDecorations.forEach((el) => el.remove());

    // Convert CSSRGB to string if needed
    let colorString = 'currentColor';
    if (textDecorationColor) {
      if (typeof textDecorationColor === 'string') {
        colorString = textDecorationColor;
      } else if (textDecorationColor && 'r' in textDecorationColor) {
        colorString = `rgba(${textDecorationColor.r}, ${textDecorationColor.g}, ${textDecorationColor.b}, ${textDecorationColor.alpha})`;
      }
    }

    // Determine line thickness
    let lineThickness = lineWidth;
    if (textDecorationThickness !== undefined) {
      lineThickness =
        typeof textDecorationThickness === 'string'
          ? parseFloat(textDecorationThickness)
          : textDecorationThickness;
    }

    // Create decoration lines
    const decorations = textDecorationLine.split(' ');

    decorations.forEach((decoration) => {
      let offsetY = 0;
      switch (decoration) {
        case 'underline':
          offsetY = 2;
          break;
        case 'overline':
          offsetY = -lineHeight + 2;
          break;
        case 'line-through':
          offsetY = -lineHeight / 2;
          break;
        default:
          return;
      }

      lines.forEach((line, i) => {
        const lineY = y + i * lineHeight + offsetY;
        if (textDecorationStyle === 'wavy') {
          const pathElement = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'path',
          );
          pathElement.setAttribute('data-g-decorations', 'true');
          pathElement.setAttribute('stroke', colorString);
          pathElement.setAttribute('stroke-width', String(lineThickness));

          // Create wavy path
          let pathData = `M ${x},${lineY}`;
          const amplitude = 1;
          const frequency = 0.1;
          for (let px = x; px <= x + metrics.width; px += 2) {
            const waveY = lineY + amplitude * Math.sin(frequency * (px - x));
            pathData += ` L ${px},${waveY}`;
          }
          pathElement.setAttribute('d', pathData);
          $el.appendChild(pathElement);
        } else {
          const lineElement = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'line',
          );
          lineElement.setAttribute('data-g-decorations', 'true');
          lineElement.setAttribute('x1', String(x));
          lineElement.setAttribute('y1', String(lineY));
          lineElement.setAttribute('x2', String(x + metrics.width));
          lineElement.setAttribute('y2', String(lineY));
          lineElement.setAttribute('stroke', colorString);
          lineElement.setAttribute('stroke-width', String(lineThickness));

          // Set line style
          switch (textDecorationStyle) {
            case 'dashed':
              lineElement.setAttribute('stroke-dasharray', '5,5');
              break;
            case 'dotted':
              lineElement.setAttribute('stroke-dasharray', '2,2');
              break;
          }
          $el.appendChild(lineElement);
        }
      });
    });
  }
}
