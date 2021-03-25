import { System } from '@antv/g-ecs';
import { inject, injectable } from 'inversify';
import { ContextService } from '../services/DefaultContextService';
import { EventService } from '../services/DefaultEventService';
import { CanvasConfig } from '../types';

@injectable()
export class Context implements System {
  static tag = 's-context';
  initialized = false;

  @inject(CanvasConfig)
  private canvasConfig: CanvasConfig;

  @inject(ContextService)
  private contextService: ContextService<unknown>;

  @inject(EventService)
  private eventService: EventService;

  async initialize() {
    const context = await this.contextService.init();
    this.contextService.setContext(context);
    this.contextService.resize(this.canvasConfig.width, this.canvasConfig.height);

    await this.eventService.init();

    this.initialized = true;
  }

  tearDown() {
    this.contextService.destroy();
    this.eventService.destroy();
  }

  execute() {}
}
