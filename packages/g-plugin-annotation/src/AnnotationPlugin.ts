import type {
  Canvas,
  Circle,
  FederatedPointerEvent,
  Polygon,
  Polyline,
  RenderingPlugin,
  RenderingPluginContext,
} from '@antv/g-lite';
import EventEmitter from 'eventemitter3';
import { DrawerEvent, DrawerTool } from './constants/enum';
import { CircleDrawer } from './drawers/circle';
import { PolygonDrawer } from './drawers/polygon';
import { PolylineDrawer } from './drawers/polyline';
import { RectDrawer } from './drawers/rect';
import type { BaseDrawer, DrawerState } from './interface/drawer';
import { renderCircle } from './rendering/circle-render';
import { renderPolygon } from './rendering/polygon-render';
import { renderPolyline } from './rendering/polyline-render';
import { renderRect } from './rendering/rect-render';
import type { AnnotationPluginOptions } from './tokens';

/**
 * Provides drawing capability like free drawing mode in fabric.js.
 * @see http://fabricjs.com/freedrawing
 */
export class AnnotationPlugin implements RenderingPlugin {
  static tag = 'Annotation';

  constructor(public annotationPluginOptions: AnnotationPluginOptions) {}

  private hotkeyActive = false;
  public drawer: BaseDrawer;
  public emmiter = new EventEmitter();
  public canvas: Canvas;

  /**
   * draw a dashed rect when brushing
   */
  brushRect: Polygon;

  /**
   * draw a static point
   */
  pointCircle: Circle;

  /**
   * control points on polyline
   */
  polylineControlPoints: Circle[] = [];

  /**
   * the whole polyline except for last segment
   */
  savedPolyline: Polyline;

  /**
   * the last segment of polyline
   */
  polylineLastSegment: Polyline;

  private hideDrawer(anno: DrawerState) {
    if (anno.type === 'rect') {
      if (this.brushRect) {
        this.brushRect.style.visibility = 'hidden';
      }
    } else if (anno.type === 'circle') {
      if (this.pointCircle) {
        this.pointCircle.style.visibility = 'hidden';
      }
    } else if (anno.type === 'polyline' || anno.type === 'polygon') {
      this.polylineControlPoints.forEach((point) => {
        point.remove();
      });
      this.polylineControlPoints = [];

      if (this.savedPolyline) {
        this.savedPolyline.style.visibility = 'hidden';
      }
      if (this.polylineLastSegment) {
        this.polylineLastSegment.style.visibility = 'hidden';
      }
    }
  }

  /**
   * 绘制标注
   * @param anno
   */
  public renderDrawer(anno: DrawerState) {
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
    let activeDrawer: BaseDrawer;
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
    activeDrawer?.setCanvas(this.canvas);
    const onStart = (toolstate: any) => {
      this.emmiter.emit(DrawerEvent.START, toolstate);
      this.renderDrawer(toolstate);
    };

    const onMove = (toolstate: any) => {
      this.emmiter.emit(DrawerEvent.MOVE, toolstate);
      this.renderDrawer(toolstate);
    };

    const onModify = (toolstate: any) => {
      this.emmiter.emit(DrawerEvent.MODIFIED, toolstate);
      this.renderDrawer(toolstate);
    };

    const onComplete = (toolstate: any) => {
      this.hideDrawer(toolstate);
      this.emmiter.emit(DrawerEvent.COMPLETE, toolstate);
    };

    const onCancel = (toolstate: any) => {
      this.hideDrawer(toolstate);
      this.emmiter.emit(DrawerEvent.CANCEL, toolstate);
    };

    /** 监听绘制事件 */
    activeDrawer.on(DrawerEvent.START, onStart);
    activeDrawer.on(DrawerEvent.MODIFIED, onModify);
    activeDrawer.on(DrawerEvent.MOVE, onMove);
    activeDrawer.on(DrawerEvent.COMPLETE, onComplete);
    activeDrawer.on(DrawerEvent.CANCEL, onCancel);

    if (this.drawer) this.drawer.dispose();

    /**  */
    this.drawer = activeDrawer;
    this.emmiter.emit('drawer:enable', activeDrawer);
    // todo
    this.canvas.setCursor('crosshair');
    return activeDrawer;
  }

  /**
   * 清除绘制工具
   */
  clearDrawer() {
    this.drawer = undefined;
    this.canvas.setCursor('grab');
  }

  apply(context: RenderingPluginContext) {
    const { renderingService, renderingContext } = context;

    const document = renderingContext.root.ownerDocument;
    const canvas = document.defaultView as Canvas;
    this.canvas = canvas;

    const handleMouseDown = (e: FederatedPointerEvent) => {
      if (!this.annotationPluginOptions.isDrawingMode || e.shiftKey) {
        return;
      }

      if (e.button === 0) {
        this.drawer?.onMouseDown(e);
      }
    };

    const handleMouseMove = (e: FederatedPointerEvent) => {
      if (!this.annotationPluginOptions.isDrawingMode || e.shiftKey) {
        return;
      }

      this.drawer?.onMouseMove(e);
    };

    const handleMouseUp = (e: FederatedPointerEvent) => {
      if (!this.annotationPluginOptions.isDrawingMode || e.shiftKey) {
        return;
      }

      if (e.button === 0) {
        this.drawer?.onMouseUp(e);
      }
    };

    const handleMouseDbClick = (e: FederatedPointerEvent) => {
      if (!this.annotationPluginOptions.isDrawingMode || e.shiftKey) {
        return;
      }

      if (e.button === 0) {
        this.drawer?.onMouseDbClick(e);
      }
    };

    const handleClick = (e: FederatedPointerEvent) => {
      if (!this.annotationPluginOptions.isDrawingMode || e.shiftKey) {
        return;
      }

      if (e.detail === 2) handleMouseDbClick(e);
    };

    const handleDrawerKeyDown = (e: KeyboardEvent) => {
      if (!this.annotationPluginOptions.isDrawingMode || e.shiftKey) {
        return;
      }

      this.drawer?.onKeyDown?.(e);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!this.annotationPluginOptions.isDrawingMode || e.shiftKey) {
        return;
      }

      if (!this.hotkeyActive) return;
      if (this.drawer?.isDrawing) {
        handleDrawerKeyDown(e);
      }
    };

    const handleCanvasEnter = () => {
      this.hotkeyActive = true;
    };

    const handleCanvasLeave = () => {
      this.hotkeyActive = false;
    };

    renderingService.hooks.init.tap(AnnotationPlugin.tag, () => {
      canvas.addEventListener('click', handleClick);
      canvas.addEventListener('pointerdown', handleMouseDown);
      canvas.addEventListener('pointermove', handleMouseMove);
      canvas.addEventListener('pointerup', handleMouseUp);

      canvas.document.addEventListener('pointerenter', handleCanvasEnter);
      canvas.document.addEventListener('pointerleave', handleCanvasLeave);
      window.addEventListener('keydown', handleKeyDown);
    });

    renderingService.hooks.destroy.tap(AnnotationPlugin.tag, () => {
      canvas.removeEventListener('click', handleClick);
      canvas.removeEventListener('pointerdown', handleMouseDown);
      canvas.removeEventListener('pointermove', handleMouseMove);
      canvas.removeEventListener('pointerup', handleMouseUp);

      canvas.document.removeEventListener('pointerenter', handleCanvasEnter);
      canvas.document.removeEventListener('pointerleave', handleCanvasLeave);
      window.removeEventListener('keydown', handleKeyDown);
    });
  }
}
