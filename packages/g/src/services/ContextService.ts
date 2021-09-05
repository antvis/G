import { CanvasService } from '../Canvas';

export const ContextService = 'ContextService';
export interface ContextService<Context> extends CanvasService {
  getContext(): Context | null;
  getDomElement(): HTMLElement | null;
  getDPR(): number;
  getBoundingClientRect(): DOMRect | undefined;
  resize(width: number, height: number): void;
  applyCursorStyle(cursor: string): void;
  // supportsTouchEvents(): boolean;
  // supportsPointerEvents(): boolean;
}
