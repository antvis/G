import { CanvasService } from '../Canvas';

export const ContextService = Symbol('ContextService');
export interface ContextService<Context> extends CanvasService {
  getContext(): Context | null;
  getDomElement(): HTMLElement;
  getDPR(): number;
  getBoundingClientRect(): DOMRect | undefined;
  resize(width: number, height: number): void;
  applyCursorStyle(cursor: string): void;
}
