import { CanvasConfig, ContextService, DefaultEventService } from '@antv/g-core';
import { Group } from '@antv/g-core/src/Group';
import { inject, injectable } from 'inversify';
// import { Canvas2DContextService } from './Canvas2DContextService';
// import { getEventPosition } from '../utils/dom';

const EVENTS = [
  'mousedown',
  'mouseup',
  'dblclick',
  'mouseout',
  'mouseover',
  'mousemove',
  'mouseleave',
  'mouseenter',
  'touchstart',
  'touchmove',
  'touchend',
  'dragenter',
  'dragover',
  'dragleave',
  'drop',
  'contextmenu',
  'mousewheel',
];

@injectable()
export class CanvasEventService extends DefaultEventService {
  // @inject(ContextService)
  // private contextService: Canvas2DContextService;

  @inject(CanvasConfig)
  private canvasConfig: CanvasConfig;

  private lastShape: Group | null;

  init() {
    // const $canvas = this.contextService.getCanvas();
    // if ($canvas) {
    //   EVENTS.forEach((eventName) => {
    //     $canvas.addEventListener(eventName, this.eventHandler);
    //   });
    // }
    // if (document) {
    //   // 处理移动到外面没有触发 shape mouse leave 的事件
    //   // 处理拖拽到外部的问题
    //   document.addEventListener('mousemove', this._onDocumentMove);
    //   // 处理拖拽过程中在外部释放鼠标的问题
    //   document.addEventListener('mouseup', this._onDocumentMouseUp);
    // }
  }

  destroy() {
    // const $canvas = this.contextService.getCanvas();
    // if ($canvas) {
    //   EVENTS.forEach((eventName) => {
    //     $canvas.removeEventListener(eventName, this.eventHandler);
    //   });
    // }
    // if (document) {
    //   // document.removeEventListener('mousemove', this._onDocumentMove);
    //   // document.removeEventListener('mouseup', this._onDocumentMouseUp);
    // }
  }

  private eventHandler = (ev: Event) => {
    // const $canvas = this.contextService.getCanvas();
    // const position = getEventPosition($canvas!, ev);
    // const group = this.pick(position);
    // if (this.lastShape) {
    //   this.lastShape.emit('mouseleave');
    // }
    // if (group) {
    //   this.lastShape = group;
    //   group.emit('mouseenter');
    // }
  };
}
