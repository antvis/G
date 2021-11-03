import { inject, injectable, named } from 'inversify';
import { Renderable, Sortable } from '../components';
import { ContributionProvider } from '../contribution-provider';
import { DisplayObject } from '..';
import { EventPosition, InteractivePointerEvent } from '../types';
import { RenderingContext, RENDER_REASON } from './RenderingContext';
import { sortByZIndex } from './SceneGraphService';
import { IElement } from '../dom/interfaces';
import AsyncEventEmitter from 'async-eventemitter';

export interface RenderingPlugin {
  apply(renderer: RenderingService): void;
}
export const RenderingPluginContribution = 'RenderingPluginContribution';

export interface PickingResult {
  position: EventPosition;
  picked: DisplayObject | null;
}

export enum RenderingServiceEvent {
  PointerDown = 'pointerdown',
  PointerUp = 'pointerup',
  PointerMove = 'pointermove',
  PointerOut = 'pointerout',
  PointerOver = 'pointerover',
  PointerWheel = 'pointerwheel',
  BeginFrame = 'beginframe',
  EndFrame = 'endframe',
  Prepare = 'prepare',
  BeforeRender = 'beforerender',
  Render = 'render',
  AfterRender = 'afterrender',
  Init = 'init',
  Destroy = 'destroy',
  Picking = 'picking',
}

/**
 * Use frame renderer implemented by `g-canvas/svg/webgl`, in every frame we do followings:
 * * update & merge dirty rectangles
 * * begin frame
 * * filter by visible
 * * sort by z-index in scene graph
 * * culling with strategies registered in `g-canvas/webgl`
 * * end frame
 */
@injectable()
export class RenderingService {
  @inject(ContributionProvider)
  @named(RenderingPluginContribution)
  private renderingPluginContribution: ContributionProvider<RenderingPlugin>;

  @inject(RenderingContext)
  private renderingContext: RenderingContext;

  private inited = false;

  emitter = new AsyncEventEmitter();

  async init() {
    // register rendering plugins
    this.renderingPluginContribution.getContributions(true).forEach((plugin) => {
      plugin.apply(this);
    });
    this.emitter.emit(RenderingServiceEvent.Init, {}, () => {
      // run after all of the event listeners are done
      this.inited = true;
    });
  }

  render() {
    if (this.renderingContext.renderReasons.size && this.inited) {
      this.renderDisplayObject(this.renderingContext.root);

      if (this.renderingContext.dirty) {
        this.emitter.emit(RenderingServiceEvent.EndFrame);
        this.renderingContext.dirty = false;
      } else {
        if (this.renderingContext.renderReasons.has(RENDER_REASON.DisplayObjectRemoved)) {
          this.emitter.emit(RenderingServiceEvent.BeginFrame);
          this.emitter.emit(RenderingServiceEvent.EndFrame);
        }
      }

      this.renderingContext.renderReasons.clear();
    }
  }

  destroy() {
    this.emitter.emit(RenderingServiceEvent.Destroy);
  }

  dirtify() {
    // need re-render
    this.renderingContext.renderReasons.add(RENDER_REASON.DisplayObjectChanged);
  }

  private renderDisplayObject(displayObject: DisplayObject) {
    const entity = displayObject.entity;

    // render itself
    this.emitter.emit(
      RenderingServiceEvent.Prepare,
      displayObject,
      (objectToRender: DisplayObject) => {
        if (objectToRender) {
          if (!this.renderingContext.dirty) {
            this.renderingContext.dirty = true;
            this.emitter.emit(RenderingServiceEvent.BeginFrame);
          }

          this.emitter.emit(RenderingServiceEvent.BeforeRender, objectToRender);
          this.emitter.emit(RenderingServiceEvent.Render, objectToRender);
          this.emitter.emit(RenderingServiceEvent.AfterRender, objectToRender);

          entity.getComponent(Renderable).dirty = false;
        }

        // sort is very expensive, use cached result if posible
        const sortable = entity.getComponent(Sortable);
        if (sortable.dirty) {
          sortable.sorted = [...(displayObject.childNodes as IElement[])].sort(sortByZIndex);
          sortable.dirty = false;
        }

        // recursive rendering its children
        (sortable.sorted || displayObject.childNodes).forEach((child) => {
          this.renderDisplayObject(child as DisplayObject);
        });
      },
    );
  }
}
