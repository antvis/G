import type {
  Canvas,
  DisplayObject,
  FederatedEvent,
  RenderingPlugin,
  RenderingService,
} from '@antv/g';
import {
  ContextService,
  Group,
  inject,
  RenderingContext,
  RenderingPluginContribution,
  Shape,
  singleton,
} from '@antv/g';
import { SelectableRect } from './SelectableRect';
import type { Annotation } from './interface/annotation';
import { renderCircle } from './rendering/circle-render';
import { renderPolygon } from './rendering/polygon-render';
import { renderPolyline } from './rendering/polyline-render';
import { AnnotationPluginOptions } from './tokens';
import { renderRect } from './rendering/rect-render';
import { DrawerTool } from './constants/enum';
import { PolygonDrawer } from './drawers/polygon';
import { PolylineDrawer } from './drawers/polyline';
import { CircleDrawer } from './drawers/circle';
import { RectDrawer } from './drawers/rect';
import type { BaseDrawer } from './interface/drawer';

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

  @inject(ContextService)
  private contextService: ContextService<unknown>;

  @inject(AnnotationPluginOptions)
  private annotationPluginOptions: AnnotationPluginOptions;

  private activeSelectableLayer = new Group({
    className: 'g-annotation-active-layer',
    style: {
      zIndex: 999,
    },
  });

  private annotations: Annotation[] = [];
  private undoStack: Annotation[] = [];
  private redoStack: Annotation[] = [];
  private hotkeyActive: boolean = false;
  private drawer: BaseDrawer;
  private canvas: Canvas;

  /**
   *
   * @param id
   * @returns
   */
  private getAnnotationObjects(id: string) {
    return this.canvas.document.getElementsByClassName(id);
  }

  /**
   * 绘制标注
   * @param anno
   */
  private renderAnnotation(anno: Annotation) {
    console.log(anno);
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
  }

  /**
   * 取消标注（仅从画布移除）
   * @param id
   */
  private cancelAnnotation(id: string) {
    const annos = this.getAnnotationObjects(id);
    console.log({ annos });
    annos.forEach((anno) => anno.remove());
  }

  private getOrCreateSelectableUI(object: DisplayObject): DisplayObject {
    if (!object.style.selectableUI) {
      let created: DisplayObject;
      if (object.nodeName === Shape.IMAGE) {
        created = new SelectableRect({
          style: {
            target: object,
          },
        });
      }

      if (created) {
        object.style.selectableUI = created;
        this.activeSelectableLayer.appendChild(created);
      }
    }

    return object.style.selectableUI;
  }

  /**
   * 新增标注
   * @param annotation
   */
  createAnnotation(annotation: Annotation) {
    this.renderAnnotation(annotation);
    this.undoStack.push(annotation);
    this.annotations.push(annotation);
    this.annotationPluginOptions.onAdd?.(annotation);
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
    let activeTool;
    const drawerOptons = {
      onStart: (toolstate: any) => {
        this.renderAnnotation(toolstate);
      },
      onChange: (toolstate: any) => {
        this.renderAnnotation(toolstate);
      },
      onComplete: (toolstate: any) => {
        this.createAnnotation(toolstate);
      },
      onCancel: (toolstate: any) => {
        this.cancelAnnotation(toolstate.id);
      },
    };
    switch (tool) {
      case DrawerTool.Circle:
        activeTool = new CircleDrawer({
          ...drawerOptons,
          ...options,
        });
        break;
      case DrawerTool.Rect:
        activeTool = new RectDrawer({
          ...drawerOptons,
          ...options,
        });
        break;
      case DrawerTool.Polygon:
        activeTool = new PolygonDrawer({
          ...drawerOptons,
          ...options,
        });
        break;
      case DrawerTool.Polyline:
        activeTool = new PolylineDrawer({
          ...drawerOptons,
          ...options,
        });
        break;
      default:
        break;
    }
    this.drawer = activeTool;
    return activeTool;
  }

  apply(renderingService: RenderingService) {
    const document = this.renderingContext.root.ownerDocument;
    const canvas = document.defaultView as Canvas;
    this.canvas = canvas;

    const handleMouseDown = (e: FederatedEvent) => {
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

      if (object.style?.selectable) {
        const selectable = this.getOrCreateSelectableUI(object);

        if (selectable) {
          selectable.style.visibility = 'visible';
        }
      } else {
        this.activeSelectableLayer.children.forEach((selectable) => {
          selectable.style.visibility = 'hidden';
        });
      }
    };

    const handleDrawerKeyDown = (e) => {
      this.drawer?.onKeyDown?.(e);
    };

    const handleKeyDown = (e) => {
      console.log(this.hotkeyActive);
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
    };

    const handleCanvasEnter = () => {
      this.hotkeyActive = true;
    };

    const handleCanvasLeave = () => {
      this.hotkeyActive = false;
    };

    renderingService.hooks.init.tapPromise(AnnotationPlugin.tag, async () => {
      canvas.addEventListener('click', handleClick);
      canvas.addEventListener('mousedown', handleMouseDown);
      canvas.addEventListener('mousemove', handleMouseMove);
      canvas.addEventListener('mouseup', handleMouseUp);

      canvas.document.addEventListener('mouseenter', handleCanvasEnter);
      canvas.document.addEventListener('mouseleave', handleCanvasLeave);
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
