import type { ParsedBaseStyleProps } from '@antv/g-lite';

export const PathGeneratorFactory = 'PathGeneratorFactory';

/**
 * generate path in local space
 */
export const PathGenerator = 'PathGenerator';
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type PathGenerator<T extends ParsedBaseStyleProps> = (
  context: CanvasRenderingContext2D,
  attributes: T,
) => void;
