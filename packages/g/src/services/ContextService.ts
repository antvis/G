import { Syringe } from 'mana-syringe';

// 1 of 1 in each Canvas
export const ContextService = Syringe.defineToken('ContextService', { multiple: false });
// eslint-disable-next-line @typescript-eslint/no-redeclare
export interface ContextService<Context> {
  init: () => void;
  destroy: () => void;
  getContext: () => Context | null;
  getDomElement: () => HTMLElement | OffscreenCanvas | null;
  getDPR: () => number;
  getBoundingClientRect: () => DOMRect | undefined;
  resize: (width: number, height: number) => void;
  getWidth: () => number | undefined;
  getHeight: () => number | undefined;
  applyCursorStyle: (cursor: string) => void;
}
