import type { GlyphMetrics, StyleGlyph } from './AlphaImage';
import { AlphaImage } from './AlphaImage';

// borrow from https://github.com/mapbox/potpack/blob/master/index.mjs
// @see https://github.com/antvis/g/issues/836
function potpack(
  boxes: {
    x: number;
    y: number;
    w: number;
    h: number;
  }[],
) {
  // calculate total box area and maximum box width
  let area = 0;
  let maxWidth = 0;

  for (const box of boxes) {
    area += box.w * box.h;
    maxWidth = Math.max(maxWidth, box.w);
  }

  // sort the boxes for insertion by height, descending
  boxes.sort((a, b) => b.h - a.h);

  // aim for a squarish resulting container,
  // slightly adjusted for sub-100% space utilization
  const startWidth = Math.max(Math.ceil(Math.sqrt(area / 0.95)), maxWidth);

  // start with a single empty space, unbounded at the bottom
  const spaces = [{ x: 0, y: 0, w: startWidth, h: Infinity }];

  let width = 0;
  let height = 0;

  for (const box of boxes) {
    // look through spaces backwards so that we check smaller spaces first
    for (let i = spaces.length - 1; i >= 0; i--) {
      const space = spaces[i];

      // look for empty spaces that can accommodate the current box
      if (box.w > space.w || box.h > space.h) continue;

      // found the space; add the box to its top-left corner
      // |-------|-------|
      // |  box  |       |
      // |_______|       |
      // |         space |
      // |_______________|
      box.x = space.x;
      box.y = space.y;

      height = Math.max(height, box.y + box.h);
      width = Math.max(width, box.x + box.w);

      if (box.w === space.w && box.h === space.h) {
        // space matches the box exactly; remove it
        const last = spaces.pop();
        if (i < spaces.length) spaces[i] = last;
      } else if (box.h === space.h) {
        // space matches the box height; update it accordingly
        // |-------|---------------|
        // |  box  | updated space |
        // |_______|_______________|
        space.x += box.w;
        space.w -= box.w;
      } else if (box.w === space.w) {
        // space matches the box width; update it accordingly
        // |---------------|
        // |      box      |
        // |_______________|
        // | updated space |
        // |_______________|
        space.y += box.h;
        space.h -= box.h;
      } else {
        // otherwise the box splits the space into two spaces
        // |-------|-----------|
        // |  box  | new space |
        // |_______|___________|
        // | updated space     |
        // |___________________|
        spaces.push({
          x: space.x + box.w,
          y: space.y,
          w: space.w - box.w,
          h: box.h,
        });
        space.y += box.h;
        space.h -= box.h;
      }
      break;
    }
  }

  return {
    w: width, // container width
    h: height, // container height
    fill: area / (width * height) || 0, // space utilization
  };
}

const padding = 1;

type Rect = {
  x: number;
  y: number;
  w: number;
  h: number;
};

export type GlyphPosition = {
  rect: Rect;
  metrics: GlyphMetrics;
};

export type GlyphPositions = Record<string, Record<number, GlyphPosition>>;

/**
 * Merge SDFs into a large squared atlas with `potpack`,
 * because on WebGL1 context, all textures are resized to a power of two to produce the best quality.
 *
 * @see https://doc.babylonjs.com/advanced_topics/webGL2#power-of-two-textures
 */
export default class GlyphAtlas {
  image: AlphaImage;
  positions: GlyphPositions;

  constructor(stacks: Record<string, Record<number, StyleGlyph>>) {
    const positions = {};
    const bins: {
      x: number;
      y: number;
      w: number;
      h: number;
    }[] = [];

    for (const stack in stacks) {
      const glyphs = stacks[stack];
      // @ts-ignore
      const stackPositions = (positions[stack] = {});

      for (const id in glyphs) {
        const src = glyphs[+id];
        if (!src || src.bitmap.width === 0 || src.bitmap.height === 0) continue;

        const bin = {
          x: 0,
          y: 0,
          w: src.bitmap.width + 2 * padding,
          h: src.bitmap.height + 2 * padding,
        };
        bins.push(bin);
        // @ts-ignore
        stackPositions[id] = { rect: bin, metrics: src.metrics };
      }
    }

    const { w, h } = potpack(bins);
    const image = new AlphaImage({ width: w || 1, height: h || 1 });

    for (const stack in stacks) {
      const glyphs = stacks[stack];

      for (const id in glyphs) {
        const src = glyphs[+id];
        if (!src || src.bitmap.width === 0 || src.bitmap.height === 0) continue;
        // @ts-ignore
        const bin = positions[stack][id].rect;
        AlphaImage.copy(
          src.bitmap,
          image,
          { x: 0, y: 0 },
          { x: bin.x + padding, y: bin.y + padding },
          src.bitmap,
        );
      }
    }

    this.image = image;
    this.positions = positions;
  }
}
