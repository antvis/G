import type {
  Canvas,
  DisplayObject,
  FederatedEvent,
  Rect,
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
import { EventEmitter } from 'eventemitter3';
import type { DrawerState } from './interface/drawer';

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

  private hotkeyActive: boolean = false;
  public drawer: BaseDrawer;
  public emmiter = new EventEmitter();
  public canvas: Canvas;

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
  private cancelDrawer(id: string) {
    const annos = this.getAnnotationObjects(id);
    annos.forEach((anno) => anno.remove());
  }

  /**
   * 绘制标注
   * @param anno
   */
  public renderDrawer(anno: DrawerState) {
    this.cancelDrawer(anno.id);
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
   * 激活标注
   * @param id
   */
  setActiveAnnotation = (id: string) => {
    // TODO
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
      this.emmiter.emit('draw:start', toolstate);
      this.renderDrawer(toolstate);
    };

    const onModify = (toolstate: any) => {
      this.emmiter.emit('draw:modify', toolstate);
      this.renderDrawer(toolstate);
    };

    const onComplete = (toolstate: any) => {
      if (this.annotationPluginOptions.destroyAfterComplete !== false) {
        this.cancelDrawer(toolstate.id);
      }
      this.emmiter.emit('draw:complete', toolstate);
    };

    const onCancel = (toolstate: any) => {
      this.cancelDrawer(toolstate.id);
      this.emmiter.emit('draw:cancel', toolstate);
    };

    /** 监听绘制事件 */
    activeDrawer.on('draw:start', onStart);
    activeDrawer.on('draw:modify', onModify);
    activeDrawer.on('draw:complete', onComplete);
    activeDrawer.on('draw:cancel', onCancel);

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
      if (!this.hotkeyActive) return;
      if (this.drawer?.isDrawing) {
        handleDrawerKeyDown(e);
      }

      const active = this.drawer;
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
      // this.renderDrawer(active);
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
