import type { SwapChain } from '@antv/g-device-api';

export interface DeviceContribution {
  createSwapChain: ($canvas: HTMLCanvasElement) => Promise<SwapChain>;
}

export enum ToneMapping {
  NONE = 'none',
  LINEAR = 'LinearToneMapping',
  REINHARD = 'ReinhardToneMapping',
  CINEON = 'OptimizedCineonToneMapping',
  ACES_FILMIC = 'ACESFilmicToneMapping',
  CUSTOM = 'CustomToneMapping',
}

export interface RendererParameters {
  toneMapping: ToneMapping;
  toneMappingExposure: number;
}

export interface DeviceRendererPluginOptions {
  enableFXAA: boolean;
}
