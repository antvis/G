import type { LayoutRegistry } from '@antv/g-lite';
import { FragmentResult } from './FragmentResult';
import type { LayoutChildren } from './LayoutChildren';
import type { LayoutContextFactory } from './LayoutContext';
import type { LayoutEdgesFactory } from './LayoutEdges';
import type { LayoutFragmentOptions } from './LayoutFragment';
import type { LayoutObject } from './LayoutObject';
import type { LayoutWorkTask } from './LayoutWorkTask';
import type { IntrinsicSizes, LayoutConstraints } from './types';
import { LayoutTaskType, PropertyName } from './types';
import { makeQuerablePromise } from './utils';

const delay = (minisecond = 0) => {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, minisecond);
  });
};

export class LayoutEngine {
  protected layoutRegistry: LayoutRegistry;
  protected layoutContextFactory: LayoutContextFactory;
  protected layoutEdgesFactory: LayoutEdgesFactory;

  constructor(
    protected readonly _layoutRegistry: LayoutRegistry,
    protected readonly _layoutContextFactory: LayoutContextFactory,
    protected readonly _layoutEdgesFactory: LayoutEdgesFactory, // @contrib(LayoutContribution) // protected readonly layoutContributions: Contribution.Provider<LayoutContribution>,
  ) {
    this.layoutRegistry = _layoutRegistry;
    this.layoutContextFactory = _layoutContextFactory;
    this.layoutEdgesFactory = _layoutEdgesFactory;
    // layoutContributions.getContributions().forEach((layoutContrib) => {
    //   layoutContrib.registerLayout(_layoutRegistry);
    // });
  }

  /**
   * This function takes the root of the box-tree, a LayoutConstraints object, and compute the position of every node in the tree
   * @param rootNode root node of the layout object tree
   * @param rootPageConstraints layout constraints
   * @returns
   */
  async computeLayout(
    rootNode: LayoutObject,
    rootPageConstraints: LayoutConstraints,
  ) {
    await this.determineIntrinsicSizes(rootNode, rootNode.children);
    await this.calculateLayout(
      rootNode,
      rootNode.children,
      rootPageConstraints,
    );
  }

  /**
   * calculate intrinsicSize of node tree, use depth dirst / post order traversal
   * @param rootNode
   */
  async determineAllIntrinsicSizes(rootNode: LayoutObject) {}

  protected getLayoutDefinitionName(node: LayoutObject) {
    const layoutStyle = node.getAllStyle().get(PropertyName.LAYOUT);
    if (!layoutStyle) {
      throw new Error('layout property not found');
    }
    return layoutStyle.value;
  }

  /**
   * calculate the min/max content size of node
   * @param node current layout object
   * @param childNodes children of the current node
   */
  protected async determineIntrinsicSizes(
    node: LayoutObject,
    childNodes: LayoutObject[],
  ) {
    const layoutName = this.getLayoutDefinitionName(node);
    await this.invokeIntrinsicSizesCallback(layoutName, node, childNodes);
  }

  protected async invokeIntrinsicSizesCallback(
    layoutName: string,
    node: LayoutObject,
    childNodes: LayoutObject[],
  ) {
    const LayoutDef = this.layoutRegistry.getLayout(layoutName);
    const layoutInstance = new LayoutDef();
    const context = this.layoutContextFactory({
      mode: LayoutTaskType.IntrinsicSizes,
    });
    const { inputProperties = [] } = LayoutDef;
    const children: LayoutChildren[] = [];

    childNodes.forEach((childNode) => {
      const layoutChild = context.layoutChildrenFactory({
        node: childNode,
      });
      children.push(layoutChild);
    });

    const edges = this.layoutEdgesFactory({ node });

    const styleMap = node.getStyle(...inputProperties);

    // TODO compare to cache ( children edges styleMap )

    const value = layoutInstance.intrinsicSizes(children, edges, styleMap);

    const generator = this.runWorkQueue(value, context.workQueue);
    generator.next();
    await delay();
    const intrinsicSizesValue = generator.next().value;
    context.clearWorkQueue();
    node.setIntrisicSizes(intrinsicSizesValue);
  }

  protected async calculateLayout(
    node: LayoutObject,
    childNodes: LayoutObject[],
    layoutConstraints: LayoutConstraints,
  ) {
    const layoutName = this.getLayoutDefinitionName(node);
    await this.invokeLayoutCallback(
      layoutName,
      node,
      childNodes,
      layoutConstraints,
    );
  }

  protected async invokeLayoutCallback(
    layoutName: string,
    node: LayoutObject,
    childNodes: LayoutObject[],
    layoutConstraints: LayoutConstraints,
  ) {
    const LayoutDef = this.layoutRegistry.getLayout(layoutName);
    const layoutInstance = new LayoutDef();
    const context = this.layoutContextFactory({ mode: LayoutTaskType.Layout });
    const { inputProperties = [] } = LayoutDef;
    const children: LayoutChildren[] = [];

    childNodes.forEach((childNode) => {
      const layoutChild = context.layoutChildrenFactory({
        node: childNode,
      });
      children.push(layoutChild);
    });

    const edges = this.layoutEdgesFactory({ node });

    const styleMap = node.getStyle(...inputProperties);

    // TODO compare to cache ( children styleMap layoutConstraints )

    const value = layoutInstance.layout(
      children,
      edges,
      layoutConstraints,
      styleMap,
    );
    const generator = this.runWorkQueue(value, context.workQueue);
    generator.next();
    await delay();
    const fragmentResultvalue = generator.next().value;
    context.clearWorkQueue();
    const fragmentResult =
      fragmentResultvalue instanceof FragmentResult
        ? fragmentResultvalue
        : context.fragmentResultFactory(fragmentResultvalue);

    const layoutFragment = context.layoutFragmentFactory({
      inlineSize: fragmentResult.inlineSize,
      blockSize: fragmentResult.blockSize,
      data: fragmentResult.data,
    });

    node.setComputedLayout(layoutFragment);
    childNodes.forEach((childNode, index) => {
      childNode.setComputedLayout(fragmentResult.childFragments[index]);
    });
  }

  protected *runWorkQueue<T>(
    promise: Promise<T>,
    workQueue: LayoutWorkTask[],
  ): Generator<any, T, any> {
    const querablePromise = makeQuerablePromise(promise);
    if (workQueue.length > 0 && querablePromise.isPending()) {
      workQueue.forEach((workTask) => {
        if (workTask.taskType === LayoutTaskType.IntrinsicSizes) {
          const { layoutChild, deferred } = workTask;
          const { node } = layoutChild;
          deferred.resolve(this.getNodeIntrisicSizes(node));
        }

        if (workTask.taskType === LayoutTaskType.Layout) {
          const { layoutChild, deferred, layoutConstraints } = workTask;
          const { node, layoutContext } = layoutChild;
          const fragment = this.getNodeFragment(node, layoutConstraints);
          deferred.resolve(layoutContext.layoutFragmentFactory(fragment));
        }
      });
    }

    // wait promise to resolve
    yield;

    if (!querablePromise.isFulfilled()) {
      throw new Error('promise not fullfilled!');
    }
    return querablePromise.getFullFilledValue();
  }

  protected getNodeIntrisicSizes(node: LayoutObject): IntrinsicSizes {
    // calculate from border box, depend on writing mode of current layout
    const styleMap = node.getAllStyle();
    const minWidth =
      styleMap.get(PropertyName.MIN_WIDTH)?.value ||
      node.intrisicSizes?.minContentInlineSize ||
      styleMap.get(PropertyName.WIDTH)?.value ||
      0;
    const maxWidth =
      styleMap.get(PropertyName.MAX_WIDTH)?.value ||
      node.intrisicSizes?.maxContentInlineSize ||
      styleMap.get(PropertyName.WIDTH)?.value ||
      0;
    const minHeight =
      styleMap.get(PropertyName.MIN_HEIGHT)?.value ||
      node.intrisicSizes?.minContentBlockSize ||
      styleMap.get(PropertyName.HEIGHT)?.value ||
      0;
    const maxHeight =
      styleMap.get(PropertyName.MAX_HEIGHT)?.value ||
      node.intrisicSizes?.maxContentBlockSize ||
      styleMap.get(PropertyName.HEIGHT)?.value ||
      0;
    return {
      minContentInlineSize: minWidth,
      maxContentInlineSize: maxWidth,
      minContentBlockSize: minHeight,
      maxContentBlockSize: maxHeight,
    };
  }

  protected getNodeFragment(
    node: LayoutObject,
    constraints: LayoutConstraints,
  ): LayoutFragmentOptions {
    // TODO
    const width =
      node.getComputedLayout()?.inlineSize ||
      node.getAllStyle().get(PropertyName.MIN_WIDTH)?.value ||
      node.getAllStyle().get(PropertyName.WIDTH)?.value ||
      0;
    const height =
      node.getComputedLayout()?.blockSize ||
      node.getAllStyle().get(PropertyName.MIN_HEIGHT)?.value ||
      node.getAllStyle().get(PropertyName.HEIGHT)?.value ||
      0;
    return {
      inlineSize: width,
      blockSize: height,
      data: constraints.data,
    };
  }
}
