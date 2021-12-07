import type { IElement } from '../dom/interfaces';
import type { SceneGraphService } from '../services/SceneGraphService';

export const StylePropertyParser = 'StylePropertyParser';
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type StylePropertyParser<Original, Parsed> = (
  value: Original,
  displayObject: IElement | null,
) => Parsed;
export const StylePropertyParserFactory = 'StylePropertyParserFactory';
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type StylePropertyParserFactory = <Original, Parsed>(
  name: string,
) => StylePropertyParser<Original, Parsed>;
export interface ParsedStyleProperty<T, V, Formatted = string> {
  type: T;
  value: V;
  formatted: Formatted;
}
export type Interpolatable = number | boolean | number[] | boolean[];

export const StylePropertyUpdater = 'StylePropertyUpdater';
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type StylePropertyUpdater<Original> = (
  oldValue: Original,
  newValue: Original,
  displayObject: IElement,
  sceneGraphService: SceneGraphService,
) => void;
export const StylePropertyUpdaterFactory = 'StylePropertyUpdaterFactory';
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type StylePropertyUpdaterFactory = <Original>(
  name: string,
) => StylePropertyUpdater<Original>;

export const StylePropertyMerger = 'StylePropertyMerger';
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type StylePropertyMerger<Parsed, T extends Interpolatable = number> = (
  left: Parsed,
  right: Parsed,
  displayObject: IElement | null,
) => [T, T, (i: T) => string] | undefined;
export const StylePropertyMergerFactory = 'StylePropertyMergerFactory';
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type StylePropertyMergerFactory = <Parsed>(name: string) => StylePropertyMerger<Parsed>;
