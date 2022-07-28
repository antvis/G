import type {
  Canvas,
  DisplayObject,
  FederatedEvent,
  RenderingPlugin,
  RenderingService,
} from '@antv/g';
import {
  ElementEvent,
  Group,
  inject,
  RenderingContext,
  RenderingPluginContribution,
  Shape,
  singleton,
} from '@antv/g';
import { EventEmitter } from 'eventemitter3';
import { DrawerTool } from './constants/enum';
import { CircleDrawer } from './drawers/circle';
import { PolygonDrawer } from './drawers/polygon';
import { PolylineDrawer } from './drawers/polyline';
import { RectDrawer } from './drawers/rect';
import type { Annotation } from './interface/annotation';
import type { BaseDrawer } from './interface/drawer';
import { renderCircle } from './rendering/circle-render';
import { renderPolygon } from './rendering/polygon-render';
import { renderPolyline } from './rendering/polyline-render';
import { renderRect } from './rendering/rect-render';
import { SelectablePolyline } from './selectable/SelectablePolyline';
import { SelectableRect } from './selectable/SelectableRect';
import { AnnotationPluginOptions } from './tokens';

/**
 * make shape selectable:
 * @example
 * circle.style.selectable = true;
 */
@singleton({ contrib: RenderingPluginContribution })
export class AnnotationPlugin implements RenderingPlugin {
  static tag = 'Annotation';

  @inject(RenderingContext)
  private renderingContext: RenderingContext;

  @inject(AnnotationPluginOptions)
  private annotationPluginOptions: AnnotationPluginOptions;

  /**
   * the topmost operation layer
   */
  private activeSelectableLayer = new Group({
    className: 'g-annotation-active-layer',
    style: {
      zIndex: 999,
    },
  });

  /**
   * selected objects on current canvas
   */
  private selected: DisplayObject[] = [];

  /**
   * each selectable has an operation UI
   */
  private selectableMap: Record<number, DisplayObject> = {};

  private annotations: Annotation[] = [];
  private undoStack: Annotation[] = [];
  private redoStack: Annotation[] = [];
  private hotkeyActive: boolean = false;
  public drawer: BaseDrawer;
  public emmiter = new EventEmitter();
  public canvas: Canvas;

  /**
   *
   * @param id
   * @returns
   */
  private getAnnotationObjects(id: string) {
    return this.canvas.document.getElementsByClassName(id);
  }

  /**
   * 取消标注（仅从画布移除）
   * @param id
   */
  private cancelAnnotation(id: string) {
    const annos = this.getAnnotationObjects(id);
    annos.forEach((anno) => anno.remove());
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

  private getOrCreateSelectableUI(object: DisplayObject): DisplayObject {
    if (!this.selectableMap[object.entity]) {
      let created: DisplayObject;
      if (
        object.nodeName === Shape.IMAGE ||
        object.nodeName === Shape.RECT ||
        object.nodeName === Shape.CIRCLE ||
        object.nodeName === Shape.ELLIPSE
      ) {
        created = new SelectableRect({
          style: {
            target: object,
            ...this.annotationPluginOptions.selectableStyle,
            // TODO: use object's selectable style to override
          },
        });
      } else if (object.nodeName === Shape.LINE || object.nodeName === Shape.POLYLINE) {
        created = new SelectablePolyline({
          style: {
            target: object,
            ...this.annotationPluginOptions.selectableStyle,
          },
        });
      }

      if (created) {
        this.selectableMap[object.entity] = created;
        this.activeSelectableLayer.appendChild(created);

        object.addEventListener(ElementEvent.UNMOUNTED, () => {
          this.activeSelectableLayer.removeChild(created);
        });
      }
    }

    return this.selectableMap[object.entity];
  }

  /**
   * 绘制标注
   * @param anno
   */
  public renderAnnotation(anno: Annotation) {
    this.cancelAnnotation(anno.id);
    if (anno.type === 'circle') {
      renderCircle(this, anno);
    }
    if (anno.type === 'rect') {
      renderRect(this, anno);
    }

    if (anno.type === 'polygon') {
      renderPolygon(this, anno);
    }

    if (anno.type === 'polyline') {
      renderPolyline(this, anno);
    }
    console.log('all', this.canvas.document.childNodes);
  }

  /**
   * 获取激活的标注
   * @returns active anno
   */
  getActiveAnnotation = () => {
    return this.annotations.find((anno) => anno.isActive);
  };

  /**
   * 激活标注
   * @param id
   */
  setActiveAnnotation = (id: string) => {
    console.log('setActiveAnnotation', this.annotations, id);
    this.annotations.forEach((anno, index) => {
      if (anno.isActive) {
        anno.isActive = false;
        this.renderAnnotation(anno);
        this.emmiter.emit('annotation:deactive', anno);
      }
      if (anno.id === id) {
        this.annotations[index].isActive = true;
        this.renderAnnotation(this.annotations[index]);
        this.emmiter.emit('annotation:active', anno);
      }
    });
  };

  hoverAnnotation = (id: string) => {
    this.annotations.forEach((anno, index) => {
      if (anno.id === id) {
        this.annotations[index].isHover = true;
        this.renderAnnotation(this.annotations[index]);
      }
    });
  };

  unHoverAnnotation = (id: string) => {
    this.annotations.forEach((anno, index) => {
      if (anno.id === id) {
        this.annotations[index].isHover = false;
        this.renderAnnotation(this.annotations[index]);
      }
    });
  };

  /**
   * 新增标注
   * @param annotation
   */
  createAnnotation(annotation: Annotation) {
    this.renderAnnotation(annotation);
    this.undoStack.push(annotation);
    this.annotations.push(annotation);
    this.annotationPluginOptions.onAdd?.(annotation);
    this.emmiter.emit('annotation:create', annotation);
  }

  /**
   * 删除标注
   * @param id
   */
  deleteAnnotation(id: string) {
    this.undoStack = this.undoStack.filter((anno) => anno.id !== id);
    this.annotations = this.annotations.filter((anno) => anno.id !== id);
    this.annotationPluginOptions.onDelete?.(id);
    this.cancelAnnotation(id);
    this.emmiter.emit('annotation:delete', id);
  }

  /**
   * 清除画布
   */
  deleteAll() {
    this.annotations.forEach((anno) => {
      this.deleteAnnotation(anno.id);
    });
  }

  /**
   * 撤销
   */
  undo = () => {
    if (this.undoStack.length > 0) {
      const anno = this.undoStack.pop();
      if (anno) {
        this.deleteAnnotation(anno.id);
        this.redoStack.push(anno);
      }
    }
  };

  /**
   * 重做
   */
  redo = () => {
    if (this.redoStack.length > 0) {
      const anno = this.redoStack.pop();
      this.createAnnotation(anno!);
    }
  };

  /**
   * 使用绘制工具
   * @param tool
   * @param options
   * @returns
   */
  setDrawer(tool: DrawerTool, options) {
    let activeDrawer;
    switch (tool) {
      case DrawerTool.Circle:
        activeDrawer = new CircleDrawer(options);
        break;
      case DrawerTool.Rect:
        activeDrawer = new RectDrawer(options);
        break;
      case DrawerTool.Polygon:
        activeDrawer = new PolygonDrawer(options);
        break;
      case DrawerTool.Polyline:
        activeDrawer = new PolylineDrawer(options);
        break;
      default:
        break;
    }

    const onStart = (toolstate: any) => {
      this.renderAnnotation(toolstate);
    };
    const onModify = (toolstate: any) => {
      this.renderAnnotation(toolstate);
    };
    const onComplete = (toolstate: any) => {
      this.createAnnotation(toolstate);
    };
    const onCancel = (toolstate: any) => {
      this.cancelAnnotation(toolstate.id);
    };

    /** 监听绘制事件 */
    activeDrawer.addEventListener('draw:start', onStart);
    activeDrawer.addEventListener('draw:modify', onModify);
    activeDrawer.addEventListener('draw:complete', onComplete);
    activeDrawer.addEventListener('draw:cancel', onCancel);

    if (this.drawer) this.drawer.dispose();

    /**  */
    this.drawer = activeDrawer;
    this.emmiter.emit('drawer:enable', activeDrawer);
    // todo
    this.canvas.setCursor('crosshair');
    return activeDrawer;
  }

  /**
   * 冻结绘制工具
   */
  freezeDrawer() {
    this.drawer.isActive = false;
  }

  unfreezeDrawer() {
    this.drawer.isActive = true;
  }

  /**
   * 清除绘制工具
   */
  clearDrawer() {
    this.drawer = undefined;
    this.canvas.setCursor('grab');
  }

  apply(renderingService: RenderingService) {
    const document = this.renderingContext.root.ownerDocument;
    const canvas = document.defaultView as Canvas;
    this.canvas = canvas;

    const handleMouseDown = (e: FederatedEvent) => {
      if (this.getActiveAnnotation()) {
        this.setActiveAnnotation('');
        return;
      }
      this.drawer?.onMouseDown(e);
    };

    const handleMouseMove = (e: FederatedEvent) => {
      this.drawer?.onMouseMove(e);
    };

    const handleMouseUp = (e: FederatedEvent) => {
      this.drawer?.onMouseUp(e);
    };

    const handleMouseDbClick = (e) => {
      this.drawer?.onMouseDbClick(e);
    };

    const handleClick = (e: FederatedEvent) => {
      if (e.detail === 2) handleMouseDbClick(e);
      const object = e.target as DisplayObject;

      // @ts-ignore
      if (object === document) {
        this.activeSelectableLayer.children.forEach((selectable) => {
          selectable.style.visibility = 'hidden';
        });

        this.selected = [];
      } else if (object.style?.selectable) {
        // Whether to cancel the selected object?
        // TODO: multi-select
        this.selected.forEach((o) => {
          const selectable = this.getOrCreateSelectableUI(o);
          selectable.style.visibility = 'hidden';
        });

        const selectable = this.getOrCreateSelectableUI(object);
        if (selectable) {
          selectable.style.visibility = 'visible';
          this.selected.push(object);
        }
      }
    };

    const handleDrawerKeyDown = (e) => {
      this.drawer?.onKeyDown?.(e);
    };

    const handleKeyDown = (e) => {
      if (!this.hotkeyActive) return;
      if (this.drawer?.isDrawing) {
        handleDrawerKeyDown(e);
      }

      // 撤销
      if (e.code === 'KeyZ' && e.ctrlKey && !e.altKey) {
        this.undo();
      }

      // 重做
      if (e.code === 'KeyZ' && e.ctrlKey && e.altKey) {
        this.redo();
      }

      const active = this.getActiveAnnotation();
      if (!active) return;
      if (e.code === 'Delete') {
        this.deleteAnnotation(active.id);
      }
      if (e.key === 'ArrowLeft') {
        active.path = active.path.map((point) => ({ x: point.x - 1, y: point.y }));
      }
      if (e.key === 'ArrowUp') {
        active.path = active.path.map((point) => ({ x: point.x, y: point.y - 1 }));
      }
      if (e.key === 'ArrowRight') {
        active.path = active.path.map((point) => ({ x: point.x + 1, y: point.y }));
      }
      if (e.key === 'ArrowDown') {
        active.path = active.path.map((point) => ({ x: point.x, y: point.y + 1 }));
      }
      this.renderAnnotation(active);
    };

    const handleCanvasEnter = () => {
      this.hotkeyActive = true;
    };

    const handleCanvasLeave = () => {
      this.hotkeyActive = false;
    };

    renderingService.hooks.init.tapPromise(AnnotationPlugin.tag, async () => {
      canvas.addEventListener('click', handleClick);
      canvas.addEventListener('pointerdown', handleMouseDown);
      canvas.addEventListener('pointermove', handleMouseMove);
      canvas.addEventListener('pointerup', handleMouseUp);

      canvas.document.addEventListener('pointerenter', handleCanvasEnter);
      canvas.document.addEventListener('pointerleave', handleCanvasLeave);
      window.addEventListener('keydown', handleKeyDown);
      canvas.appendChild(this.activeSelectableLayer);
    });

    renderingService.hooks.destroy.tap(AnnotationPlugin.tag, () => {
      canvas.removeEventListener('click', handleClick);
      canvas.removeChild(this.activeSelectableLayer);
    });
    return this;
  }
}
