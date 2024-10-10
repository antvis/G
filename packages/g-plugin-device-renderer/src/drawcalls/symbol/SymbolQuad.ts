import type { GlyphPosition } from './GlyphAtlas';
import type { Point } from './AlphaImage';
import type { PositionedGlyph } from './GlyphManager';
import { BASE_FONT_BUFFER } from './GlyphManager';

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
  glyphOffset: [number, number];
};

/**
 * Create the quads used for rendering a text label.
 */
export function getGlyphQuads(
  positionedGlyphs: PositionedGlyph[],
  positions: Record<string, Record<number, GlyphPosition>>,
): SymbolQuad[] {
  const quads: SymbolQuad[] = [];

  for (let k = 0; k < positionedGlyphs.length; k++) {
    const positionedGlyph = positionedGlyphs[k];
    const glyphPositions = positions[positionedGlyph.fontStack];
    const glyph = glyphPositions && glyphPositions[positionedGlyph.glyph];
    if (!glyph) continue;

    const { rect } = glyph;
    if (!rect) continue;

    // The rects have an addditional buffer that is not included in their size.
    const glyphPadding = 1.0;
    // const glyphPadding = 0.0;
    const rectBuffer = BASE_FONT_BUFFER + glyphPadding;

    const halfAdvance = (glyph.metrics.advance * positionedGlyph.scale) / 2;

    const glyphOffset: [number, number] = [0, 0];

    const builtInOffset = [positionedGlyph.x + halfAdvance, positionedGlyph.y];

    const x1 =
      (glyph.metrics.left - rectBuffer) * positionedGlyph.scale -
      halfAdvance +
      builtInOffset[0];
    const y1 =
      (-glyph.metrics.top - rectBuffer) * positionedGlyph.scale +
      builtInOffset[1];
    const x2 = x1 + rect.w * positionedGlyph.scale;
    const y2 = y1 + rect.h * positionedGlyph.scale;

    const tl = { x: x1, y: y1 };
    const tr = { x: x2, y: y1 };
    const bl = { x: x1, y: y2 };
    const br = { x: x2, y: y2 };

    quads.push({ tl, tr, bl, br, tex: rect, glyphOffset });
  }

  return quads;
}
