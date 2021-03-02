import { System } from '@antv/g-ecs';
import { inject, injectable } from 'inversify';
import { CanvasCfg } from '../types';

export const CanvasConfig = Symbol('CanvasConfig');
export const ContextService = Symbol('ContextService');
export interface ContextService<Context> {
  setContext(context: Context): void;
  getContext(): Context | null;
  init(): Promise<Context | null> | void;
  destroy(): Promise<void> | void;
  resize(width: number, height: number): void;
}

@injectable()
export abstract class DefaultContextService<Context> implements ContextService<Context> {
  private context: Context | null;

  @inject(CanvasConfig)
  protected canvasConfig: CanvasCfg;

  public abstract init(): void;
  public abstract destroy(): void;
  public abstract resize(width: number, height: number): void;

  public setContext(context: Context) {
    this.context = context;
  }

  public getContext() {
    return this.context;
  }
}

@injectable()
export class Context extends System {
  static tag = 's-context';

  @inject(CanvasConfig)
  private canvasConfig: CanvasCfg;

  @inject(ContextService)
  private contextService: ContextService<unknown>;

  async initialize() {
    const context = await this.contextService.init();
    this.contextService.setContext(context);
    this.contextService.resize(this.canvasConfig.width, this.canvasConfig.height);
    this.initialized = true;
  }

  tearDown() {
    this.contextService.destroy();
  }

  async execute() {
    //
  }
}
