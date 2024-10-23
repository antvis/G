import { clamp } from '@antv/util';
import { assert } from '@antv/g-device-api';

// Suggested values for the "layer" of makeSortKey. These are rough groups, and you can define your own
// ordering within the rough groups (e.g. you might use BACKGROUND + 1, or BACKGROUND + 2).
// TRANSLUCENT is meant to be used as a bitflag. It's special as it changes the behavior of the generic sort key

// functions like makeSortKey and setSortKeyDepth.
export enum RendererLayer {
  BACKGROUND = 0x00,
  ALPHA_TEST = 0x10,
  OPAQUE = 0x20,
  TRANSLUCENT = 0x80,
}

const MAX_DEPTH = 0x10000;

const DEPTH_BITS = 16;

export function makeDepthKey(
  depth: number,
  flipDepth: boolean,
  maxDepth: number = MAX_DEPTH,
) {
  // Input depth here is: 0 is the closest to the camera, positive values are further away. Negative values (behind camera) are clamped to 0.
  // normalizedDepth: 0.0 is closest to camera, 1.0 is farthest from camera.
  // These values are flipped if flipDepth is set.
  let normalizedDepth = clamp(depth, 0, maxDepth) / maxDepth;
  if (flipDepth) normalizedDepth = 1.0 - normalizedDepth;
  const depthKey = normalizedDepth * ((1 << DEPTH_BITS) - 1);
  return depthKey & 0xffff;
}

// Common sort key kinds.
// Indexed:     TLLLLLLL IIIIIIII IIIIIIII IIIIIIII
// Opaque:      0LLLLLLL PPPPPPPP PPPPPPPP DDDDDDDD
// Translucent: 1LLLLLLL DDDDDDDD DDDDDDDD BBBBBBBB

export function getSortKeyLayer(sortKey: number): number {
  return (sortKey >>> 24) & 0xff;
}

export function setSortKeyLayer(sortKey: number, layer: number): number {
  return ((sortKey & 0x00ffffff) | ((layer & 0xff) << 24)) >>> 0;
}

export function setSortKeyProgramKey(
  sortKey: number,
  programKey: number,
): number {
  const isTransparent = !!((sortKey >>> 31) & 1);
  if (isTransparent) return sortKey;
  return ((sortKey & 0xff0000ff) | ((programKey & 0xffff) << 8)) >>> 0;
}

export function setSortKeyBias(sortKey: number, bias: number): number {
  const isTransparent = !!((sortKey >>> 31) & 1);
  if (isTransparent) return ((sortKey & 0xffffff00) | (bias & 0xff)) >>> 0;
  return sortKey;
}

export function makeSortKeyOpaque(layer: number, programKey: number): number {
  return setSortKeyLayer(setSortKeyProgramKey(0, programKey), layer);
}

export function setSortKeyOpaqueDepth(
  sortKey: number,
  depthKey: number,
): number {
  assert(depthKey >= 0);
  return ((sortKey & 0xffffff00) | ((depthKey >>> 8) & 0xff)) >>> 0;
}

export function makeSortKeyTranslucent(layer: number): number {
  return setSortKeyLayer(0, layer);
}

export function setSortKeyTranslucentDepth(
  sortKey: number,
  depthKey: number,
): number {
  assert(depthKey >= 0);
  return ((sortKey & 0xff0000ff) | (depthKey << 8)) >>> 0;
}

export function makeSortKey(layer: RendererLayer, programKey = 0): number {
  if (layer & RendererLayer.TRANSLUCENT) return makeSortKeyTranslucent(layer);
  return makeSortKeyOpaque(layer, programKey);
}

export function setSortKeyDepthKey(sortKey: number, depthKey: number): number {
  const isTranslucent = !!((sortKey >>> 31) & 1);
  return isTranslucent
    ? setSortKeyTranslucentDepth(sortKey, depthKey)
    : setSortKeyOpaqueDepth(sortKey, depthKey);
}

export function setSortKeyDepth(
  sortKey: number,
  depth: number,
  maxDepth: number = MAX_DEPTH,
): number {
  const isTranslucent = !!((sortKey >>> 31) & 1);
  const depthKey = makeDepthKey(depth, isTranslucent, maxDepth);
  return isTranslucent
    ? setSortKeyTranslucentDepth(sortKey, depthKey)
    : setSortKeyOpaqueDepth(sortKey, depthKey);
}

export function getSortKeyDepth(sortKey: number): number {
  const isTranslucent = !!((sortKey >>> 31) & 1);
  if (isTranslucent) return (sortKey >>> 8) & 0xffff;

  return ((sortKey >>> 8) & 0xfffc) | (sortKey & 0x03);
}
