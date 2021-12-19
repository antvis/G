import { EventEmitter } from 'eventemitter3';
import {
  BlendFactor,
  BlendMode,
  CompareMode,
  CullMode,
  FrontFaceMode,
  StencilOp,
} from '../platform';
import { copyMegaState, defaultMegaState } from '../platform/utils';
import { Texture2D } from '../Texture2D';

export enum MaterialEvent {
  TEXTURE_LOADED = 'texture-loaded',
}

export enum FogType {
  NONE = 0,
  EXP = 1,
  EXP2 = 2,
  LINEAR = 3,
}

export interface MaterialProps {
  cullMode: CullMode;

  blendEquation: BlendMode;
  blendEquationAlpha: BlendMode;
  blendSrc: BlendFactor;
  blendDst: BlendFactor;
  blendSrcAlpha: BlendFactor;
  blendDstAlpha: BlendFactor;

  depthCompare: CompareMode;
  depthTest: boolean;
  depthWrite: boolean;

  stencilCompare: CompareMode;
  stencilWrite: boolean;
  stencilPassOp: StencilOp;

  frontFace: FrontFaceMode;

  // @see https://developer.mozilla.org/zh-CN/docs/Web/API/WebGLRenderingContext/polygonOffset
  polygonOffset: boolean;

  // gl.DITHER
  dithering: boolean;

  // @see https://doc.babylonjs.com/divingDeeper/materials/using/materials_introduction#wireframe
  wireframe: boolean;

  // @see https://doc.babylonjs.com/advanced_topics/shaders/Fog+ShaderMat
  // @see https://developer.playcanvas.com/en/api/pc.Scene.html#fog
  fogType: FogType;
  fogColor: string;
  fogDensity: number;
  fogStart: number;
  fogEnd: number;

  vertexShader: string;
  fragmentShader: string;
}

/**
 * an encapsulation on top of shaders
 * @see https://doc.babylonjs.com/divingDeeper/materials/using/materials_introduction
 */
export abstract class Material<
  StyleProps extends Partial<MaterialProps> = any,
> extends EventEmitter {
  defines: Record<string, number | boolean> = {};

  uniform: Record<string, number | boolean> = {};

  textures: {
    name: string;
    texture: Texture2D;
  }[] = [];

  props: StyleProps = {} as StyleProps;
  private _props: StyleProps = {} as StyleProps;

  dirty = true;

  constructor(props: StyleProps) {
    super();

    const {
      cullMode,
      depthCompare,
      depthWrite,
      stencilCompare,
      stencilWrite,
      stencilPassOp,
      frontFace,
      polygonOffset,
      attachmentsState,
    } = copyMegaState(defaultMegaState);

    this._props = {
      blendEquation: BlendMode.Add,
      blendEquationAlpha: null,
      blendSrc: BlendFactor.SrcAlpha,
      blendDst: BlendFactor.OneMinusSrcAlpha,
      blendSrcAlpha: null,
      blendDstAlpha: null,

      cullMode,
      depthCompare,
      depthTest: true,
      depthWrite,

      stencilCompare,
      stencilWrite,
      stencilPassOp,

      frontFace,

      // @see https://developer.mozilla.org/zh-CN/docs/Web/API/WebGLRenderingContext/polygonOffset
      polygonOffset,

      // gl.DITHER
      dithering: false,

      // @see https://doc.babylonjs.com/divingDeeper/materials/using/materials_introduction#wireframe
      wireframe: false,

      // @see https://doc.babylonjs.com/advanced_topics/shaders/Fog+ShaderMat
      fog: false,

      vertexShader: '',
      fragmentShader: '',
      ...props,
    };

    this.props = new Proxy<StyleProps>(this._props, {
      get: (_, prop) => {
        return this._props[prop];
      },
      set: (_, prop, value) => {
        this.setAttribute(prop as keyof StyleProps, value);
        return true;
      },
    });
  }

  abstract getUniformWordCount(): number;

  protected addTexture(map: string | TexImageSource | Texture2D, textureName: string) {
    // remove old texture, maybe need destroy underlying texture?
    const index = this.textures.findIndex(({ name }) => name === textureName);
    if (index > -1) {
      this.textures.splice(index, 1);
    }

    // create map texture
    if (map) {
      let mapTexture: Texture2D;
      if (map instanceof Texture2D) {
        mapTexture = map;
      } else {
        mapTexture = new Texture2D({
          src: map,
          flipY: false,
        });
      }
      this.textures.push({
        name: textureName,
        texture: mapTexture,
      });
    }
  }

  protected setAttribute<Key extends keyof StyleProps>(name: Key, value: StyleProps[Key]) {
    if (this._props[name] !== value) {
      this.dirty = true;
      this._props[name] = value;
    }
  }
}
