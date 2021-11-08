import { Syringe } from 'mana-syringe';

export const ContextService = Syringe.defineToken('ContextService', { multiple: false });
export interface ContextService<Context> {
  init(): void;
  destroy(): void;
  getContext(): Context | null;
  getDomElement(): HTMLElement | null;
  getDPR(): number;
  getBoundingClientRect(): DOMRect | undefined;
  resize(width: number, height: number): void;
  applyCursorStyle(cursor: string): void;
  // supportsTouchEvents(): boolean;
  // supportsPointerEvents(): boolean;
}
