import { Syringe } from '@antv/g';

export const A11yPluginOptions = Syringe.defineToken('A11yPluginOptions');
// eslint-disable-next-line @typescript-eslint/no-redeclare
export interface A11yPluginOptions {
  enableExtractingText: boolean;
}
