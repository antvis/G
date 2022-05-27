import { Syringe } from 'mana-syringe';
import type { CanvasLike } from '../types';

// 1 of 1 in each Canvas
export const ContextService = Syringe.defineToken('ContextService', { multiple: false });
// eslint-disable-next-line @typescript-eslint/no-redeclare
export interface ContextService<Context> {
  init: () => void;
  destroy: () => void;
  getContext: () => Context | null;
  getDomElement: () => CanvasLike | null;
  getDPR: () => number;
  getBoundingClientRect: () => DOMRect | undefined;
  resize: (width: number, height: number) => void;
  applyCursorStyle: (cursor: string) => void;
}
