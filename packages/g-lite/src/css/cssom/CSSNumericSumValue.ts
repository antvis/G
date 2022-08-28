import type { UnitType } from './types';

export type UnitMap = Record<UnitType, number>;

// A term is a number and a unit map e.g. 1px is represented as
// (1, { px: 1 })
export interface Term {
  value: number;
  // A UnitMap maps units to exponents. e.g. the term
  // 1m/s^2 would have a unit map of { m: 1, s: -2 }.
  // UnitMaps must not contain entries with a zero value.
  units: UnitMap;
}

// CSSNumericSumValue represents the sum of one or more "terms".
// A term is a number with a set of units. e.g.
// 1px/s + 5m^2 - 1Hz is a sum value with three terms.
export type CSSNumericSumValue = Term[];
