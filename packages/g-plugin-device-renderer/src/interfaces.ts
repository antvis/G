import type { SwapChain } from './platform';

export const DeviceContribution = Symbol('DeviceContribution');
// eslint-disable-next-line @typescript-eslint/no-redeclare
export interface DeviceContribution {
  createSwapChain: ($canvas: HTMLCanvasElement) => Promise<SwapChain>;
}
