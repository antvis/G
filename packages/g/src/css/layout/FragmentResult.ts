import { inject, injectable, Syringe } from 'mana-syringe';
import { LayoutObject } from './LayoutObject';
import { LayoutContext } from './LayoutContext';
import type { LayoutFragment } from './LayoutFragment';

export const FragmentResultFactory = Syringe.defineToken('FragmentResultFactory');
// eslint-disable-next-line @typescript-eslint/no-redeclare
export interface FragmentResultFactory {
  (options: FragmentResultOptions): FragmentResult;
}

/**
 * The web developer defined layout method can return either a FragmentResultOptions or a FragmentResult.
 */
export const FragmentResultOptions = Syringe.defineToken('FragmentResultOptions');
// eslint-disable-next-line @typescript-eslint/no-redeclare
export interface FragmentResultOptions<T = void> {
  inlineSize: number;
  blockSize: number;
  autoBlockSize: number;
  childFragments: LayoutFragment[];
  data: T;
}

export const ContextNode = Syringe.defineToken('contextNode');

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
