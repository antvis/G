import { inject, injectable, Syringe } from '@antv/g-lite';
import { LayoutContext } from './LayoutContext';
import type { LayoutFragment } from './LayoutFragment';
import type { LayoutObject } from './LayoutObject';

export const FragmentResultFactory = Syringe.defineToken('');
// eslint-disable-next-line @typescript-eslint/no-redeclare
export interface FragmentResultFactory {
  (options: FragmentResultOptions): FragmentResult;
}

/**
 * The web developer defined layout method can return either a FragmentResultOptions or a FragmentResult.
 */
export const FragmentResultOptions = Syringe.defineToken('');
// eslint-disable-next-line @typescript-eslint/no-redeclare
export interface FragmentResultOptions<T = void> {
  inlineSize: number;
  blockSize: number;
  autoBlockSize: number;
  childFragments: LayoutFragment[];
  data: T;
}

export const ContextNode = Syringe.defineToken('');

@injectable()
export class FragmentResult<T = void> {
  private layoutContext: LayoutContext;

  readonly inlineSize: number;
  readonly blockSize: number;

  private node: LayoutObject;

  childFragments: LayoutFragment[];

  data: T;

  constructor(
    @inject(LayoutContext) protected readonly _layoutContext: LayoutContext,
    @inject(ContextNode) protected readonly _node: LayoutObject,
    @inject(FragmentResultOptions) protected readonly options: FragmentResultOptions<T>,
  ) {
    this.layoutContext = _layoutContext;
    this.inlineSize = options?.inlineSize;
    this.blockSize = options?.blockSize;
    this.childFragments = options?.childFragments;
    this.data = options.data;
    this.node = _node;
  }
}
