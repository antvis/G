import {
  DisplayObjectPool,
  ContextService,
  EventService,
  DisplayObject,
  SceneGraphService,
  RenderingService,
  SHAPE,
  SceneGraphNode,
} from '@antv/g';
import { inject, injectable, named } from 'inversify';
import { SVGContextService } from './SVGContextService';
import { System } from '@antv/g-ecs';

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
export class SVGEventService implements EventService {
  @inject(SceneGraphService)
  private sceneGraph: SceneGraphService;

  @inject(RenderingService)
  private renderingService: RenderingService;

  @inject(DisplayObjectPool)
  private groupPool: DisplayObjectPool;

  private lastShape: DisplayObject | null;
  private root: DisplayObject;

  init(root: DisplayObject) {
    this.root = root;
  }

  destroy() {}

  pick({ x, y }: { x: number; y: number }): DisplayObject | null {
    return null;
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
