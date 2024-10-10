import type {
  CSSUnitValue,
  DisplayObject,
  FederatedEvent,
  MutationEvent,
  RenderingPlugin,
  RenderingPluginContext,
} from '@antv/g-lite';
import {
  AABB,
  CSSKeywordValue,
  ElementEvent,
  Shape,
  UnitType,
} from '@antv/g-lite';
import type {
  YogaAlign,
  YogaDisplay,
  YogaEdge,
  YogaFlexDirection,
  YogaFlexWrap,
  YogaJustifyContent,
  YogaNode,
  YogaPositionType,
} from 'yoga-layout-prebuilt';
import Yoga, {
  ALIGN_FLEX_START,
  EDGE_BOTTOM,
  EDGE_LEFT,
  EDGE_RIGHT,
  EDGE_TOP,
  FLEX_DIRECTION_ROW,
  POSITION_TYPE_RELATIVE,
} from 'yoga-layout-prebuilt';
import { YogaConstants } from './constants';
import type { YogaPluginOptions } from './interfaces';

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

export class YogaPlugin implements RenderingPlugin {
  static tag = 'Yoga';

  constructor(private options: YogaPluginOptions) {}

  // displayObject.entity -> YogaNode
  private nodes: Record<number, YogaNode> = {};

  private needRecalculateLayout = true;

  apply(context: RenderingPluginContext) {
    const { renderingService, renderingContext } = context;
    const canvas = renderingContext.root.ownerDocument.defaultView;
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
      this.syncAttributes(target, target.computedStyle);

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
      const node = this.nodes[target.entity];
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
      // use parsed value instead of used value, eg. `top: 10` instead of `top: '10'`
      const { attrName } = e;
      const needRecalculateLayout = this.syncAttributes(target, {
        [attrName]: target.computedStyle[attrName],
      });

      if (needRecalculateLayout) {
        this.needRecalculateLayout = true;
      }
    };

    const handleBoundsChanged = (e: FederatedEvent) => {
      const object = e.target as DisplayObject;
      // skip if this object mounted on another scenegraph root
      if (object.ownerDocument?.documentElement !== renderingContext.root) {
        return;
      }
      this.needRecalculateLayout = true;
    };

    renderingService.hooks.init.tap(YogaPlugin.tag, () => {
      canvas.addEventListener(ElementEvent.MOUNTED, handleMounted);
      canvas.addEventListener(ElementEvent.UNMOUNTED, handleUnmounted);
      canvas.addEventListener(ElementEvent.INSERTED, handleInserted);
      canvas.addEventListener(ElementEvent.REMOVED, handleRemoved);
      canvas.addEventListener(ElementEvent.BOUNDS_CHANGED, handleBoundsChanged);
      canvas.addEventListener(
        ElementEvent.ATTR_MODIFIED,
        handleAttributeChanged,
      );
    });

    renderingService.hooks.destroy.tap(YogaPlugin.tag, () => {
      canvas.removeEventListener(ElementEvent.MOUNTED, handleMounted);
      canvas.removeEventListener(ElementEvent.UNMOUNTED, handleUnmounted);
      canvas.removeEventListener(ElementEvent.INSERTED, handleInserted);
      canvas.removeEventListener(ElementEvent.REMOVED, handleRemoved);
      canvas.removeEventListener(
        ElementEvent.BOUNDS_CHANGED,
        handleBoundsChanged,
      );
      canvas.removeEventListener(
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
        const rootNode = this.nodes[renderingContext.root.entity];
        rootNode.calculateLayout();
        renderingContext.root.forEach((object: DisplayObject) => {
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
        const { width, height } = object.computedStyle;
        this.setWidth(node, width);
        this.setHeight(node, height);
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
          const { wordWrap, width } = object.computedStyle;

          if (wordWrap) {
            this.setWidth(node, width);
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
          <YogaFlexDirection>(
            YogaConstants.FlexDirection[newValue as keyof typeof FlexDirection]
          ),
        );
        needRecalculateLayout = true;
      } else if (attributeName === 'justifyContent') {
        node.setJustifyContent(
          <YogaJustifyContent>(
            YogaConstants.JustifyContent[
              newValue as keyof typeof JustifyContent
            ]
          ),
        );
        needRecalculateLayout = true;
      } else if (attributeName === 'alignContent') {
        node.setAlignContent(
          <YogaAlign>YogaConstants.Align[newValue as keyof typeof Align],
        );
        needRecalculateLayout = true;
      } else if (attributeName === 'alignItems') {
        node.setAlignItems(
          <YogaAlign>YogaConstants.Align[newValue as keyof typeof Align],
        );
        needRecalculateLayout = true;
      } else if (attributeName === 'alignSelf') {
        node.setAlignSelf(
          <YogaAlign>YogaConstants.Align[newValue as keyof typeof Align],
        );
        needRecalculateLayout = true;
      } else if (attributeName === 'flexWrap') {
        node.setFlexWrap(
          <YogaFlexWrap>(
            YogaConstants.FlexWrap[newValue as keyof typeof FlexWrap]
          ),
        );
        needRecalculateLayout = true;
      } else if (attributeName === 'flexGrow') {
        node.setFlexGrow((newValue as CSSUnitValue).value);
        needRecalculateLayout = true;
      } else if (attributeName === 'flexShrink') {
        node.setFlexShrink((newValue as CSSUnitValue).value);
        needRecalculateLayout = true;
      } else if (attributeName === 'flexBasis') {
        node.setFlexBasis((newValue as CSSUnitValue).value);
        needRecalculateLayout = true;
      } else if (attributeName === 'position') {
        node.setPositionType(
          <YogaPositionType>(
            YogaConstants.PositionType[newValue as keyof typeof PositionType]
          ),
        );
        needRecalculateLayout = true;
      } else if (attributeName === 'padding') {
        const margin = newValue as [
          CSSUnitValue,
          CSSUnitValue,
          CSSUnitValue,
          CSSUnitValue,
        ];
        YogaEdges.forEach((edge, index) => {
          const value = margin[index];
          this.setPadding(node, edge, value);
        });
        needRecalculateLayout = true;
      } else if (attributeName === 'paddingAll') {
        const padding = [newValue, newValue, newValue, newValue] as [
          CSSUnitValue,
          CSSUnitValue,
          CSSUnitValue,
          CSSUnitValue,
        ];
        YogaEdges.forEach((edge, index) => {
          const value = padding[index];
          this.setPadding(node, edge, value);
        });
        needRecalculateLayout = true;
      } else if (attributeName === 'paddingTop') {
        this.setPadding(node, EDGE_TOP, newValue as CSSUnitValue);
        needRecalculateLayout = true;
      } else if (attributeName === 'paddingRight') {
        this.setPadding(node, EDGE_RIGHT, newValue as CSSUnitValue);
        needRecalculateLayout = true;
      } else if (attributeName === 'paddingBottom') {
        this.setPadding(node, EDGE_BOTTOM, newValue as CSSUnitValue);
        needRecalculateLayout = true;
      } else if (attributeName === 'paddingLeft') {
        this.setPadding(node, EDGE_LEFT, newValue as CSSUnitValue);
        needRecalculateLayout = true;
      } else if (attributeName === 'margin') {
        const margin = newValue as [
          CSSUnitValue,
          CSSUnitValue,
          CSSUnitValue,
          CSSUnitValue,
        ];
        YogaEdges.forEach((edge, index) => {
          const value = margin[index];
          this.setMargin(node, edge, value);
        });
        needRecalculateLayout = true;
      } else if (attributeName === 'marginAll') {
        const margin = [newValue, newValue, newValue, newValue] as [
          CSSUnitValue,
          CSSUnitValue,
          CSSUnitValue,
          CSSUnitValue,
        ];
        YogaEdges.forEach((edge, index) => {
          const value = margin[index];
          this.setMargin(node, edge, value);
        });
        needRecalculateLayout = true;
      } else if (attributeName === 'marginTop') {
        this.setMargin(node, EDGE_TOP, newValue as CSSUnitValue);
        needRecalculateLayout = true;
      } else if (attributeName === 'marginRight') {
        this.setMargin(node, EDGE_RIGHT, newValue as CSSUnitValue);
        needRecalculateLayout = true;
      } else if (attributeName === 'marginBottom') {
        this.setMargin(node, EDGE_BOTTOM, newValue as CSSUnitValue);
        needRecalculateLayout = true;
      } else if (attributeName === 'marginLeft') {
        this.setMargin(node, EDGE_LEFT, newValue as CSSUnitValue);
        needRecalculateLayout = true;
      } else if (attributeName === 'top') {
        this.setPosition(node, EDGE_TOP, newValue as CSSUnitValue);
        needRecalculateLayout = true;
      } else if (attributeName === 'right') {
        this.setPosition(node, EDGE_RIGHT, newValue as CSSUnitValue);
        needRecalculateLayout = true;
      } else if (attributeName === 'bottom') {
        this.setPosition(node, EDGE_BOTTOM, newValue as CSSUnitValue);
        needRecalculateLayout = true;
      } else if (attributeName === 'left') {
        this.setPosition(node, EDGE_LEFT, newValue as CSSUnitValue);
        needRecalculateLayout = true;
      } else if (attributeName === 'minWidth') {
        this.setMinWidth(node, newValue as CSSUnitValue);
        needRecalculateLayout = true;
      } else if (attributeName === 'minHeight') {
        this.setMinHeight(node, newValue as CSSUnitValue);
        needRecalculateLayout = true;
      } else if (attributeName === 'maxWidth') {
        this.setMaxWidth(node, newValue as CSSUnitValue);
        needRecalculateLayout = true;
      } else if (attributeName === 'maxHeight') {
        this.setMaxHeight(node, newValue as CSSUnitValue);
        needRecalculateLayout = true;
      } else if (attributeName === 'display') {
        node.setDisplay(
          <YogaDisplay>YogaConstants.Display[newValue as keyof typeof Display],
        );
        needRecalculateLayout = true;
      } else if (attributeName === 'width' && !yogaUpdatingFlag) {
        this.setWidth(node, newValue as CSSUnitValue | CSSKeywordValue);
      } else if (attributeName === 'height' && !yogaUpdatingFlag) {
        this.setHeight(node, newValue as CSSUnitValue | CSSKeywordValue);
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

  private setWidth(node: YogaNode, parsed: CSSUnitValue | CSSKeywordValue) {
    if (parsed instanceof CSSKeywordValue) {
      if (parsed.value === 'auto') {
        node.setWidthAuto();
      }
    } else {
      const { unit, value } = parsed;
      if (unit === UnitType.kNumber || unit === UnitType.kPixels) {
        node.setWidth(value);
      } else if (unit === UnitType.kPercentage) {
        node.setWidthPercent(value);
      }
    }
  }
  private setHeight(node: YogaNode, parsed: CSSUnitValue | CSSKeywordValue) {
    if (parsed instanceof CSSKeywordValue) {
      if (parsed.value === 'auto') {
        node.setHeightAuto();
      }
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
    const isInFlexContainer = this.isFlex(
      object?.parentElement as DisplayObject,
    );
    if (isInFlexContainer) {
      const layout = node.getComputedLayout();
      const { top, left } = layout;
      const { width, height } = layout;
      // update size, only Rect & Image can be updated
      object.style.yogaUpdatingFlag = true;
      object.style.width = width;
      object.style.height = height;
      object.style.yogaUpdatingFlag = false;

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
