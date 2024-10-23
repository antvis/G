import type { Tuple4Number } from '@antv/g-lite';
import { isNil } from '@antv/util';
import EventEmitter from 'eventemitter3';
import type {
  BlendFactor,
  BlendMode,
  Color,
  CompareFunction,
  CullMode,
  Device,
  Format,
  FrontFace,
  StencilFaceState,
  Texture,
} from '@antv/g-device-api';
import {
  TextureEvent,
  copyMegaState,
  defaultMegaState,
  getUniforms,
} from '@antv/g-device-api';
import type { Mesh } from '../Mesh';

export interface IMaterial {
  cullMode: CullMode;

  blendConstant: Color;
  blendEquation: BlendMode;
  blendEquationAlpha: BlendMode;
  blendSrc: BlendFactor;
  blendDst: BlendFactor;
  blendSrcAlpha: BlendFactor;
  blendDstAlpha: BlendFactor;

  depthCompare: CompareFunction;
  depthTest: boolean;
  depthWrite: boolean;

  stencilFront: Partial<StencilFaceState>;
  stencilBack: Partial<StencilFaceState>;

  stencilWrite: boolean;
  stencilRef: number;

  frontFace: FrontFace;

  // @see https://developer.mozilla.org/zh-CN/docs/Web/API/WebGLRenderingContext/polygonOffset
  polygonOffset: boolean;

  // gl.DITHER
  dithering: boolean;

  // @see https://doc.babylonjs.com/divingDeeper/materials/using/materials_introduction#wireframe
  wireframe: boolean;
  wireframeColor: string;
  wireframeLineWidth: number;

  vertexShader: string;
  fragmentShader: string;
}

type MaterialUniformData =
  | number
  | [number]
  | [number, number]
  | [number, number, number]
  | Tuple4Number
  | [
      // mat2
      [number, number],
      [number, number],
    ]
  | [
      // mat3
      [number, number, number],
      [number, number, number],
      [number, number, number],
    ]
  | [
      // mat4
      [number, number, number, number],
      [number, number, number, number],
      [number, number, number, number],
      [number, number, number, number],
    ];

export interface MaterialUniform {
  name: string;
  format: Format;
  data: MaterialUniformData;
  offset?: number;
  size?: number;
}

function isTexture(t: any): t is Texture {
  return !!(t && t.type);
}

export enum MaterialEvent {
  CHANGED = 'changed',
}

/**
 * an encapsulation on top of shaders
 * @see https://doc.babylonjs.com/divingDeeper/materials/using/materials_introduction
 */
export abstract class Material<T extends IMaterial = any> extends EventEmitter {
  protected device: Device;
  protected props: T = {} as T;

  /**
   * relative meshes
   */
  meshes: Mesh[] = [];

  /**
   * cullFace
   */
  get cullMode() {
    return this.props.cullMode;
  }
  set cullMode(value) {
    this.props.cullMode = value;
  }

  get frontFace() {
    return this.props.frontFace;
  }
  set frontFace(value) {
    this.props.frontFace = value;
  }

  /**
   * Blending state
   */
  get blendConstant() {
    return this.props.blendConstant;
  }
  set blendConstant(value) {
    this.props.blendConstant = value;
  }
  get blendEquation() {
    return this.props.blendEquation;
  }
  set blendEquation(value) {
    this.props.blendEquation = value;
  }
  get blendEquationAlpha() {
    return this.props.blendEquationAlpha;
  }
  set blendEquationAlpha(value) {
    this.props.blendEquationAlpha = value;
  }
  get blendSrc() {
    return this.props.blendSrc;
  }
  set blendSrc(value) {
    this.props.blendSrc = value;
  }
  get blendDst() {
    return this.props.blendDst;
  }
  set blendDst(value) {
    this.props.blendDst = value;
  }
  get blendSrcAlpha() {
    return this.props.blendSrcAlpha;
  }
  set blendSrcAlpha(value) {
    this.props.blendSrcAlpha = value;
  }
  get blendDstAlpha() {
    return this.props.blendDstAlpha;
  }
  set blendDstAlpha(value) {
    this.props.blendDstAlpha = value;
  }

  get depthCompare() {
    return this.props.depthCompare;
  }
  set depthCompare(value) {
    this.props.depthCompare = value;
  }
  get depthTest() {
    return this.props.depthTest;
  }
  set depthTest(value) {
    this.props.depthTest = value;
  }
  get depthWrite() {
    return this.props.depthWrite;
  }
  set depthWrite(value) {
    this.props.depthWrite = value;
  }

  get stencilFront() {
    return this.props.stencilFront;
  }
  set stencilFront(value) {
    this.props.stencilFront = value;
  }
  get stencilBack() {
    return this.props.stencilBack;
  }
  set stencilBack(value) {
    this.props.stencilBack = value;
  }
  get stencilWrite() {
    return this.props.stencilWrite;
  }
  set stencilWrite(value) {
    this.props.stencilWrite = value;
  }
  get stencilRef() {
    return this.props.stencilRef;
  }
  set stencilRef(value) {
    this.props.stencilRef = value;
  }

  // @see https://developer.mozilla.org/zh-CN/docs/Web/API/WebGLRenderingContext/polygonOffset
  get polygonOffset() {
    return this.props.polygonOffset;
  }
  set polygonOffset(value) {
    this.props.polygonOffset = value;
  }

  // gl.DITHER
  get dithering() {
    return this.props.dithering;
  }
  set dithering(value) {
    this.props.dithering = value;
  }

  // @see https://doc.babylonjs.com/divingDeeper/materials/using/materials_introduction#wireframe
  get wireframe() {
    return this.props.wireframe;
  }
  set wireframe(value) {
    if (this.props.wireframe !== value) {
      // need re-generate geometry
      this.geometryDirty = true;
      this.programDirty = true;
      this.props.wireframe = value;

      this.dispatchMutationEvent();
    }

    this.defines.USE_WIREFRAME = !!value;
  }

  get wireframeColor() {
    return this.props.wireframeColor;
  }
  set wireframeColor(value) {
    this.props.wireframeColor = value;
  }
  get wireframeLineWidth() {
    return this.props.wireframeLineWidth;
  }
  set wireframeLineWidth(value) {
    this.props.wireframeLineWidth = value;
  }

  // shader pairs
  get vertexShader() {
    return this.props.vertexShader;
  }
  set vertexShader(value) {
    if (this.props.vertexShader !== value) {
      this.programDirty = true;
      this.props.vertexShader = value;
      this.compile();
    }
  }
  get fragmentShader() {
    return this.props.fragmentShader;
  }
  set fragmentShader(value) {
    if (this.props.fragmentShader !== value) {
      this.programDirty = true;
      this.props.fragmentShader = value;
      this.compile();
    }
  }

  // USE_XXX
  defines: Record<string, number | boolean | string> = {};

  uniforms: Record<string, number | number[] | Float32Array> = {};
  // used when sorting before inserted into WebGL2's UBO
  uniformNames: string[];
  uboBuffer: number[] = [];

  textures: Record<string, Texture> = {};
  samplers: string[] = [];

  /**
   * need re-compiling like vs/fs changed
   */
  programDirty = true;

  /**
   * need re-upload textures
   */
  textureDirty = true;

  /**
   * inform geometry to rebuild, eg. wireframe
   */
  geometryDirty = true;

  constructor(device: Device, props: Partial<IMaterial>) {
    super();
    const {
      cullMode,
      depthCompare,
      depthWrite,
      stencilFront,
      stencilBack,
      stencilWrite,
      frontFace,
      polygonOffset,
      attachmentsState,
    } = copyMegaState(defaultMegaState);

    this.device = device;

    // @ts-ignore
    this.props = {
      cullMode,
      depthTest: true,
      depthCompare,
      depthWrite,
      stencilFront,
      stencilBack,
      stencilWrite,
      frontFace,
      polygonOffset,
      attachmentsState,
      dithering: false,
      wireframe: false,
      wireframeColor: 'black',
      wireframeLineWidth: 1,
      vertexShader: '',
      fragmentShader: '',
      ...props,
    };

    this.compile();
  }

  private compile() {
    // uniform sampler2D u_Texture0;
    this.props.fragmentShader.replace(
      /^\s*uniform\s*sampler2D\s*(.*)\s*;$/gm,
      (_, name) => {
        this.samplers.push(name);
        return '';
      },
    );

    /**
     * extract from uniform buffer object, should account for struct & pre-defines, eg.
     * layout(std140) uniform ub_ObjectParams {
     *   mat4 u_ModelMatrix;
     *   vec4 u_Color;
     *   vec4 u_StrokeColor;
     *   #ifdef NUM_DIR_LIGHTS
     *     DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
     *   #endif
     * }
     */
    this.uniformNames = getUniforms(this.props.fragmentShader);
  }

  /**
   * @example
   * material.setUniforms({
   *   u_ModelMatrix: [1, 2, 3, 4],
   *   u_Time: 1,
   *   u_Map: texture,
   * })
   */
  setUniforms(
    uniforms: Record<string, null | number | number[] | Float32Array | Texture>,
  ) {
    let shoudDispatchMutationEvent = false;
    Object.keys(uniforms).forEach((key) => {
      const value = uniforms[key];
      const existedTexture = this.textures[key];
      if (existedTexture && existedTexture !== value) {
        // existedTexture.destroy();
        this.textureDirty = true;
      }

      if (isTexture(value)) {
        this.textures[key] = value;
        this.textureDirty = true;
        value.on(TextureEvent.LOADED, () => {
          this.dispatchMutationEvent();
        });
      } else {
        this.uniforms[key] = value;
        shoudDispatchMutationEvent = true;
      }

      if (isNil(uniforms[key])) {
        delete this.textures[key];
        delete this.uniforms[key];
      }
    });

    if (shoudDispatchMutationEvent) {
      this.dispatchMutationEvent();
    }
  }

  private dispatchMutationEvent() {
    this.emit(MaterialEvent.CHANGED);
  }
}
