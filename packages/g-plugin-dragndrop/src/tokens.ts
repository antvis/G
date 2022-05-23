import { Syringe } from 'mana-syringe';

export const DragndropPluginOptions = Syringe.defineToken('DragndropPluginOptions');
// eslint-disable-next-line @typescript-eslint/no-redeclare
export interface DragndropPluginOptions {
  /**
   * How drops are checked for. The allowed values are:
   * - 'pointer' – the pointer must be over the dropzone (default)
   * - 'center' – the draggable element’s center must be over the dropzone
   * @see https://interactjs.io/docs/dropzone/#accept
   */
  overlap: 'pointer' | 'center';
}
