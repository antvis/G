import type { ParsedBaseStyleProps } from '@antv/g-lite';
import { Syringe } from '@antv/g-lite';

export const PathGeneratorFactory = Syringe.defineToken('');
export const PathGenerator = Syringe.defineToken('');

/**
 * generate path in local space
 */
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type PathGenerator<T extends ParsedBaseStyleProps> = (
  context: CanvasRenderingContext2D,
  attributes: T,
) => void;
