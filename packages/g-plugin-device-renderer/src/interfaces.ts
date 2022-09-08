import { Syringe } from '@antv/g-lite';
import type { SwapChain } from './platform';

export const DeviceContribution = Syringe.defineToken('');
// eslint-disable-next-line @typescript-eslint/no-redeclare
export interface DeviceContribution {
  createSwapChain: ($canvas: HTMLCanvasElement) => Promise<SwapChain>;
}
