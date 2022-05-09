import { Syringe } from 'mana-syringe';
import type { DisplayObject } from '../display-objects';

export const StyleValueRegistry = Syringe.defineToken('StyleValueRegistry');
// eslint-disable-next-line @typescript-eslint/no-redeclare
export interface StyleValueRegistry {
  recalc(displayObject: DisplayObject): void;
}
