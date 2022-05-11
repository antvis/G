import { Syringe } from 'mana-syringe';
import type { SwapChain } from './platform';

export const DeviceContribution = Syringe.defineToken('DeviceContribution');
// eslint-disable-next-line @typescript-eslint/no-redeclare
export interface DeviceContribution {
  createSwapChain: ($canvas: HTMLCanvasElement) => Promise<SwapChain>;
}
