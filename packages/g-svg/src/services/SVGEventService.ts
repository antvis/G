import {
  AABBCalculator,
  GroupPool,
  ContextService,
  EventService,
  Group,
  SceneGraphService,
  isGroup,
  Shape,
  RenderingService,
  SHAPE,
  ShapeRendererFactory,
  ShapeRenderer,
  SceneGraphNode,
} from '@antv/g-core';
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
  @inject(System)
  @named(AABBCalculator.tag)
  private aabbSystem: AABBCalculator;

  @inject(SceneGraphService)
  private sceneGraph: SceneGraphService;

  @inject(RenderingService)
  private renderingService: RenderingService;

  @inject(GroupPool)
  private groupPool: GroupPool;

  @inject(ShapeRendererFactory)
  private shapeRendererFactory: (type: SHAPE) => ShapeRenderer<CanvasRenderingContext2D> | null;

  private lastShape: Group | null;
  private root: Group;

  init(root: Group) {
    this.root = root;
  }

  destroy() {}

  pick({ x, y }: { x: number; y: number }): Group | null {
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
