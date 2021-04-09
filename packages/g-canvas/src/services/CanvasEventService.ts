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
import { Canvas2DContextService } from './Canvas2DContextService';
import { getEventPosition } from '../utils/dom';
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
export class CanvasEventService implements EventService {
  @inject(System)
  @named(AABBCalculator.tag)
  private aabbSystem: AABBCalculator;

  @inject(ContextService)
  private contextService: Canvas2DContextService;

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

    const $canvas = this.contextService.getCanvas();
    if ($canvas) {
      EVENTS.forEach((eventName) => {
        $canvas.addEventListener(eventName, this.eventHandler);
      });
    }

    // if (document) {
    //   // 处理移动到外面没有触发 shape mouse leave 的事件
    //   // 处理拖拽到外部的问题
    //   document.addEventListener('mousemove', this._onDocumentMove);
    //   // 处理拖拽过程中在外部释放鼠标的问题
    //   document.addEventListener('mouseup', this._onDocumentMouseUp);
    // }
  }

  destroy() {
    const $canvas = this.contextService.getCanvas();
    if ($canvas) {
      EVENTS.forEach((eventName) => {
        $canvas.removeEventListener(eventName, this.eventHandler);
      });
    }
    if (document) {
      // document.removeEventListener('mousemove', this._onDocumentMove);
      // document.removeEventListener('mouseup', this._onDocumentMouseUp);
    }
  }

  pick({ x, y }: { x: number; y: number }): Group | null {
    // query by AABB first with spatial index(r-tree)
    const rBushNodes = this.aabbSystem.search(this.renderingService.getRBush(), {
      minX: x,
      minY: y,
      maxX: x,
      maxY: y,
    });

    const groups: Group[] = [];
    rBushNodes.filter(({ name }) => {
      const group = this.groupPool.getByName(name);
      const groupConfig = group.getConfig();

      if (groupConfig.visible && groupConfig.capture) {
        const renderer = this.shapeRendererFactory(group.getEntity().getComponent(SceneGraphNode).tagName);
        if (renderer && renderer?.isHit && renderer?.isHit(group.getEntity(), { x, y })) {
          groups.push(group);
        }

        if (isGroup(group)) {
          groups.push(group);
        }
      }
    });

    // TODO: find group with max z-index
    const ids = this.sceneGraph.sort(this.root);
    groups.sort((a, b) => ids.indexOf(b.getEntity()) - ids.indexOf(a.getEntity()));

    return groups[0];
  }

  private eventHandler = (ev: Event) => {
    const $canvas = this.contextService.getCanvas();
    const position = getEventPosition($canvas!, ev);

    const group = this.pick(position);

    if (this.lastShape) {
      this.lastShape.emit('mouseleave');
    }

    if (group) {
      this.lastShape = group;
      group.emit('mouseenter');
    }
  };
}
