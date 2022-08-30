export const WebGPUDeviceOptions = Symbol('WebGPUDeviceOptions');
// eslint-disable-next-line @typescript-eslint/no-redeclare
export interface WebGPUDeviceOptions {
  onContextCreationError: (e: Event) => void;
  onContextLost: (e: Event) => void;
  onContextRestored: (e: Event) => void;
}
