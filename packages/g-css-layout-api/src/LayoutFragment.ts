import { inject, injectable, Syringe } from '@antv/g-lite';
import { LayoutContext } from './LayoutContext';

export const LayoutFragmentFactory = Syringe.defineToken('');
// eslint-disable-next-line @typescript-eslint/no-redeclare
export interface LayoutFragmentFactory<T = void> {
  (options: LayoutFragmentOptions<T>): LayoutFragment<T>;
}

export const LayoutFragmentOptions = Syringe.defineToken('');
// eslint-disable-next-line @typescript-eslint/no-redeclare
export interface LayoutFragmentOptions<T = void> {
  inlineSize: number;
  blockSize: number;
  data: T;
}

/**
 * 布局的结果
 */
@injectable()
export class LayoutFragment<T = void> {
  layoutContext: LayoutContext;
  readonly inlineSize: number;
  readonly blockSize: number;
  inlineOffset: number;
  blockOffset: number;
  data: T;

  constructor(
    @inject(LayoutContext) protected readonly _layoutContext: LayoutContext,
    @inject(LayoutFragmentOptions) protected readonly options: LayoutFragmentOptions<T>,
  ) {
    this.layoutContext = _layoutContext;
    this.inlineSize = options.inlineSize;
    this.blockSize = options.blockSize;
    this.inlineOffset = 0;
    this.blockOffset = 0;
    this.data = options.data;
  }
}
