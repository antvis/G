import { MipFilterMode, SamplerDescriptor, TexFilterMode, WrapMode } from './platform';

export interface Texture2DDescriptor {
  src: string | TexImageSource;
  sampler?: SamplerDescriptor;
  flipY?: boolean;
  order?: number;
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
