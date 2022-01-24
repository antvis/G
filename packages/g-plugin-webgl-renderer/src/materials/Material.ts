import { ElementEvent, Tuple4Number } from '@antv/g';
import { isNil } from '@antv/util';
import { Mesh } from '../Mesh';
import {
  BlendFactor,
  BlendMode,
  CompareMode,
  CullMode,
  Format,
  FrontFaceMode,
  getFormatByteSize,
  StencilOp,
} from '../platform';
import { copyMegaState, defaultMegaState } from '../platform/utils';
import { Texture2D } from '../Texture2D';

export interface IMaterial {
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
  stencilRef: number;

  frontFace: FrontFaceMode;

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

function isMatrix(
  data:
    | number[]
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
      ],
): data is
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
    ] {
  return Array.isArray(data) && Array.isArray(data[0]);
}

export interface MaterialUniform {
  name: string;
  format: Format;
  data: MaterialUniformData;
  offset?: number;
  size?: number;
}

/**
 * an encapsulation on top of shaders
 * @see https://doc.babylonjs.com/divingDeeper/materials/using/materials_introduction
 */
export abstract class Material<T extends IMaterial = any> {
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

  get stencilCompare() {
    return this.props.stencilCompare;
  }
  set stencilCompare(value) {
    this.props.stencilCompare = value;
  }
  get stencilWrite() {
    return this.props.stencilWrite;
  }
  set stencilWrite(value) {
    this.props.stencilWrite = value;
  }
  get stencilPassOp() {
    return this.props.stencilPassOp;
  }
  set stencilPassOp(value) {
    this.props.stencilPassOp = value;
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
    }
  }
  get fragmentShader() {
    return this.props.fragmentShader;
  }
  set fragmentShader(value) {
    if (this.props.fragmentShader !== value) {
      this.programDirty = true;
      this.props.fragmentShader = value;
    }
  }

  // USE_XXX
  defines: Record<string, number | boolean> = {};

  // uniforms: MaterialUniform[] = [];
  uniforms: Record<string, number | number[] | Float32Array> = {};
  uboBuffer: number[] = [];

  textures: {
    name: string;
    texture: Texture2D;
  }[] = [];

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

  constructor(props: Partial<IMaterial>) {
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

    // @ts-ignore
    this.props = {
      cullMode,
      depthTest: true,
      depthCompare,
      depthWrite,
      stencilCompare,
      stencilWrite,
      stencilPassOp,
      frontFace,
      polygonOffset,
      attachmentsState,
      blendEquation: BlendMode.Add,
      blendEquationAlpha: BlendMode.Add,
      blendSrc: BlendFactor.SrcAlpha,
      blendDst: BlendFactor.OneMinusSrcAlpha,
      blendSrcAlpha: BlendFactor.Zero,
      blendDstAlpha: BlendFactor.One,
      dithering: false,
      wireframe: false,
      wireframeColor: 'black',
      wireframeLineWidth: 1,
      vertexShader: '',
      fragmentShader: '',
      ...props,
    };
  }

  /**
   * @example
   * material.setUniforms({
   *   u_ModelMatrix: [1, 2, 3, 4],
   *   u_Time: 1,
   * })
   */
  setUniforms(uniforms: Record<string, null | number | number[] | Float32Array>) {
    this.uniforms = {
      ...this.uniforms,
      ...uniforms,
    };

    Object.keys(this.uniforms).forEach((key) => {
      if (isNil(this.uniforms[key])) {
        delete this.uniforms[key];
      }
    });

    // trigger re-render
    this.meshes.forEach((mesh) => {
      mesh.emit(ElementEvent.ATTRIBUTE_CHANGED, {
        attributeName: 'geometry',
      });
    });
  }

  addTexture(map: string | TexImageSource | Texture2D, textureName: string, order = 0) {
    this.removeTexture(textureName);

    // create map texture
    if (map) {
      let mapTexture: Texture2D;
      if (map instanceof Texture2D) {
        mapTexture = map;
      } else {
        mapTexture = new Texture2D({
          src: map,
          pixelStore: {
            unpackFlipY: false,
          },
          order,
        });
      }
      this.textures.push({
        name: textureName,
        texture: mapTexture,
      });
    }

    this.sortTextures();
    this.textureDirty = true;
  }

  removeTexture(textureName: string) {
    // remove old texture, maybe need destroy underlying texture?
    const index = this.textures.findIndex(({ name }) => name === textureName);
    if (index > -1) {
      this.textures.splice(index, 1);
    }
    this.sortTextures();
    this.textureDirty = true;
  }

  private sortTextures() {
    this.textures.sort((a, b) => a.texture.descriptor.order - b.texture.descriptor.order);
  }
}
