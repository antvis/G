import { Syringe } from '@antv/g-lite';

export const A11yPluginOptions = Syringe.defineToken('');
// eslint-disable-next-line @typescript-eslint/no-redeclare
export interface A11yPluginOptions {
  enableExtractingText: boolean;
}
