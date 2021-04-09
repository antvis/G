export const ContextService = Symbol('ContextService');
export interface ContextService<Context> {
  getContext(): Context | null;
  init(): Promise<void> | void;
  destroy(): Promise<void> | void;
  resize(width: number, height: number): void;
}
