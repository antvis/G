import type { LayoutObject } from './LayoutObject';
import { PropertyName } from './types';

export interface LayoutEdgesFactory {
  (options: LayoutEdgesOptions): LayoutEdges;
}
export interface LayoutEdgesOptions {
  node: LayoutObject;
}

const SCROLLBAR_SIZES = [0, 0, 0, 0];

/**
 * https://drafts.css-houdini.org/css-layout-api/#layoutedges
 * the size of border, scrollbar, padding
 */
export class LayoutEdges {
  readonly inlineStart: number;
  readonly inlineEnd: number;

  readonly blockStart: number;
  readonly blockEnd: number;

  // Convenience attributes for the sum in one direction.
  readonly inline: number;
  readonly block: number;

  constructor(protected readonly options: LayoutEdgesOptions) {
    const { node } = options;
    const styleMap = node.getAllStyle();

    const borderTopWidth = styleMap.get(PropertyName.PADDING_TOP)?.value ?? 0;
    const borderRightWidth = styleMap.get(PropertyName.PADDING_END)?.value ?? 0;
    const borderBottomWidth =
      styleMap.get(PropertyName.PADDING_BOTTOM)?.value ?? 0;
    const borderLeftWidth =
      styleMap.get(PropertyName.PADDING_START)?.value ?? 0;

    const paddingTopWidth = styleMap.get(PropertyName.PADDING_TOP)?.value ?? 0;
    const paddingRightWidth =
      styleMap.get(PropertyName.PADDING_END)?.value ?? 0;
    const paddingBottomWidth =
      styleMap.get(PropertyName.PADDING_BOTTOM)?.value ?? 0;
    const paddingLeftWidth =
      styleMap.get(PropertyName.PADDING_START)?.value ?? 0;

    this.blockStart = borderTopWidth + SCROLLBAR_SIZES[0] + paddingTopWidth;
    this.inlineStart =
      borderRightWidth + SCROLLBAR_SIZES[1] + paddingRightWidth;
    this.blockEnd = borderBottomWidth + SCROLLBAR_SIZES[2] + paddingBottomWidth;
    this.inlineEnd = borderLeftWidth + SCROLLBAR_SIZES[3] + paddingLeftWidth;

    this.block = this.blockStart + this.blockEnd;
    this.inline = this.inlineStart + this.inlineEnd;
  }
}
