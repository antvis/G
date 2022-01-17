import { MipFilterMode, SamplerDescriptor, TexFilterMode, Texture, WrapMode } from './platform';

export interface Texture2DDescriptor {
  src?: string | TexImageSource;
  sampler?: SamplerDescriptor;
  order?: number;
  loadedTexture?: Texture;
  pixelStore?: Partial<{
    packAlignment: number;
    unpackAlignment: number;
    unpackFlipY: boolean;
  }>;
  // encoding
  // anisotropy
}

export class Texture2D {
  constructor(public descriptor: Texture2DDescriptor) {
    descriptor.sampler = {
      wrapS: WrapMode.Clamp,
      wrapT: WrapMode.Clamp,
      minFilter: TexFilterMode.Bilinear,
      magFilter: TexFilterMode.Bilinear,
      mipFilter: MipFilterMode.NoMip,
      minLOD: 0,
      maxLOD: 0,
      ...descriptor.sampler,
    };
  }
}
