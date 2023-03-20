import type {
  Canvas,
  DisplayObject,
  FederatedPointerEvent,
  Rect,
  RenderingPlugin,
  RenderingPluginContext,
} from '@antv/g-lite';
import { CustomEvent, ElementEvent, Group, Shape } from '@antv/g-lite';
import { DrawerEvent, SelectableEvent } from './constants/enum';
import { RectDrawer } from './drawers/rect';
import type { DrawerState } from './interface/drawer';
import {
  getHeightFromBbox,
  getWidthFromBbox,
  renderRect,
} from './rendering/rect-render';
import {
  SelectableCircle,
  SelectablePolyline,
  SelectableRect,
} from './selectable';
import { AbstractSelectable } from './selectable/AbstractSelectable';
import type { Selectable } from './selectable/interface';
import { SelectablePolygon } from './selectable/SelectablePolygon';
import type { AnnotationPluginOptions } from './tokens';

/**
 * Make shape selectable and interactive.
 * @see http://fabricjs.com/
 *
 * @example
 * circle.style.selectable = true;
 *
 * Support the following selection:
 *
 * * Use pointerdown to select a single graphic.
 * * Press `shift` key to multi-select graphics.
 * * Use brush selection.
 */
export class SelectablePlugin implements RenderingPlugin {
  static tag = 'Selectable';

  constructor(private annotationPluginOptions: AnnotationPluginOptions) {}

  /**
   * the topmost operation layer, which will be appended to documentElement directly
   */
  private activeSelectableLayer = new Group({
    className: 'g-annotation-active-layer',
    style: {
      zIndex: 999,
    },
  });

  /**
   * Brush for multi-selection.
   */
  private brush = new RectDrawer({});

  /**
   * selected objects on current canvas
   */
  selected: DisplayObject[] = [];

  /**
   * each selectable has an operation UI
   */
  private selectableMap: Record<number, Selectable> = {};

  /**
   * draw a dashed rect when brushing
   */
  brushRect: Rect;
  canvas: Canvas;

  getSelectedDisplayObjects() {
    return this.selected;
  }

  selectDisplayObject(displayObject: DisplayObject) {
    const selectable = this.getOrCreateSelectableUI(displayObject);
    if (selectable && this.selected.indexOf(displayObject) === -1) {
      selectable.style.visibility = 'visible';
      this.selected.push(displayObject);
      displayObject.dispatchEvent(new CustomEvent(SelectableEvent.SELECTED));

      if (this.annotationPluginOptions.enableAutoSwitchDrawingMode) {
        this.annotationPluginOptions.isDrawingMode = false;
      }
    }
  }

  deselectDisplayObject(displayObject: DisplayObject) {
    const index = this.selected.indexOf(displayObject);
    if (index > -1) {
      const selectable = this.getOrCreateSelectableUI(displayObject);
      if (selectable) {
        selectable.style.visibility = 'hidden';
      }
      this.selected.splice(index, 1);
      displayObject.dispatchEvent(new CustomEvent(SelectableEvent.DESELECTED));

      if (this.annotationPluginOptions.enableAutoSwitchDrawingMode) {
        this.annotationPluginOptions.isDrawingMode = true;
      }
    }
  }

  /**
   * Need re-create SelectableUI for object since its definition was already changed.
   */
  markSelectableUIAsDirty(object: DisplayObject) {
    this.selectableMap[object.entity] = null;
  }

  private deselectAllDisplayObjects() {
    [...this.selected].forEach((target) => {
      this.deselectDisplayObject(target);
    });
  }

  getOrCreateSelectableUI(object: DisplayObject): Selectable {
    if (!this.selectableMap[object.entity]) {
      let constructor: any;
      if (
        object.nodeName === Shape.IMAGE ||
        object.nodeName === Shape.RECT ||
        object.nodeName === Shape.ELLIPSE
      ) {
        constructor = SelectableRect;
      } else if (object.nodeName === Shape.CIRCLE) {
        constructor = SelectableCircle;
      } else if (
        object.nodeName === Shape.LINE ||
        object.nodeName === Shape.POLYLINE
      ) {
        constructor = SelectablePolyline;
      } else if (object.nodeName === Shape.POLYGON) {
        constructor = SelectablePolygon;
      }

      const created: Selectable = new constructor({
        style: {
          target: object,
          ...this.annotationPluginOptions.selectableStyle,
        },
      });

      if (created) {
        created.plugin = this;
        this.selectableMap[object.entity] = created;
        this.activeSelectableLayer.appendChild(created);
      }
    }

    return this.selectableMap[object.entity];
  }

  /**
   * Update all existed selectable UIs.
   * @example
   *
   * plugin.updateSelectableStyle({
   *   selectionStroke: 'red',
   * });
   */
  updateSelectableStyle() {
    const { selectableStyle } = this.annotationPluginOptions;

    for (const entity in this.selectableMap) {
      this.selectableMap[entity].attr(selectableStyle);
    }
  }

  apply(context: RenderingPluginContext) {
    const { renderingService, renderingContext, contextService } = context;
    const $canvas = contextService.getDomElement() as HTMLCanvasElement;
    const document = renderingContext.root.ownerDocument;
    const canvas = document.defaultView as Canvas;
    this.canvas = canvas;

    this.brush.setCanvas(canvas);

    const { brushSelectionSortMode } = this.annotationPluginOptions;

    const getRegionFromToolstate = (toolstate: any) => {
      const { path } = toolstate;
      const [tl] = path;
      const { x, y } = tl;
      const width = getWidthFromBbox(path);
      const height = getHeightFromBbox(path);
      return {
        minX: x,
        minY: y,
        maxX: x + width,
        maxY: y + height,
      };
    };

    // 基于 RBush 空间索引进行快速区域查询
    const regionQuery = (region: {
      minX: number;
      minY: number;
      maxX: number;
      maxY: number;
    }) => {
      return document
        .elementsFromBBox(region.minX, region.minY, region.maxX, region.maxY)
        .filter((intersection) => {
          const { minX, minY, maxX, maxY } = intersection.rBushNode.aabb;
          // @see https://github.com/antvis/G/issues/1242
          const isTotallyContains =
            minX < region.minX &&
            minY < region.minY &&
            maxX > region.maxX &&
            maxY > region.maxY;
          return !isTotallyContains && intersection.style.selectable;
        });
    };

    // 按照框选过程排序后的选中图形列表
    let selectedStack: DisplayObject[][] = [];
    const isSameStackItem = (a: DisplayObject[], b: DisplayObject[]) => {
      if (a.length === 0 && b.length === 0) {
        return true;
      }

      if (a.length !== b.length) {
        return false;
      }

      return a.every((o, i) => o === b[i]);
    };

    const sortSelectedStack = (stack: DisplayObject[][]) => {
      for (let i = 0; i < stack.length; i++) {
        const prev = stack[i - 1];
        if (prev) {
          stack[i].sort((a, b) => {
            const indexA = prev.indexOf(a);
            const indexB = prev.indexOf(b);
            return (
              (indexA === -1 ? Infinity : indexA) -
              (indexB === -1 ? Infinity : indexB)
            );
          });
        }
      }
    };

    const onStart = (toolstate: any) => {
      selectedStack = [];
      this.renderDrawer(toolstate);
    };

    const onMove = (toolstate: any) => {
      this.renderDrawer(toolstate);
    };

    const onModify = (toolstate: any) => {
      if (brushSelectionSortMode === 'behavior') {
        const region = getRegionFromToolstate(toolstate);
        const selected = regionQuery(region);
        const last = selectedStack[selectedStack.length - 1];
        if (!last || !isSameStackItem(selected, last)) {
          selectedStack.push(selected);
        }
      }
      this.renderDrawer(toolstate);
    };

    const onComplete = (toolstate: any) => {
      this.hideDrawer(toolstate);

      if (brushSelectionSortMode === 'behavior') {
        sortSelectedStack(selectedStack);
        selectedStack[selectedStack.length - 1].forEach((selected) => {
          this.selectDisplayObject(selected);
        });
      } else if (brushSelectionSortMode === 'directional') {
        const region = getRegionFromToolstate(toolstate);

        const { start, end } = this.brush;

        // Direction of region, horizontal or vertical?
        const direction =
          region.maxX - region.minX > region.maxY - region.minY ? 'h' : 'v';
        let sortDirection: 'lr' | 'rl' | 'tb' | 'bt';
        if (start.canvas.x < end.canvas.x && start.canvas.y < end.canvas.y) {
          if (direction === 'h') {
            sortDirection = 'lr';
          } else {
            sortDirection = 'tb';
          }
        } else if (
          start.canvas.x > end.canvas.x &&
          start.canvas.y > end.canvas.y
        ) {
          if (direction === 'h') {
            sortDirection = 'rl';
          } else {
            sortDirection = 'bt';
          }
        } else if (
          start.canvas.x < end.canvas.x &&
          start.canvas.y > end.canvas.y
        ) {
          if (direction === 'h') {
            sortDirection = 'lr';
          } else {
            sortDirection = 'bt';
          }
        } else if (
          start.canvas.x > end.canvas.x &&
          start.canvas.y < end.canvas.y
        ) {
          if (direction === 'h') {
            sortDirection = 'rl';
          } else {
            sortDirection = 'tb';
          }
        }

        regionQuery(region)
          .sort((a, b) => {
            const bboxA = a.getBBox();
            const bboxB = b.getBBox();
            if (sortDirection === 'lr') {
              return bboxA.x - bboxB.x;
            } else if (sortDirection === 'rl') {
              return bboxB.x + bboxB.width - (bboxA.x + bboxA.width);
            } else if (sortDirection === 'tb') {
              return bboxA.y - bboxB.y;
            } else if (sortDirection === 'bt') {
              return bboxB.y + bboxB.height - (bboxA.y + bboxA.height);
            }
          })
          .forEach((selected) => {
            this.selectDisplayObject(selected);
          });
      }
    };

    const onCancel = (toolstate: any) => {
      this.hideDrawer(toolstate);
    };

    this.brush.on(DrawerEvent.START, onStart);
    this.brush.on(DrawerEvent.MODIFIED, onModify);
    this.brush.on(DrawerEvent.MOVE, onMove);
    this.brush.on(DrawerEvent.COMPLETE, onComplete);
    this.brush.on(DrawerEvent.CANCEL, onCancel);

    const handleClick = (e: FederatedPointerEvent) => {
      const {
        enableAutoSwitchDrawingMode,
        enableContinuousBrush,
        isDrawingMode,
      } = this.annotationPluginOptions;

      if (!enableAutoSwitchDrawingMode && isDrawingMode) {
        return;
      }

      const object = e.target as DisplayObject;
      // @ts-ignore
      if (object === document) {
        // allow continuous selection @see https://github.com/antvis/G/issues/1240
        if (!e.shiftKey || (e.shiftKey && !enableContinuousBrush)) {
          this.deselectAllDisplayObjects();
          this.selected = [];
        }
      } else if (object.style?.selectable) {
        if (!e.shiftKey) {
          // multi-select
          this.deselectAllDisplayObjects();
        }

        this.selectDisplayObject(object);
      } else if (e.shiftKey) {
        const selectable = e
          .composedPath()
          .find(
            (el) => el instanceof AbstractSelectable,
          ) as AbstractSelectable<any>;
        if (selectable) {
          const { target } = selectable.style;
          // if already selected, deselect it
          if (this.selected.indexOf(target) > -1) {
            this.deselectDisplayObject(target);
          }
        }
      }
    };

    const handleMovingTarget = (e: CustomEvent) => {
      const { dx, dy } = e.detail;
      // move selectableUI at the same time
      const selectable = this.getOrCreateSelectableUI(
        e.target as DisplayObject,
      );
      if (selectable) {
        selectable.moveMask(dx, dy);
      }
    };

    const handleModifiedTarget = (e: CustomEvent) => {
      const target = e.target as DisplayObject;
      const { circle, rect, polyline, polygon } = e.detail;

      if (target.nodeName === Shape.RECT || target.nodeName === Shape.IMAGE) {
        const { x, y, width, height } = rect;
        target.attr({
          x,
          y,
          width,
          height,
        });
      } else if (target.nodeName === Shape.ELLIPSE) {
        const { x, y, width, height } = rect;
        target.attr({
          cx: x,
          cy: y,
          rx: width / 2,
          ry: height / 2,
        });
      } else if (target.nodeName === Shape.LINE) {
        const [[x1, y1], [x2, y2]] = polyline.points;
        target.attr({
          x1,
          y1,
          x2,
          y2,
        });
      } else if (target.nodeName === Shape.POLYLINE) {
        target.attr({
          points: polyline.points,
        });
      } else if (target.nodeName === Shape.POLYGON) {
        target.attr({
          points: polygon.points,
        });
      } else if (target.nodeName === Shape.CIRCLE) {
        const { cx, cy, r } = circle;
        target.attr({
          cx,
          cy,
          r,
        });
      }

      // re-position target
      // target.setPosition(positionX, positionY);

      // if (target.nodeName === Shape.RECT) {
      //   target.attr({
      //     width: maskWidth,
      //     height: maskHeight,
      //   });
      // } else {
      //   target.scale(scaleX, scaleY);
      // }
    };

    const handleMovedTarget = (e: CustomEvent) => {
      const target = e.target as DisplayObject;
      const { circle, rect, polyline, polygon } = e.detail;

      if (target.nodeName === Shape.RECT || target.nodeName === Shape.IMAGE) {
        target.attr({
          x: rect.x,
          y: rect.y,
        });
      } else if (target.nodeName === Shape.ELLIPSE) {
        target.attr({
          cx: rect.x,
          cy: rect.y,
        });
      } else if (target.nodeName === Shape.LINE) {
        const [[x1, y1], [x2, y2]] = polyline.points;
        target.attr({
          x1,
          y1,
          x2,
          y2,
        });
      } else if (target.nodeName === Shape.POLYLINE) {
        target.attr({
          points: polyline.points,
        });
      } else if (target.nodeName === Shape.POLYGON) {
        target.attr({
          points: polygon.points,
        });
      } else if (target.nodeName === Shape.CIRCLE) {
        target.attr({
          cx: circle.cx,
          cy: circle.cy,
        });
      }
    };

    // deselected when removed
    const handleUnmounted = (e: CustomEvent) => {
      this.deselectDisplayObject(e.target as DisplayObject);
    };

    // Use arrow key to move selectable UI.
    const handleKeyDown = (e: KeyboardEvent) => {
      if (this.annotationPluginOptions.isDrawingMode) {
        return;
      }

      if (
        e.key === 'ArrowLeft' ||
        e.key === 'ArrowUp' ||
        e.key === 'ArrowRight' ||
        e.key === 'ArrowDown'
      ) {
        e.stopPropagation();
        e.preventDefault();

        let dx = 0;
        let dy = 0;
        const { arrowKeyStepLength } = this.annotationPluginOptions;
        if (e.key === 'ArrowLeft') {
          dx -= arrowKeyStepLength;
        }
        if (e.key === 'ArrowUp') {
          dy -= arrowKeyStepLength;
        }
        if (e.key === 'ArrowRight') {
          dx += arrowKeyStepLength;
        }
        if (e.key === 'ArrowDown') {
          dy += arrowKeyStepLength;
        }

        // account for multi-selection
        this.selected.forEach((selected) => {
          const selectable = this.getOrCreateSelectableUI(selected);
          if (selectable) {
            selectable.triggerMovingEvent(dx, dy);
            selectable.triggerMovedEvent();
          }
        });
      } else if (
        this.annotationPluginOptions.enableDeleteTargetWithShortcuts &&
        (e.key === 'Escape' || e.key === 'Backspace' || e.key === 'Delete')
      ) {
        /** 退出/删除/回退键 删除 */

        [...this.selected].forEach((target) => {
          target.destroy();
        });

        this.deselectAllDisplayObjects();
      }
    };

    const handleMouseDown = (e: FederatedPointerEvent) => {
      if (!e.shiftKey) {
        return;
      }

      if (e.button === 0) {
        this.brush?.onMouseDown(e);
      }
    };

    const handleMouseMove = (e: FederatedPointerEvent) => {
      if (!e.shiftKey) {
        return;
      }

      this.brush?.onMouseMove(e);
    };

    const handleMouseUp = (e: FederatedPointerEvent) => {
      if (!e.shiftKey) {
        return;
      }

      if (e.button === 0) {
        this.brush?.onMouseUp(e);
      }
    };

    renderingService.hooks.init.tapPromise(SelectablePlugin.tag, async () => {
      canvas.addEventListener('pointerdown', handleClick);
      canvas.addEventListener('pointerdown', handleMouseDown);
      canvas.addEventListener('pointermove', handleMouseMove);
      canvas.addEventListener('pointerup', handleMouseUp);
      canvas.addEventListener(ElementEvent.UNMOUNTED, handleUnmounted);
      $canvas.setAttribute('tabindex', '0');
      $canvas.addEventListener('keydown', handleKeyDown);
      canvas.appendChild(this.activeSelectableLayer);

      canvas.addEventListener(SelectableEvent.MOVED, handleMovedTarget);
      canvas.addEventListener(SelectableEvent.MODIFIED, handleModifiedTarget);
      canvas.addEventListener(SelectableEvent.MOVING, handleMovingTarget);
    });

    renderingService.hooks.destroy.tap(SelectablePlugin.tag, () => {
      canvas.removeEventListener('pointerdown', handleClick);
      canvas.removeEventListener('pointerdown', handleMouseDown);
      canvas.removeEventListener('pointermove', handleMouseMove);
      canvas.removeEventListener('pointerup', handleMouseUp);
      canvas.removeEventListener(ElementEvent.UNMOUNTED, handleUnmounted);
      $canvas.removeAttribute('tabindex');
      $canvas.removeEventListener('keydown', handleKeyDown);
      canvas.removeChild(this.activeSelectableLayer);

      canvas.removeEventListener(SelectableEvent.MOVED, handleMovedTarget);
      canvas.removeEventListener(
        SelectableEvent.MODIFIED,
        handleModifiedTarget,
      );
      canvas.removeEventListener(SelectableEvent.MOVING, handleMovingTarget);
    });
  }

  private renderDrawer(anno: DrawerState) {
    if (anno.type === 'rect') {
      // @ts-ignore
      renderRect(this, anno);
    }
  }

  private hideDrawer(anno: DrawerState) {
    if (anno.type === 'rect') {
      if (this.brushRect) {
        this.brushRect.style.visibility = 'hidden';
      }
    }
  }
}
