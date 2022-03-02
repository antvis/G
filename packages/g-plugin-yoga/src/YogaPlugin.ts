import { inject, singleton } from 'mana-syringe';
import {
  DisplayObjectPool,
  RenderingService,
  RenderingPlugin,
  RenderingPluginContribution,
  SceneGraphService,
  RenderingContext,
  ElementEvent,
  DisplayObject,
  IElement,
} from '@antv/g';
import type { Element, FederatedEvent } from '@antv/g';
import Yoga, {
  YogaNode,
  FLEX_DIRECTION_ROW,
  ALIGN_FLEX_START,
  YogaFlexDirection,
  YogaJustifyContent,
  YogaAlign,
  YogaFlexWrap,
  YogaPositionType,
  EDGE_TOP,
  EDGE_RIGHT,
  EDGE_BOTTOM,
  EDGE_LEFT,
  YogaDisplay,
} from 'yoga-layout-prebuilt';
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

export type PixelsOrPercentage = number | string;
export type YogaSize = PixelsOrPercentage | 'pixi' | 'auto';

@singleton({ contrib: RenderingPluginContribution })
export class YogaPlugin implements RenderingPlugin {
  static tag = 'YogaPlugin';

  @inject(SceneGraphService)
  protected sceneGraphService: SceneGraphService;

  @inject(RenderingContext)
  private renderingContext: RenderingContext;

  @inject(DisplayObjectPool)
  private displayObjectPool: DisplayObjectPool;

  @inject(YogaPluginOptions)
  private options: YogaPluginOptions;

  private nodes: Record<number, YogaNode> = {};

  apply(renderingService: RenderingService) {
    renderingService.hooks.init.tap(YogaPlugin.tag, () => {
      this.renderingContext.root.addEventListener(ElementEvent.MOUNTED, handleMounted);
      this.renderingContext.root.addEventListener(ElementEvent.UNMOUNTED, handleUnmounted);
      this.renderingContext.root.addEventListener(ElementEvent.INSERTED, handleInserted);
      this.renderingContext.root.addEventListener(ElementEvent.REMOVED, handleRemoved);
      this.renderingContext.root.addEventListener(ElementEvent.BOUNDS_CHANGED, handleBoundsChanged);
      this.renderingContext.root.addEventListener(
        ElementEvent.ATTRIBUTE_CHANGED,
        handleAttributeChanged,
      );
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

      // destroy all nodes
      Object.keys(this.nodes).forEach((key) => {
        const node = this.nodes[key] as Yoga.YogaNode;
        Yoga.Node.destroy(node);
      });
      this.nodes = {};
    });

    renderingService.hooks.beginFrame.tap(YogaPlugin.tag, () => {
      this.toSync.forEach((object) => {
        const node = this.nodes[object.entity];
        if (node) {
          const bounds = object.getBounds();
          if (bounds) {
            const [minX, minY] = bounds.getMin();
            const [maxX, maxY] = bounds.getMax();
            node.setWidth(maxX - minX);
            node.setHeight(maxY - minY);
            node.calculateLayout();

            // console.log('calc', object.id);

            this.updateDisplayObjectPosition(object, node);
          }
        }
      });
      this.toSync.clear();
    });

    const handleMounted = (e: FederatedEvent) => {
      const target = e.target as DisplayObject;

      const node = Yoga.Node.create();
      this.nodes[target.entity] = node;

      // default values
      node.setFlexDirection(FLEX_DIRECTION_ROW);
      node.setAlignItems(ALIGN_FLEX_START);
      node.setAlignContent(ALIGN_FLEX_START);
      node.setWidth('auto');
      node.setHeight('auto');

      // sync YogaNode
      const needRecalculateLayout = this.syncAttributes(target, target.parsedStyle);
      // if (needRecalculateLayout) {
      //   this.requestLayoutUpdate(target);
      // }
    };

    const handleUnmounted = (e: FederatedEvent) => {
      const target = e.target as DisplayObject;
      const parent = target.parentElement as DisplayObject;
      if (parent) {
        const parentNode = this.nodes[parent.entity];
        // if (parentNode) {
        //   this.requestLayoutUpdate(parent);
        // }
      }

      const node = this.nodes[target.entity];
      if (node) {
        Yoga.Node.destroy(node);
        delete this.nodes[target.entity];
      }
    };

    const handleInserted = (e: FederatedEvent) => {
      const child = e.target as DisplayObject;
      const { parent, index } = e.detail;

      const childNode = this.nodes[child.entity];
      const parentNode = this.nodes[parent.entity];

      parentNode.insertChild(childNode, index || parentNode.getChildCount());
    };

    const handleRemoved = (e: FederatedEvent) => {
      const child = e.target as DisplayObject;
      const parent = e.detail.parent as DisplayObject;

      const childNode = this.nodes[child.entity];
      const parentNode = this.nodes[parent.entity];

      parentNode.removeChild(childNode);
    };

    const handleAttributeChanged = (e: FederatedEvent) => {
      const target = e.target as DisplayObject;
      const node = this.nodes[target.entity];
      const { attributeName, newValue } = e.detail;
      const needRecalculateLayout = this.syncAttributes(target, {
        [attributeName]: newValue,
      });

      if (needRecalculateLayout) {
        this.requestLayoutUpdate(target);
      }
    };

    const handleBoundsChanged = (e: FederatedEvent) => {
      const object = e.target as DisplayObject;
      // skip if this object mounted on another scenegraph root
      if (object.ownerDocument?.documentElement !== this.renderingContext.root) {
        return;
      }

      object.forEach((node: DisplayObject) => {
        this.pushToSync([node]);
      });

      // @ts-ignore
      this.pushToSync(e.composedPath().slice(0, -2));
    };
  }

  private toSync = new Set<DisplayObject>();
  private pushToSync(list: DisplayObject[]) {
    list.forEach((i) => {
      this.toSync.add(i);
    });
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
      }
    });

    return needRecalculateLayout;
  }

  private findFlexRoot(object: DisplayObject): DisplayObject {
    let currentNode: IElement = object;
    while (currentNode.parentElement) {
      if (currentNode.parentElement?.parsedStyle?.display === 'flex') {
        return currentNode.parentElement as DisplayObject;
      }
      currentNode = currentNode.parentElement;
    }
    return null;
  }

  private updateLayout(object: DisplayObject): void {
    const node = this.nodes[object.entity];
    if (node) {
      node.calculateLayout();
      this.updateDisplayObjectPosition(object, node);
    }

    object.children.forEach((child: DisplayObject) => {
      this.updateLayout(child);
    });
  }

  private requestLayoutUpdate(object: DisplayObject) {
    const root = this.findFlexRoot(object);
    this.updateLayout(root || object);
  }

  private updateDisplayObjectPosition(object: DisplayObject, node: Yoga.YogaNode) {
    const isInFlexContainer = object?.parentElement?.parsedStyle?.display === 'flex';
    if (isInFlexContainer) {
      const layout = node.getComputedLayout();
      const { top, left } = layout;
      object.setLocalPosition(left, top);

      // console.log(object.id, layout);
    }
  }
}
