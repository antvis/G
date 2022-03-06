import { inject, singleton } from 'mana-syringe';
import {
  AABB,
  RenderingService,
  RenderingPlugin,
  RenderingPluginContribution,
  SceneGraphService,
  RenderingContext,
  ElementEvent,
  DisplayObject,
  SHAPE,
} from '@antv/g';
import type { FederatedEvent } from '@antv/g';
import Yoga, {
  YogaNode,
  YogaFlexDirection,
  YogaJustifyContent,
  YogaAlign,
  YogaFlexWrap,
  YogaPositionType,
  YogaDisplay,
} from 'yoga-layout';
import { YogaPluginOptions } from './tokens';
import { YogaConstants } from './constants';

import YogaEdges = YogaConstants.YogaEdges;
import ComputedLayout = YogaConstants.ComputedLayout;
import FlexDirection = YogaConstants.FlexDirection;
import JustifyContent = YogaConstants.JustifyContent;
import Align = YogaConstants.Align;
import FlexWrap = YogaConstants.FlexWrap;
import Display = YogaConstants.Display;
import PositionType = YogaConstants.PositionType;

// export type PixelsOrPercentage = number | string;
// export type YogaSize = PixelsOrPercentage | 'pixi' | 'auto';

const { FLEX_DIRECTION_ROW, ALIGN_FLEX_START, EDGE_TOP, EDGE_RIGHT, EDGE_BOTTOM, EDGE_LEFT } = Yoga;

const YOGA_UMD_ENTRY = 'https://unpkg.com/yoga-layout-wasm@1.9.3-alpha.7/dist/index.js';
const YOGA_WASM = 'https://unpkg.com/browse/yoga-layout-wasm@1.9.3-alpha.7/dist/yoga.wasm';

/**
 * use https://github.com/pinqy520/yoga-layout-wasm
 */
@singleton({ contrib: RenderingPluginContribution })
export class YogaPlugin implements RenderingPlugin {
  static tag = 'YogaPlugin';

  @inject(SceneGraphService)
  protected sceneGraphService: SceneGraphService;

  @inject(RenderingContext)
  private renderingContext: RenderingContext;

  @inject(YogaPluginOptions)
  private options: YogaPluginOptions;

  // displayObject.entity -> YogaNode
  private nodes: Record<number, YogaNode> = {};

  private yoga: typeof Yoga;

  private needRecalculateLayout = true;

  apply(renderingService: RenderingService) {
    renderingService.hooks.init.tapPromise(YogaPlugin.tag, async () => {
      this.renderingContext.root.addEventListener(ElementEvent.MOUNTED, handleMounted);
      this.renderingContext.root.addEventListener(ElementEvent.UNMOUNTED, handleUnmounted);
      this.renderingContext.root.addEventListener(ElementEvent.INSERTED, handleInserted);
      this.renderingContext.root.addEventListener(ElementEvent.REMOVED, handleRemoved);
      this.renderingContext.root.addEventListener(ElementEvent.BOUNDS_CHANGED, handleBoundsChanged);
      this.renderingContext.root.addEventListener(
        ElementEvent.ATTRIBUTE_CHANGED,
        handleAttributeChanged,
      );

      const Yoga = await this.loadYoga();
      // @ts-ignore
      this.yoga = await Yoga.init(YOGA_WASM);
    });

    renderingService.hooks.destroy.tap(YogaPlugin.tag, () => {
      this.renderingContext.root.removeEventListener(ElementEvent.MOUNTED, handleMounted);
      this.renderingContext.root.removeEventListener(ElementEvent.UNMOUNTED, handleUnmounted);
      this.renderingContext.root.removeEventListener(ElementEvent.INSERTED, handleInserted);
      this.renderingContext.root.removeEventListener(ElementEvent.REMOVED, handleRemoved);
      this.renderingContext.root.removeEventListener(
        ElementEvent.BOUNDS_CHANGED,
        handleBoundsChanged,
      );
      this.renderingContext.root.removeEventListener(
        ElementEvent.ATTRIBUTE_CHANGED,
        handleAttributeChanged,
      );
    });

    // const printYogaTree = (node: YogaNode) => {
    //   console.log(node);

    //   const num = node.getChildCount();
    //   for (let i = 0; i < num; i++) {
    //     const child = node.getChild(i);
    //     printYogaTree(child);
    //   }
    // };

    renderingService.hooks.beginFrame.tap(YogaPlugin.tag, () => {
      if (this.needRecalculateLayout) {
        const rootNode = this.nodes[this.renderingContext.root.entity];
        rootNode.calculateLayout();
        this.renderingContext.root.forEach((object: DisplayObject) => {
          const node = this.nodes[object.entity];
          this.updateDisplayObjectPosition(object, node);
        });
        this.needRecalculateLayout = false;
      }
    });

    /**
     * create YogaNode for every displayObject
     */
    const handleMounted = (e: FederatedEvent) => {
      const target = e.target as DisplayObject;

      if (this.yoga) {
        const node = this.yoga.Node.create();
        this.nodes[target.entity] = node;

        // set default values
        node.setFlexDirection(FLEX_DIRECTION_ROW);
        node.setAlignItems(Yoga.ALIGN_FLEX_START);
        node.setAlignContent(ALIGN_FLEX_START);
        // @see https://yogalayout.com/docs/width-height/
        node.setWidth('auto');
        node.setHeight('auto');
        // @see https://yogalayout.com/docs/min-max/
        node.setMinWidth(NaN);
        node.setMaxWidth(NaN);
        node.setMinHeight(NaN);
        node.setMaxHeight(NaN);
        // @see https://yogalayout.com/docs/flex/
        node.setFlexGrow(0);
        node.setFlexBasis(NaN);
        node.setFlexShrink(1);

        // sync YogaNode attributes
        this.syncAttributes(target, target.parsedStyle);

        const parent = target.parentElement as DisplayObject;
        const parentNode = this.nodes[parent.entity];
        if (parentNode) {
          const i = parent.children.indexOf(target);
          parentNode.insertChild(node, i);
        }

        this.needRecalculateLayout = true;
        this.resizeYogaNode(target);
      }
    };

    /**
     * destroy YogaNode
     */
    const handleUnmounted = (e: FederatedEvent) => {
      const target = e.target as DisplayObject;
      const node = this.nodes[(target as DisplayObject).entity];
      if (node && this.yoga) {
        this.yoga.Node.destroy(node);
        delete this.nodes[target.entity];
      }
    };

    const handleInserted = (e: FederatedEvent) => {
      const child = e.target as DisplayObject;

      // build subtree with YogaNode
      child.forEach((object: DisplayObject) => {
        const parent = object.parentElement as DisplayObject;
        const childNode = this.nodes[object.entity];
        const parentNode = this.nodes[parent.entity];
        const i = parent.children.indexOf(object);

        if (!parentNode.getChild(i)) {
          parentNode.insertChild(childNode, i);
        }
      });
    };

    const handleRemoved = (e: FederatedEvent) => {
      const child = e.target as DisplayObject;

      child.forEach((object: DisplayObject) => {
        const parent = object.parentElement as DisplayObject;
        const childNode = this.nodes[object.entity];
        const parentNode = this.nodes[parent.entity];
        parentNode.removeChild(childNode);
      });
    };

    const handleAttributeChanged = (e: FederatedEvent) => {
      const target = e.target as DisplayObject;
      const { attributeName, newValue } = e.detail;
      const needRecalculateLayout = this.syncAttributes(target, {
        [attributeName]: newValue,
      });

      if (needRecalculateLayout) {
        this.needRecalculateLayout = true;
      }
    };

    const handleBoundsChanged = (e: FederatedEvent) => {
      const object = e.target as DisplayObject;
      // skip if this object mounted on another scenegraph root
      if (object.ownerDocument?.documentElement !== this.renderingContext.root) {
        return;
      }
      // this.resizeYogaNode(object);
      this.needRecalculateLayout = true;
    };
  }

  private resizeYogaNode(object: DisplayObject) {
    const node = this.nodes[object.entity];
    if (node) {
      let bounds: AABB;
      // flex container
      if (this.isFlex(object)) {
        bounds = object.getGeometryBounds();
      } else {
        bounds = object.getBounds();
      }
      if (bounds) {
        const [minX, minY] = bounds.getMin();
        const [maxX, maxY] = bounds.getMax();
        node.setWidth(maxX - minX);
        node.setHeight(maxY - minY);
      }
    }
  }

  /**
   * sync YogaNode
   */
  private syncAttributes(object: DisplayObject, attributes: Record<string, any>): boolean {
    const node = this.nodes[object.entity];

    // TODO: border, gap

    let needRecalculateLayout = false;
    Object.keys(attributes).forEach((attributeName) => {
      const newValue = attributes[attributeName];
      if (attributeName === 'flexDirection') {
        node.setFlexDirection(
          <YogaFlexDirection>YogaConstants.FlexDirection[newValue as keyof typeof FlexDirection],
        );
        needRecalculateLayout = true;
      } else if (attributeName === 'justifyContent') {
        node.setJustifyContent(
          <YogaJustifyContent>YogaConstants.JustifyContent[newValue as keyof typeof JustifyContent],
        );
        needRecalculateLayout = true;
      } else if (attributeName === 'alignContent') {
        node.setAlignContent(<YogaAlign>YogaConstants.Align[newValue as keyof typeof Align]);
        needRecalculateLayout = true;
      } else if (attributeName === 'alignItems') {
        node.setAlignItems(<YogaAlign>YogaConstants.Align[newValue as keyof typeof Align]);
        needRecalculateLayout = true;
      } else if (attributeName === 'alignSelf') {
        node.setAlignSelf(<YogaAlign>YogaConstants.Align[newValue as keyof typeof Align]);
        needRecalculateLayout = true;
      } else if (attributeName === 'flexWrap') {
        node.setFlexWrap(<YogaFlexWrap>YogaConstants.FlexWrap[newValue as keyof typeof FlexWrap]);
        needRecalculateLayout = true;
      } else if (attributeName === 'flexGrow') {
        node.setFlexGrow(newValue as number);
        needRecalculateLayout = true;
      } else if (attributeName === 'flexShrink') {
        node.setFlexShrink(newValue as number);
        needRecalculateLayout = true;
      } else if (attributeName === 'flexBasis') {
        node.setFlexBasis(newValue as number);
        needRecalculateLayout = true;
      } else if (attributeName === 'position') {
        node.setPositionType(
          <YogaPositionType>YogaConstants.PositionType[newValue as keyof typeof PositionType],
        );
        needRecalculateLayout = true;
      } else if (attributeName === 'padding') {
        const margin = newValue as number[];
        YogaEdges.forEach((edge, index) => {
          const value = margin[index];
          node.setPadding(edge, value);
        });
        needRecalculateLayout = true;
      } else if (attributeName === 'paddingAll') {
        const margin = [newValue, newValue, newValue, newValue] as number[];
        YogaEdges.forEach((edge, index) => {
          const value = margin[index];
          node.setPadding(edge, value);
        });
        needRecalculateLayout = true;
      } else if (attributeName === 'paddingTop') {
        node.setPadding(EDGE_TOP, newValue as number);
        needRecalculateLayout = true;
      } else if (attributeName === 'paddingRight') {
        node.setPadding(EDGE_RIGHT, newValue as number);
        needRecalculateLayout = true;
      } else if (attributeName === 'paddingBottom') {
        node.setPadding(EDGE_BOTTOM, newValue as number);
        needRecalculateLayout = true;
      } else if (attributeName === 'paddingLeft') {
        node.setPadding(EDGE_LEFT, newValue as number);
        needRecalculateLayout = true;
      } else if (attributeName === 'margin') {
        const margin = newValue as number[];
        YogaEdges.forEach((edge, index) => {
          const value = margin[index];
          node.setMargin(edge, value);
        });
        needRecalculateLayout = true;
      } else if (attributeName === 'marginAll') {
        const margin = [newValue, newValue, newValue, newValue] as number[];
        YogaEdges.forEach((edge, index) => {
          const value = margin[index];
          node.setMargin(edge, value);
        });
        needRecalculateLayout = true;
      } else if (attributeName === 'marginTop') {
        node.setMargin(EDGE_TOP, newValue as number);
        needRecalculateLayout = true;
      } else if (attributeName === 'marginRight') {
        node.setMargin(EDGE_RIGHT, newValue as number);
        needRecalculateLayout = true;
      } else if (attributeName === 'marginBottom') {
        node.setMargin(EDGE_BOTTOM, newValue as number);
        needRecalculateLayout = true;
      } else if (attributeName === 'marginLeft') {
        node.setMargin(EDGE_LEFT, newValue as number);
        needRecalculateLayout = true;
      } else if (attributeName === 'top') {
        node.setPosition(EDGE_TOP, newValue as number);
        needRecalculateLayout = true;
      } else if (attributeName === 'right') {
        node.setPosition(EDGE_RIGHT, newValue as number);
        needRecalculateLayout = true;
      } else if (attributeName === 'bottom') {
        node.setPosition(EDGE_BOTTOM, newValue as number);
        needRecalculateLayout = true;
      } else if (attributeName === 'left') {
        node.setPosition(EDGE_LEFT, newValue as number);
        needRecalculateLayout = true;
      } else if (attributeName === 'minWidth') {
        node.setMinWidth(newValue as number);
        needRecalculateLayout = true;
      } else if (attributeName === 'minHeight') {
        node.setMinHeight(newValue as number);
        needRecalculateLayout = true;
      } else if (attributeName === 'maxWidth') {
        node.setMaxWidth(newValue as number);
        needRecalculateLayout = true;
      } else if (attributeName === 'maxHeight') {
        node.setMaxHeight(newValue as number);
        needRecalculateLayout = true;
      } else if (attributeName === 'display') {
        node.setDisplay(<YogaDisplay>YogaConstants.Display[newValue as keyof typeof Display]);
        needRecalculateLayout = true;
      } else if (attributeName === 'width') {
        node.setWidth(newValue as number);
      } else if (attributeName === 'height') {
        node.setHeight(newValue as number);
      }
    });

    return needRecalculateLayout;
  }

  private isFlex(object: DisplayObject) {
    return object?.parsedStyle?.display === 'flex';
  }

  private updateDisplayObjectPosition(object: DisplayObject, node: YogaNode) {
    const isInFlexContainer = this.isFlex(object?.parentElement as DisplayObject);
    if (isInFlexContainer) {
      const layout = node.getComputedLayout();
      const { top, left, width, height } = layout;
      // update size, only Rect & Image can be updated
      object.style.width = width;
      object.style.height = height;
      // reset origin to top-left
      object.parsedStyle.origin = [0, 0];
      if (object.nodeName === SHAPE.Text) {
        object.parsedStyle.textBaseline = 'top';
      }

      // update local position
      object.setLocalPosition(left, top);
    }
  }

  private loadYoga(): Promise<typeof Yoga> {
    const scriptPromise = new Promise((resolve) => {
      const script = document.createElement('script');
      document.body.appendChild(script);
      script.async = true;
      script.onload = resolve;
      script.src = YOGA_UMD_ENTRY;
    });

    return new Promise((resolve) => {
      scriptPromise.then(() => {
        resolve((window as any).Yoga);
      });
    });
  }
}
