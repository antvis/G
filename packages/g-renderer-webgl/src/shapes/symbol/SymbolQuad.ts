import { Shaping } from './layout';
import { GlyphPosition } from './GlyphAtlas';
import { Point } from './AlphaImage';

const GLYPH_PBF_BORDER = 3;

export type SymbolQuad = {
  tl: Point;
  tr: Point;
  bl: Point;
  br: Point;
  tex: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  writingMode: any | void;
  glyphOffset: [number, number];
};

/**
 * Create the quads used for rendering a text label.
 * @private
 */
export function getGlyphQuads(
  shaping: Shaping,
  textOffset: [number, number],
  // layer: SymbolStyleLayer,
  alongLine: boolean,
  // feature: Feature,
  positions: { [key: string]: { [key: number]: GlyphPosition } }
): Array<SymbolQuad> {
  // const textRotate = layer.layout.get('text-rotate').evaluate(feature, {}) * Math.PI / 180;

  const positionedGlyphs = shaping.positionedGlyphs;
  const quads: Array<SymbolQuad> = [];

  for (let k = 0; k < positionedGlyphs.length; k++) {
    const positionedGlyph = positionedGlyphs[k];
    const glyphPositions = positions[positionedGlyph.fontStack];
    const glyph = glyphPositions && glyphPositions[positionedGlyph.glyph];
    if (!glyph) continue;

    const rect = glyph.rect;
    if (!rect) continue;

    // The rects have an addditional buffer that is not included in their size.
    const glyphPadding = 1.0;
    const rectBuffer = GLYPH_PBF_BORDER + glyphPadding;

    const halfAdvance = (glyph.metrics.advance * positionedGlyph.scale) / 2;

    const glyphOffset: [number, number] = alongLine ? [positionedGlyph.x + halfAdvance, positionedGlyph.y] : [0, 0];

    const builtInOffset = alongLine
      ? [0, 0]
      : [positionedGlyph.x + halfAdvance + textOffset[0], positionedGlyph.y + textOffset[1]];

    const x1 = (glyph.metrics.left - rectBuffer) * positionedGlyph.scale - halfAdvance + builtInOffset[0];
    const y1 = (-glyph.metrics.top - rectBuffer) * positionedGlyph.scale + builtInOffset[1];
    const x2 = x1 + rect.w * positionedGlyph.scale;
    const y2 = y1 + rect.h * positionedGlyph.scale;

    const tl = { x: x1, y: y1 };
    const tr = { x: x2, y: y1 };
    const bl = { x: x1, y: y2 };
    const br = { x: x2, y: y2 };

    // if (alongLine && positionedGlyph.vertical) {
    //   // Vertical-supporting glyphs are laid out in 24x24 point boxes (1 square em)
    //   // In horizontal orientation, the y values for glyphs are below the midline
    //   // and we use a "yOffset" of -17 to pull them up to the middle.
    //   // By rotating counter-clockwise around the point at the center of the left
    //   // edge of a 24x24 layout box centered below the midline, we align the center
    //   // of the glyphs with the horizontal midline, so the yOffset is no longer
    //   // necessary, but we also pull the glyph to the left along the x axis
    //   const center = new Point(-halfAdvance, halfAdvance);
    //   const verticalRotation = -Math.PI / 2;
    //   const xOffsetCorrection = new Point(5, 0);
    //   tl._rotateAround(verticalRotation, center)._add(xOffsetCorrection);
    //   tr._rotateAround(verticalRotation, center)._add(xOffsetCorrection);
    //   bl._rotateAround(verticalRotation, center)._add(xOffsetCorrection);
    //   br._rotateAround(verticalRotation, center)._add(xOffsetCorrection);
    // }

    // if (textRotate) {
    //   const sin = Math.sin(textRotate),
    //     cos = Math.cos(textRotate),
    //     matrix = [cos, -sin, sin, cos];

    //   tl._matMult(matrix);
    //   tr._matMult(matrix);
    //   bl._matMult(matrix);
    //   br._matMult(matrix);
    // }

    quads.push({ tl, tr, bl, br, tex: rect, writingMode: shaping.writingMode, glyphOffset });
  }

  return quads;
}
