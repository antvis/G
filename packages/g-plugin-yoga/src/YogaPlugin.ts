import { inject, singleton } from 'mana-syringe';
import {
  AABB,
  RenderingPluginContribution,
  SceneGraphService,
  RenderingContext,
  ElementEvent,
  Shape,
  UnitType,
} from '@antv/g';
import type {
  FederatedEvent,
  RenderingService,
  RenderingPlugin,
  MutationEvent,
  DisplayObject,
  ParsedBaseStyleProps,
  ParsedRectStyleProps,
  ParsedTextStyleProps,

  CSSUnitValue} from '@antv/g';
import type {
  YogaFlexDirection,
  YogaNode,
  YogaJustifyContent,
  YogaAlign,
  YogaFlexWrap,
  YogaPositionType,
  YogaDisplay,
  YogaEdge,
} from 'yoga-layout-prebuilt';
import Yoga, {
  FLEX_DIRECTION_ROW,
  ALIGN_FLEX_START,
  EDGE_TOP,
  EDGE_RIGHT,
  EDGE_BOTTOM,
  EDGE_LEFT,
  POSITION_TYPE_RELATIVE,
} from 'yoga-layout-prebuilt';
import { YogaPluginOptions } from './tokens';
import { YogaConstants } from './constants';

import YogaEdges = YogaConstants.YogaEdges;
// import ComputedLayout = YogaConstants.ComputedLayout;
import FlexDirection = YogaConstants.FlexDirection;
import JustifyContent = YogaConstants.JustifyContent;
import Align = YogaConstants.Align;
import FlexWrap = YogaConstants.FlexWrap;
import Display = YogaConstants.Display;
import PositionType = YogaConstants.PositionType;

export type PixelsOrPercentage = number | string;
export type YogaSize = PixelsOrPercentage | 'auto';

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

  private needRecalculateLayout = true;

  apply(renderingService: RenderingService) {
    /**
     * create YogaNode for every displayObject
     */
    const handleMounted = (e: FederatedEvent) => {
      const target = e.target as DisplayObject;

      const node = Yoga.Node.create();
      this.nodes[target.entity] = node;

      // set default values according to flex spec
      this.setDefaultValues(node);

      // sync YogaNode attributes
      this.syncAttributes(target, target.attributes, target.parsedStyle);

      // mount to parent
      const parent = target.parentElement as DisplayObject;
      const parentNode = this.nodes[parent.entity];
      if (parentNode) {
        const i = parent.children.indexOf(target);
        parentNode.insertChild(node, i);
      }

      // resize according to target's bounds
      this.resizeYogaNode(target);
      this.needRecalculateLayout = true;
    };

    /**
     * destroy YogaNode
     */
    const handleUnmounted = (e: FederatedEvent) => {
      const target = e.target as DisplayObject;
      const node = this.nodes[(target as DisplayObject).entity];
      if (node) {
        Yoga.Node.destroy(node);
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

    const handleAttributeChanged = (e: MutationEvent) => {
      const target = e.target as DisplayObject;
      // use parsed value, eg. `top: 10` instead of `top: '10'`
      const { attrName, newValue, newParsedValue } = e;
      const needRecalculateLayout = this.syncAttributes(
        target,
        {
          [attrName]: newValue,
        },
        {
          [attrName]: newParsedValue,
        },
      );

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
      this.needRecalculateLayout = true;
    };

    renderingService.hooks.init.tap(YogaPlugin.tag, () => {
      this.renderingContext.root.addEventListener(ElementEvent.MOUNTED, handleMounted);
      this.renderingContext.root.addEventListener(ElementEvent.UNMOUNTED, handleUnmounted);
      this.renderingContext.root.addEventListener(ElementEvent.INSERTED, handleInserted);
      this.renderingContext.root.addEventListener(ElementEvent.REMOVED, handleRemoved);
      this.renderingContext.root.addEventListener(ElementEvent.BOUNDS_CHANGED, handleBoundsChanged);
      this.renderingContext.root.addEventListener(
        ElementEvent.ATTR_MODIFIED,
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
        ElementEvent.ATTR_MODIFIED,
        handleAttributeChanged,
      );
    });

    // const printYogaTree = (node: YogaNode) => {
    //   console.log(node, node.getComputedLayout());

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

        // printYogaTree(rootNode);
      }
    });
  }

  /**
   * resize YogaNode according to target's bounds,
   * support absolute pixel value or percentage
   */
  private resizeYogaNode(object: DisplayObject) {
    const node = this.nodes[object.entity];
    if (node) {
      // block element use user-defined width/height
      if (
        object.nodeName === Shape.GROUP ||
        object.nodeName === Shape.RECT ||
        object.nodeName === Shape.IMAGE
      ) {
        const { width, height } = object.parsedStyle as ParsedRectStyleProps;
        this.setWidth(node, object.style.width, width);
        this.setHeight(node, object.style.height, height);
      } else {
        let bounds: AABB;
        // flex container
        if (this.isFlex(object)) {
          bounds = object.getGeometryBounds();
        } else {
          bounds = object.getBounds();
        }
        if (!AABB.isEmpty(bounds)) {
          const [halfWidth, halfHeight] = bounds.halfExtents;
          node.setWidth(halfWidth * 2);
          node.setHeight(halfHeight * 2);
        }

        if (object.nodeName === Shape.TEXT) {
          // @ts-ignore
          const { wordWrap, width } = object.parsedStyle as ParsedTextStyleProps;

          if (wordWrap) {
            this.setWidth(node, object.style.width, width);
            node.setHeightAuto();
          }
        }
      }
    }
  }

  /**
   * sync YogaNode
   */
  private syncAttributes(
    object: DisplayObject,
    raw: Record<string, any>,
    parsed: Record<string, any>,
  ): boolean {
    const node = this.nodes[object.entity];
    const { yogaUpdatingFlag } = object.style;

    // TODO: border, gap

    let needRecalculateLayout = false;
    Object.keys(parsed).forEach((attributeName) => {
      const newValue = parsed[attributeName];
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
        const margin = newValue;
        YogaEdges.forEach((edge, index) => {
          const value = margin[index];
          this.setPadding(node, edge, value);
        });
        needRecalculateLayout = true;
      } else if (attributeName === 'paddingAll') {
        const padding = [newValue, newValue, newValue, newValue];
        YogaEdges.forEach((edge, index) => {
          const value = padding[index];
          this.setPadding(node, edge, value);
        });
        needRecalculateLayout = true;
      } else if (attributeName === 'paddingTop') {
        this.setPadding(node, EDGE_TOP, newValue);
        needRecalculateLayout = true;
      } else if (attributeName === 'paddingRight') {
        this.setPadding(node, EDGE_RIGHT, newValue);
        needRecalculateLayout = true;
      } else if (attributeName === 'paddingBottom') {
        this.setPadding(node, EDGE_BOTTOM, newValue);
        needRecalculateLayout = true;
      } else if (attributeName === 'paddingLeft') {
        this.setPadding(node, EDGE_LEFT, newValue);
        needRecalculateLayout = true;
      } else if (attributeName === 'margin') {
        const margin = newValue;
        YogaEdges.forEach((edge, index) => {
          const value = margin[index];
          this.setMargin(node, edge, value);
        });
        needRecalculateLayout = true;
      } else if (attributeName === 'marginAll') {
        const margin = [newValue, newValue, newValue, newValue];
        YogaEdges.forEach((edge, index) => {
          const value = margin[index];
          this.setMargin(node, edge, value);
        });
        needRecalculateLayout = true;
      } else if (attributeName === 'marginTop') {
        this.setMargin(node, EDGE_TOP, newValue);
        needRecalculateLayout = true;
      } else if (attributeName === 'marginRight') {
        this.setMargin(node, EDGE_RIGHT, newValue);
        needRecalculateLayout = true;
      } else if (attributeName === 'marginBottom') {
        this.setMargin(node, EDGE_BOTTOM, newValue);
        needRecalculateLayout = true;
      } else if (attributeName === 'marginLeft') {
        this.setMargin(node, EDGE_LEFT, newValue);
        needRecalculateLayout = true;
      } else if (attributeName === 'top') {
        this.setPosition(node, EDGE_TOP, newValue);
        needRecalculateLayout = true;
      } else if (attributeName === 'right') {
        this.setPosition(node, EDGE_RIGHT, newValue);
        needRecalculateLayout = true;
      } else if (attributeName === 'bottom') {
        this.setPosition(node, EDGE_BOTTOM, newValue);
        needRecalculateLayout = true;
      } else if (attributeName === 'left') {
        this.setPosition(node, EDGE_LEFT, newValue);
        needRecalculateLayout = true;
      } else if (attributeName === 'minWidth') {
        this.setMinWidth(node, newValue);
        needRecalculateLayout = true;
      } else if (attributeName === 'minHeight') {
        this.setMinHeight(node, newValue);
        needRecalculateLayout = true;
      } else if (attributeName === 'maxWidth') {
        this.setMaxWidth(node, newValue);
        needRecalculateLayout = true;
      } else if (attributeName === 'maxHeight') {
        this.setMaxHeight(node, newValue);
        needRecalculateLayout = true;
      } else if (attributeName === 'display') {
        node.setDisplay(<YogaDisplay>YogaConstants.Display[newValue as keyof typeof Display]);
        needRecalculateLayout = true;
      } else if (attributeName === 'width' && !yogaUpdatingFlag) {
        this.setWidth(node, raw.width, newValue);
      } else if (attributeName === 'height' && !yogaUpdatingFlag) {
        this.setHeight(node, raw.height, newValue);
      }
    });

    return needRecalculateLayout;
  }

  private isFlex(object: DisplayObject) {
    return object?.parsedStyle?.display === 'flex';
  }

  private setDefaultValues(node: YogaNode) {
    // set default values
    node.setFlexDirection(FLEX_DIRECTION_ROW);
    node.setAlignItems(ALIGN_FLEX_START);
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
    node.setPositionType(POSITION_TYPE_RELATIVE);
    node.setFlexGrow(0);
    node.setFlexBasis(NaN);
    node.setFlexShrink(1);
  }

  private setMargin(node: YogaNode, edge: YogaEdge, parsed: CSSUnitValue) {
    const { unit, value } = parsed;

    if (unit === UnitType.kNumber || unit === UnitType.kPixels) {
      node.setMargin(edge, value);
    } else if (unit === UnitType.kPercentage) {
      node.setMarginPercent(edge, value);
    }

    // if (value === 'auto') {
    //   node.setMarginAuto(edge);
    // } else if (typeof value === 'string') {
    //   node.setMarginPercent(edge, this.getPercent(value));
    // } else {
    //   node.setMargin(edge, value);
    // }
  }

  private setPadding(node: YogaNode, edge: YogaEdge, parsed: CSSUnitValue) {
    const { unit, value } = parsed;

    if (unit === UnitType.kNumber || unit === UnitType.kPixels) {
      node.setPadding(edge, value);
    } else if (unit === UnitType.kPercentage) {
      node.setPaddingPercent(edge, value);
    }
  }

  private setPosition(node: YogaNode, edge: YogaEdge, parsed: CSSUnitValue) {
    const { unit, value } = parsed;
    if (unit === UnitType.kNumber || unit === UnitType.kPixels) {
      node.setPosition(edge, value);
    } else if (unit === UnitType.kPercentage) {
      node.setPositionPercent(edge, value);
    }
  }

  private setWidth(node: YogaNode, raw: any, parsed: CSSUnitValue) {
    if (raw === 'auto') {
      node.setWidthAuto();
    } else {
      const { unit, value } = parsed;
      if (unit === UnitType.kNumber || unit === UnitType.kPixels) {
        node.setWidth(value);
      } else if (unit === UnitType.kPercentage) {
        node.setWidthPercent(value);
      }
    }
  }
  private setHeight(node: YogaNode, raw: any, parsed: CSSUnitValue) {
    if (raw === 'auto') {
      node.setHeightAuto();
    } else {
      const { unit, value } = parsed;

      if (unit === UnitType.kNumber || unit === UnitType.kPixels) {
        node.setHeight(value);
      } else if (unit === UnitType.kPercentage) {
        node.setHeightPercent(value);
      }
    }
  }
  private setMaxWidth(node: YogaNode, parsed: CSSUnitValue) {
    const { unit, value } = parsed;
    if (unit === UnitType.kNumber || unit === UnitType.kPixels) {
      node.setMaxWidth(value);
    } else if (unit === UnitType.kPercentage) {
      node.setMaxWidthPercent(value);
    }
  }
  private setMinWidth(node: YogaNode, parsed: CSSUnitValue) {
    const { unit, value } = parsed;
    if (unit === UnitType.kNumber || unit === UnitType.kPixels) {
      node.setMinWidth(value);
    } else if (unit === UnitType.kPercentage) {
      node.setMinWidthPercent(value);
    }
  }
  private setMaxHeight(node: YogaNode, parsed: CSSUnitValue) {
    const { unit, value } = parsed;
    if (unit === UnitType.kNumber || unit === UnitType.kPixels) {
      node.setMaxHeight(value);
    } else if (unit === UnitType.kPercentage) {
      node.setMaxHeightPercent(value);
    }
  }
  private setMinHeight(node: YogaNode, parsed: CSSUnitValue) {
    const { unit, value } = parsed;
    if (unit === UnitType.kNumber || unit === UnitType.kPixels) {
      node.setMinHeight(value);
    } else if (unit === UnitType.kPercentage) {
      node.setMinHeightPercent(value);
    }
  }

  private updateDisplayObjectPosition(object: DisplayObject, node: YogaNode) {
    const isInFlexContainer = this.isFlex(object?.parentElement as DisplayObject);
    if (isInFlexContainer) {
      const layout = node.getComputedLayout();
      let { top, left } = layout;
      const { width, height } = layout;
      // update size, only Rect & Image can be updated
      object.style.yogaUpdatingFlag = true;
      object.style.width = width;
      object.style.height = height;
      object.style.yogaUpdatingFlag = false;

      const { anchor } = object.parsedStyle as ParsedBaseStyleProps;

      // calculate local position instead of modify origin directly
      left += anchor[0].value * width;
      top += anchor[1].value * height;

      if (object.nodeName === Shape.TEXT) {
        object.style.textBaseline = 'top';
        if (object.style.wordWrap) {
          object.style.wordWrapWidth = width;
        }
      }

      // update local position
      object.setLocalPosition(left, top);
    }
  }
}
