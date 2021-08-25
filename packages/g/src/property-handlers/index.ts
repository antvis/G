/** handle props in keyframe */
import type { DisplayObject } from '../DisplayObject';

export const StylePropertyParser = Symbol('StylePropertyParser');
export type StylePropertyParser<Original, Parsed> = (
  value: Original,
  displayObject: DisplayObject | null,
) => Parsed;
export const StylePropertyParserFactory = Symbol('StylePropertyParserFactory');
export type StylePropertyParserFactory = <Original, Parsed>(
  name: string,
) => StylePropertyParser<Original, Parsed>;
export interface ParsedStyleProperty<T, V, Formatted = string> {
  type: T;
  value: V;
  formatted: Formatted;
}
export type Interpolatable = number | boolean | number[] | boolean[];

export const StylePropertyUpdater = Symbol('StylePropertyUpdater');
export type StylePropertyUpdater<Original> = (
  oldValue: Original,
  newValue: Original,
  displayObject: DisplayObject,
) => void;
export const StylePropertyUpdaterFactory = Symbol('StylePropertyUpdaterFactory');
export type StylePropertyUpdaterFactory = <Original>(
  name: string,
) => StylePropertyUpdater<Original>;

export const StylePropertyMerger = Symbol('StylePropertyMerger');
export type StylePropertyMerger<Parsed, T extends Interpolatable = number> = (
  left: Parsed,
  right: Parsed,
  displayObject: DisplayObject | null,
) => [T, T, (i: T) => string] | undefined;
export const StylePropertyMergerFactory = Symbol('StylePropertyMergerFactory');
export type StylePropertyMergerFactory = <Parsed>(name: string) => StylePropertyMerger<Parsed>;

export * from './aabb';
export * from './localPosition';
export * from './numeric';
export * from './color';
export * from './offsetPath';
export * from './offsetDistance';
export * from './clipPath';
export * from './zIndex';
export * from './origin';
export * from './transform';
export * from './dimension';
export * from './path';
export * from './points';
