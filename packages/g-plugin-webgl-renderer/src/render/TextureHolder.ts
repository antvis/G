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
  flipY: boolean;
  lateBinding?: string;
}

export interface TextureBase {
  name: string;
  width: number;
  height: number;
}

export class TextureMapping {
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
  flipY: boolean = false;

  reset(): void {
    this.texture = null;
    this.sampler = null;
    this.lateBinding = null;
    this.width = 0;
    this.height = 0;
    this.lodBias = 0;
    this.flipY = false;
  }

  fillFromTextureOverride(textureOverride: TextureOverride): boolean {
    this.texture = textureOverride.texture;
    if (textureOverride.sampler) this.sampler = textureOverride.sampler;
    this.width = textureOverride.width;
    this.height = textureOverride.height;
    this.flipY = textureOverride.flipY;
    if (textureOverride.lateBinding) this.lateBinding = textureOverride.lateBinding;
    return true;
  }

  copy(other: TextureMapping): void {
    this.texture = other.texture;
    this.sampler = other.sampler;
    this.lateBinding = other.lateBinding;
    this.width = other.width;
    this.height = other.height;
    this.lodBias = other.lodBias;
    this.flipY = other.flipY;
  }
}

export interface LoadedTexture {
  texture: Texture;
  viewerTexture: ViewerTexture;
}

// TODO(jstpierre): TextureHolder needs to die.
export abstract class TextureHolder<TextureType extends TextureBase> {
  viewerTextures: ViewerTexture[] = [];
  textures: Texture[] = [];
  textureEntries: TextureType[] = [];
  textureOverrides = new Map<string, TextureOverride>();
  onnewtextures: (() => void) | null = null;

  destroy(device: Device): void {
    this.textures.forEach((texture) => texture.destroy());
    this.viewerTextures.length = 0;
    this.textures.length = 0;
    this.textureEntries.length = 0;
    this.textureOverrides.clear();
  }

  protected searchTextureEntryIndex(name: string): number {
    for (let i = 0; i < this.textureEntries.length; i++) {
      if (this.textureEntries[i].name === name) return i;
    }

    return -1;
  }

  findTextureEntryIndex(name: string): number {
    return this.searchTextureEntryIndex(name);
  }

  hasTexture(name: string): boolean {
    return this.findTextureEntryIndex(name) >= 0;
  }

  protected fillTextureMappingFromEntry(
    textureMapping: TextureMapping,
    textureEntryIndex: number,
  ): void {
    textureMapping.texture = this.textures[textureEntryIndex];
    const tex0Entry = this.textureEntries[textureEntryIndex];
    textureMapping.width = tex0Entry.width;
    textureMapping.height = tex0Entry.height;
    textureMapping.flipY = false;
  }

  fillTextureMapping(textureMapping: TextureMapping, name: string): boolean {
    const textureOverride = this.textureOverrides.get(name);
    if (textureOverride) {
      textureMapping.fillFromTextureOverride(textureOverride);
      return true;
    }

    const textureEntryIndex = this.findTextureEntryIndex(name);
    if (textureEntryIndex >= 0) {
      this.fillTextureMappingFromEntry(textureMapping, textureEntryIndex);
      return true;
    }

    // throw new Error(`Cannot find texture ${name}`);
    return false;
  }

  findTexture(name: string): TextureType | null {
    const textureEntryIndex = this.findTextureEntryIndex(name);
    if (textureEntryIndex >= 0) return this.textureEntries[textureEntryIndex];
    return null;
  }

  setTextureOverride(
    name: string,
    textureOverride: TextureOverride,
    checkExisting: boolean = false,
  ): void {
    this.textureOverrides.set(name, textureOverride);
  }

  protected abstract loadTexture(device: Device, textureEntry: TextureType): LoadedTexture | null;

  addTextures(
    device: Device,
    textureEntries: (TextureType | null)[],
    overwrite: boolean = false,
  ): void {
    for (let i = 0; i < textureEntries.length; i++) {
      const texture = textureEntries[i];
      if (texture === null) continue;

      let index = this.textureEntries.findIndex((entry) => entry.name === texture.name);
      // Don't add dupes for the same name.
      if (index >= 0 && !overwrite) continue;
      if (index < 0) index = this.textureEntries.length;

      const loadedTexture = this.loadTexture(device, texture);
      if (loadedTexture === null) continue;

      const { texture: t, viewerTexture } = loadedTexture;
      this.textureEntries[index] = texture;
      this.textures[index] = t;
      this.viewerTextures[index] = viewerTexture;
    }

    if (this.onnewtextures !== null) this.onnewtextures();
  }
}

export class FakeTextureHolder extends TextureHolder<any> {
  constructor(viewerTextures: ViewerTexture[]) {
    super();
    this.viewerTextures = viewerTextures;
  }

  // Not allowed.
  loadTexture(device: Device, entry: any): LoadedTexture {
    throw new Error();
  }
}
