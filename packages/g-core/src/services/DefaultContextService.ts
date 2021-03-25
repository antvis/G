import { inject, injectable } from 'inversify';
import { CanvasConfig } from '../types';

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
  protected canvasConfig: CanvasConfig;

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
