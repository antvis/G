import type { ParsedBaseStyleProps } from '@antv/g';
import { Syringe } from 'mana-syringe';

export const PathGeneratorFactory = Syringe.defineToken('PathGeneratorFactory');
export const PathGenerator = Syringe.defineToken('PathGenerator');

/**
 * generate path in local space
 */
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type PathGenerator<T extends ParsedBaseStyleProps> = (
  context: CanvasRenderingContext2D,
  attributes: T,
) => void;
