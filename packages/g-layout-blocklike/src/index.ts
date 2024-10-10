import type {
  FragmentResult,
  FragmentResultOptions,
  LayoutChildren,
  LayoutConstraints,
  LayoutEdges,
} from '@antv/g-css-layout-api';
import { AbstractLayoutDefinition } from '@antv/g-css-layout-api';

/**
 * @see https://github.com/GoogleChromeLabs/houdini-samples/blob/master/layout-worklet/blocklike/index.html
 */
export class Layout extends AbstractLayoutDefinition {
  static get childrenInputProperties() {
    return ['margin-left', 'margin-right', 'margin-top', 'margin-bottom'];
  }

  async intrinsicSizes(
    children: LayoutChildren[],
    edges: LayoutEdges,
    styleMap: Record<string, any>,
  ) {
    const childrenSizes = await Promise.all(
      children.map((child) => {
        return child.intrinsicSizes();
      }),
    );

    const maxContentInlineSize =
      childrenSizes.reduce((max, childSizes) => {
        return Math.max(max, childSizes.maxContentInlineSize);
      }, 0) + edges.inline;

    const minContentInlineSize =
      childrenSizes.reduce((max, childSizes) => {
        return Math.max(max, childSizes.maxContentInlineSize);
      }, 0) + edges.inline;

    return {
      maxContentInlineSize,
      minContentInlineSize,
      maxContentBlockSize: 0,
      minContentBlockSize: 0,
    };
  }
  async layout(
    children: LayoutChildren[],
    edges: LayoutEdges,
    constraintSpace: LayoutConstraints,
    styleMap: Record<string, any>,
  ): Promise<FragmentResultOptions | FragmentResult> {
    const childFragments = [];
    let inlineOffset = 0;
    let blockOffset = 0;
    let maxBlockSizeInRow = 0;
    let availableInlineSize = constraintSpace.fixedInlineSize;
    let isRepeatAttempt = false;

    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      // @ts-ignore
      // eslint-disable-next-line no-await-in-loop
      let childFragment = await child.layoutNextFragment({
        availableInlineSize,
      });
      const leftMargin = child.styleMap.get('margin-left')?.value || 0;
      const rightMargin = child.styleMap.get('margin-right')?.value || 0;
      const topMargin = child.styleMap.get('margin-top')?.value || 0;
      const bottomMargin = child.styleMap.get('margin-bottom')?.value || 0;
      const childInlineSize =
        childFragment.inlineSize + leftMargin + rightMargin;
      // If there’s not enough room left on this row, start a new row and
      // layout the current child again.
      if (childInlineSize > availableInlineSize && !isRepeatAttempt) {
        availableInlineSize = constraintSpace.fixedInlineSize;
        blockOffset += maxBlockSizeInRow;
        maxBlockSizeInRow = 0;
        inlineOffset = 0;
        isRepeatAttempt = true;
        // Restart loop
        i--;
        continue;
      } else if (childInlineSize > availableInlineSize && isRepeatAttempt) {
        // If the second attempt failed as well, the child is wider than the
        // there’s room. In that case, force it to be laid out at max width.
        // @ts-ignore
        // eslint-disable-next-line no-await-in-loop
        childFragment = await child.layoutNextFragment({
          fixedInlineSize: availableInlineSize - leftMargin - rightMargin,
        });
      }
      isRepeatAttempt = false;
      childFragment.inlineOffset = inlineOffset + leftMargin;
      childFragment.blockOffset = blockOffset + topMargin;
      childFragments.push(childFragment);

      inlineOffset += childInlineSize;
      maxBlockSizeInRow = Math.max(
        maxBlockSizeInRow,
        childFragment.blockSize + topMargin + bottomMargin,
      );
      availableInlineSize -= childInlineSize;
    }

    // @ts-ignore
    return {
      childFragments,
      autoBlockSize: blockOffset + maxBlockSizeInRow,
    };
  }
}
