import { Device, Sampler, Texture } from '../platform';

export interface ViewerTexture {
  name: string;
  surfaces: HTMLCanvasElement[];
  extraInfo?: Map<string, string> | null;
  activate?: () => Promise<void>;
}

export interface TextureOverride {
  texture: Texture | null;
  sampler?: Sampler;
  width: number;
  height: number;
  lateBinding?: string;
}

export interface TextureBase {
  name: string;
  width: number;
  height: number;
}

export class TextureMapping {
  name: string;
  texture: Texture | null = null;
  sampler: Sampler | null = null;
  lateBinding: string | null = null;
  // These are not used when binding to samplers, and are conveniences for custom behavior.
  // TODO(jstpierre): Are any of these really worth anything?
  width: number = 0;
  height: number = 0;
  lodBias: number = 0;
  // GL sucks. This is a convenience when building texture matrices.
  // The core renderer does not use this code at all.
  // flipY: boolean = false;

  reset(): void {
    this.texture = null;
    this.sampler = null;
    this.lateBinding = null;
    this.width = 0;
    this.height = 0;
    this.lodBias = 0;
    // this.flipY = false;
  }

  copy(other: TextureMapping): void {
    this.texture = other.texture;
    this.sampler = other.sampler;
    this.lateBinding = other.lateBinding;
    this.width = other.width;
    this.height = other.height;
    this.lodBias = other.lodBias;
    // this.flipY = other.flipY;
  }
}

export interface LoadedTexture {
  texture: Texture;
  viewerTexture: ViewerTexture;
}
