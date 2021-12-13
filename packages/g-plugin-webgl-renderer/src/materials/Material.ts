import {
  BlendFactor,
  BlendMode,
  CompareMode,
  CullMode,
  FrontFaceMode,
  StencilOp,
} from '../platform';

/**
 * an encapsulation on top of shaders
 * @see https://doc.babylonjs.com/divingDeeper/materials/using/materials_introduction
 */
export class Material {
  cullMode: CullMode = CullMode.None;

  blendEquation: BlendMode = BlendMode.Add;
  blendEquationAlpha: BlendMode = null;
  blendSrc: BlendFactor = BlendFactor.SrcAlpha;
  blendDst: BlendFactor = BlendFactor.OneMinusSrcAlpha;
  blendSrcAlpha: BlendFactor = null;
  blendDstAlpha: BlendFactor = null;

  depthCompare: CompareMode = CompareMode.LessEqual;
  depthTest: boolean = true;
  depthWrite: boolean = true;

  stencilCompare: CompareMode = CompareMode.Never;
  stencilWrite: boolean = false;
  stencilPassOp: StencilOp = StencilOp.Keep;

  frontFace: FrontFaceMode = FrontFaceMode.CCW;

  // @see https://developer.mozilla.org/zh-CN/docs/Web/API/WebGLRenderingContext/polygonOffset
  polygonOffset: boolean = false;

  // gl.DITHER
  dithering = false;

  // @see https://doc.babylonjs.com/divingDeeper/materials/using/materials_introduction#wireframe
  wireframe = false;

  // @see https://doc.babylonjs.com/advanced_topics/shaders/Fog+ShaderMat
  fog = false;

  defines: Record<string, number | boolean> = {};

  uniform: Record<string, number | boolean> = {};

  vertexShader = '';
  fragmentShader = '';
}
