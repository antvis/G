import type { SwapChain } from './platform';

export interface DeviceContribution {
  createSwapChain: ($canvas: HTMLCanvasElement) => Promise<SwapChain>;
}
