import type { LayoutContext } from './LayoutContext';

export interface LayoutFragmentFactory<T = void> {
  (options: LayoutFragmentOptions<T>): LayoutFragment<T>;
}
export interface LayoutFragmentOptions<T = void> {
  inlineSize: number;
  blockSize: number;
  data: T;
}

/**
 * 布局的结果
 */
export class LayoutFragment<T = void> {
  layoutContext: LayoutContext;
  readonly inlineSize: number;
  readonly blockSize: number;
  inlineOffset: number;
  blockOffset: number;
  data: T;

  constructor(
    protected readonly _layoutContext: LayoutContext,
    protected readonly options: LayoutFragmentOptions<T>,
  ) {
    this.layoutContext = _layoutContext;
    this.inlineSize = options.inlineSize;
    this.blockSize = options.blockSize;
    this.inlineOffset = 0;
    this.blockOffset = 0;
    this.data = options.data;
  }
}
