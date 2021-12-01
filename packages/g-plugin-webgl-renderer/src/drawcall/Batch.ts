import { vec3, mat4 } from 'gl-matrix';
import { injectable, inject } from 'mana-syringe';
import {
  DisplayObject,
  PARSED_COLOR_TYPE,
  Tuple4Number,
  RenderingService,
  SHAPE,
  Renderable,
  DefaultCamera,
  Camera,
  ParsedColorStyleProperty,
} from '@antv/g';
import { Geometry } from '../Geometry';
import { Renderable3D } from '../components/Renderable3D';
import {
  Device,
  Format,
  InputState,
  makeTextureDescriptor2D,
  MipFilterMode,
  TexFilterMode,
  VertexBufferFrequency,
  WrapMode,
} from '../platform';
import { TextureMapping } from '../render/TextureHolder';
import { RenderHelper } from '../render/RenderHelper';
import { RenderInstList } from '../render/RenderInstList';
import { DeviceProgram } from '../render/DeviceProgram';
import { preprocessProgramObj_GLSL, ProgramDescriptorSimpleWithOrig } from '../shader/compiler';
import { makeSortKeyOpaque, RendererLayer } from '../render/utils';
import { RenderInst } from '../render/RenderInst';
import { TexturePool } from '../TexturePool';
import mapDeclarationFrag from '../shader/chunks/map.declaration.frag.glsl';
import mapFrag from '../shader/chunks/map.frag.glsl';
import uvDeclarationFrag from '../shader/chunks/uv.declaration.frag.glsl';
import uvVert from '../shader/chunks/uv.vert.glsl';

let counter = 1;
export interface Batch {
  beforeRender?(list: RenderInstList): void;
  afterRender?(list: RenderInstList): void;
}

export enum AttributeLocation {
  // TODO: bind mat4 in WebGL2 instead of decomposed 4 * vec4?
  // @see https://stackoverflow.com/questions/38853096/webgl-how-to-bind-values-to-a-mat4-attribute/38853623#38853623
  a_ModelMatrix0,
  a_ModelMatrix1,
  a_ModelMatrix2,
  a_ModelMatrix3, // model matrix
  a_Color, // fill color
  a_StrokeColor, // stroke color
  a_StylePacked1, // opacity fillOpacity strokeOpacity lineWidth
  a_StylePacked2, // visibility
  a_PickingColor, // picking color
  a_Anchor, // anchor
  // a_Uv, // UV
  MAX,
}

/**
 * A container for multiple display objects with the same `style`,
 * eg. 1000 Circles with the same stroke color, but their position, radius can be different
 */
@injectable()
export abstract class Batch {
  static tag = 'batch';

  /**
   * common shader chunks
   * TODO: use *.glsl instead of string
   */
  static ShaderLibrary = {
    BothDeclaration: `
layout(std140) uniform ub_SceneParams {
  mat4 u_ProjectionMatrix;
  mat4 u_ViewMatrix;
  vec3 u_CameraPosition;
  float u_DevicePixelRatio;
};
    `,
    VertDeclaration: `
layout(location = ${AttributeLocation.a_ModelMatrix0}) attribute vec4 a_ModelMatrix0;
layout(location = ${AttributeLocation.a_ModelMatrix1}) attribute vec4 a_ModelMatrix1;
layout(location = ${AttributeLocation.a_ModelMatrix2}) attribute vec4 a_ModelMatrix2;
layout(location = ${AttributeLocation.a_ModelMatrix3}) attribute vec4 a_ModelMatrix3;
layout(location = ${AttributeLocation.a_Color}) attribute vec4 a_Color;
layout(location = ${AttributeLocation.a_StrokeColor}) attribute vec4 a_StrokeColor;
layout(location = ${AttributeLocation.a_StylePacked1}) attribute vec4 a_StylePacked1;
layout(location = ${AttributeLocation.a_StylePacked2}) attribute vec4 a_StylePacked2;
layout(location = ${AttributeLocation.a_PickingColor}) attribute vec4 a_PickingColor;
layout(location = ${AttributeLocation.a_Anchor}) attribute vec2 a_Anchor;
// layout(location = {AttributeLocation.a_Uv}) attribute vec2 a_Uv;

varying vec4 v_PickingResult;
varying vec4 v_Color;
varying vec4 v_StrokeColor;
varying vec4 v_StylePacked1;
varying vec4 v_StylePacked2;

#define COLOR_SCALE 1. / 255.
void setPickingColor(vec3 pickingColor) {
  v_PickingResult.rgb = pickingColor * COLOR_SCALE;
}
    `,
    FragDeclaration: `
varying vec4 v_PickingResult;
varying vec4 v_Color;
varying vec4 v_StrokeColor;
varying vec4 v_StylePacked1;
varying vec4 v_StylePacked2;
    `,
    Vert: `
    mat4 u_ModelMatrix = mat4(a_ModelMatrix0, a_ModelMatrix1, a_ModelMatrix2, a_ModelMatrix3);
    vec4 u_StrokeColor = a_StrokeColor;
    float u_Opacity = a_StylePacked1.x;
    float u_FillOpacity = a_StylePacked1.y;
    float u_StrokeOpacity = a_StylePacked1.z;
    float u_StrokeWidth = a_StylePacked1.w;
    float u_ZIndex = a_PickingColor.w;

    setPickingColor(a_PickingColor.xyz);

    v_Color = a_Color;
    v_StrokeColor = a_StrokeColor;
    v_StylePacked1 = a_StylePacked1;
    v_StylePacked2 = a_StylePacked2;

    #ifdef CLIPSPACE_NEAR_ZERO
      gl_Position.z = gl_Position.z * 0.5 + 0.5;
    #endif
    `,
    Frag: `
    vec4 u_Color = v_Color;
    vec4 u_StrokeColor = v_StrokeColor;
    float u_Opacity = v_StylePacked1.x;
    float u_FillOpacity = v_StylePacked1.y;
    float u_StrokeOpacity = v_StylePacked1.z;
    float u_StrokeWidth = v_StylePacked1.w;
    float u_Visible = v_StylePacked2.x;

    gbuf_picking = vec4(v_PickingResult.rgb, 1.0);

    if (u_Visible < 1.0) {
      discard;
    }
    `,
    UvVert: uvVert,
    UvFragDeclaration: uvDeclarationFrag,
    MapFragDeclaration: mapDeclarationFrag,
    MapFrag: mapFrag,
  };

  static CommonBufferIndex = 0;

  @inject(RenderHelper)
  protected renderHelper: RenderHelper;

  @inject(TexturePool)
  protected texturePool: TexturePool;

  @inject(DefaultCamera)
  protected camera: Camera;

  device: Device;

  renderingService: RenderingService;

  id = counter++;

  type: string;

  objects: DisplayObject[] = [];

  geometry: Geometry;

  inputState: InputState;

  mapping: TextureMapping;

  recreateGeometry = true;

  recreateInputState = true;

  recreateProgram = true;

  programDescriptorSimpleWithOrig: ProgramDescriptorSimpleWithOrig;

  protected abstract program: DeviceProgram;

  protected instanced = true;

  get instance() {
    return this.objects[0];
  }

  init(device: Device, renderingService: RenderingService) {
    this.device = device;
    this.renderingService = renderingService;
    this.geometry = new Geometry();
    this.geometry.device = this.device;
  }

  /**
   * provide validator for current shape
   */
  protected abstract validate(object: DisplayObject): boolean;
  checkBatchable(object: DisplayObject): boolean {
    if (this.objects.length === 0) {
      return true;
    }

    if (this.instance.nodeName !== object.nodeName) {
      return false;
    }

    return this.validate(object);
  }

  merge(object: DisplayObject) {
    this.type = object.nodeName;

    if (this.objects.indexOf(object) === -1) {
      this.objects.push(object);
      this.recreateGeometry = true;
    }
  }

  purge(object: DisplayObject) {
    this.recreateGeometry = true;
    const index = this.objects.indexOf(object);
    this.objects.splice(index, 1);
  }

  protected abstract buildGeometry(): void;

  private createGeometry() {
    if (this.instanced) {
      const packed = [];
      this.objects.forEach((object) => {
        const {
          fill,
          stroke,
          opacity,
          fillOpacity,
          strokeOpacity,
          lineWidth = 0,
          anchor,
          zIndex = 0,
          visibility,
        } = object.parsedStyle;
        let fillColor: Tuple4Number = [0, 0, 0, 0];
        if (fill?.type === PARSED_COLOR_TYPE.Constant) {
          fillColor = fill.value;
        }
        let strokeColor: Tuple4Number = [0, 0, 0, 0];
        if (stroke?.type === PARSED_COLOR_TYPE.Constant) {
          strokeColor = stroke.value;
        }

        const modelMatrix = mat4.copy(mat4.create(), object.getWorldTransform());

        // @ts-ignore
        const encodedPickingColor = object.renderable3D.encodedPickingColor;

        packed.push(
          ...modelMatrix,
          ...fillColor,
          ...strokeColor,
          opacity,
          fillOpacity,
          strokeOpacity,
          lineWidth,
          visibility === 'visible' ? 1 : 0,
          0,
          0,
          0,
          ...encodedPickingColor,
          zIndex,
          anchor[0],
          anchor[1],
        );
      });

      this.geometry.maxInstancedCount = this.objects.length;

      this.geometry.setVertexBuffer({
        bufferIndex: Batch.CommonBufferIndex,
        byteStride: 4 * (4 * 4 + 4 + 4 + 4 + 4 + 4 + 2),
        frequency: VertexBufferFrequency.PerInstance,
        attributes: [
          {
            format: Format.F32_RGBA,
            bufferByteOffset: 4 * 0,
            location: AttributeLocation.a_ModelMatrix0,
            divisor: 1,
          },
          {
            format: Format.F32_RGBA,
            bufferByteOffset: 4 * 4,
            location: AttributeLocation.a_ModelMatrix1,
            divisor: 1,
          },
          {
            format: Format.F32_RGBA,
            bufferByteOffset: 4 * 8,
            location: AttributeLocation.a_ModelMatrix2,
            divisor: 1,
          },
          {
            format: Format.F32_RGBA,
            bufferByteOffset: 4 * 12,
            location: AttributeLocation.a_ModelMatrix3,
            divisor: 1,
          },
          {
            format: Format.F32_RGBA,
            bufferByteOffset: 4 * 16,
            location: AttributeLocation.a_Color,
            divisor: 1,
          },
          {
            format: Format.F32_RGBA,
            bufferByteOffset: 4 * 20,
            location: AttributeLocation.a_StrokeColor,
            divisor: 1,
          },
          {
            format: Format.F32_RGBA,
            bufferByteOffset: 4 * 24,
            location: AttributeLocation.a_StylePacked1,
            divisor: 1,
          },
          {
            format: Format.F32_RGBA,
            bufferByteOffset: 4 * 28,
            location: AttributeLocation.a_StylePacked2,
            divisor: 1,
          },
          {
            format: Format.F32_RGBA,
            bufferByteOffset: 4 * 32,
            location: AttributeLocation.a_PickingColor,
            divisor: 1,
          },
          {
            format: Format.F32_RG,
            bufferByteOffset: 4 * 36,
            location: AttributeLocation.a_Anchor,
            divisor: 1,
          },
        ],
        data: new Float32Array(packed),
      });
    }

    this.buildGradient();
    this.buildGeometry();
  }

  private buildGradient() {
    const instance = this.instance;

    const fill = (
      instance.nodeName === SHAPE.Line ? instance.parsedStyle.stroke : instance.parsedStyle.fill
    ) as ParsedColorStyleProperty;
    // use pattern & gradient
    if (
      fill &&
      (fill.type === PARSED_COLOR_TYPE.Pattern ||
        fill.type === PARSED_COLOR_TYPE.LinearGradient ||
        fill.type === PARSED_COLOR_TYPE.RadialGradient)
    ) {
      this.program.setDefineBool('USE_UV', true);
      this.program.setDefineBool('USE_MAP', true);
      let texImageSource: string | TexImageSource;
      if (
        fill.type === PARSED_COLOR_TYPE.LinearGradient ||
        fill.type === PARSED_COLOR_TYPE.RadialGradient
      ) {
        this.texturePool.getOrCreateGradient({
          type: fill.type,
          ...fill.value,
          width: 128,
          height: 128,
        });
        texImageSource = this.texturePool.getOrCreateCanvas();
      } else {
        // FIXME: support repeat
        texImageSource = fill.value.src;
      }

      this.mapping = new TextureMapping();
      this.mapping.texture = this.texturePool.getOrCreateTexture(
        this.device,
        texImageSource,
        makeTextureDescriptor2D(Format.U8_RGBA_NORM, 1, 1, 1),
        () => {
          // need re-render
          this.objects.forEach((object) => {
            object.renderable.dirty = true;

            this.renderingService.dirtify();
          });
        },
      );
      this.device.setResourceName(this.mapping.texture, 'Gradient Texture' + this.id);
      this.mapping.sampler = this.renderHelper.getCache().createSampler({
        // wrapS: WrapMode.Clamp,
        // wrapT: WrapMode.Clamp,
        wrapS: WrapMode.Repeat,
        wrapT: WrapMode.Repeat,
        minFilter: TexFilterMode.Bilinear,
        magFilter: TexFilterMode.Bilinear,
        mipFilter: MipFilterMode.NoMip,
        minLOD: 0,
        maxLOD: 0,
      });
    }
  }

  destroy() {
    if (this.geometry) {
      this.geometry.destroy();
    }
    if (this.inputState) {
      this.inputState.destroy();
    }
  }

  protected abstract uploadUBO(renderInst: RenderInst): void;

  render(list: RenderInstList) {
    if (this.recreateGeometry) {
      if (this.geometry) {
        this.geometry.destroy();
      }
      this.createGeometry();
      this.recreateGeometry = false;
      this.recreateInputState = true;
    }

    if (this.beforeRender) {
      this.beforeRender(list);
    }

    // cached input layout
    const inputLayout = this.renderHelper
      .getCache()
      .createInputLayout(this.geometry.inputLayoutDescriptor);

    // use cached program
    if (this.recreateProgram) {
      this.programDescriptorSimpleWithOrig = preprocessProgramObj_GLSL(this.device, this.program);
      this.recreateProgram = false;
    }
    const program = this.renderHelper
      .getCache()
      .createProgramSimple(this.programDescriptorSimpleWithOrig);

    // prevent rebinding VAO too many times
    if (this.recreateInputState) {
      if (this.inputState) {
        this.inputState.destroy();
      }
      this.inputState = this.device.createInputState(
        inputLayout,
        this.geometry.vertexBuffers.map((buffer) => ({
          buffer,
          byteOffset: 0,
        })),
        { buffer: this.geometry.indicesBuffer, byteOffset: 0 },
        program,
      );
      this.recreateInputState = false;
    }

    // new render instance
    const renderInst = this.renderHelper.renderInstManager.newRenderInst();
    renderInst.setProgram(program);
    renderInst.setInputLayoutAndState(inputLayout, this.inputState);

    // bind UBO and upload
    // TODO: no need to re-upload unchanged uniforms
    if (this.mapping) {
    }

    this.uploadUBO(renderInst);

    // draw elements
    renderInst.drawIndexesInstanced(this.geometry.vertexCount, this.geometry.maxInstancedCount);
    renderInst.sortKey = makeSortKeyOpaque(RendererLayer.OPAQUE, program.id);
    this.renderHelper.renderInstManager.submitRenderInst(renderInst, list);

    if (this.afterRender) {
      this.afterRender(list);
    }

    // finish rendering...
    this.objects.forEach((object) => {
      object.renderable.dirty = false;
    });
  }

  updateAttribute(object: DisplayObject, name: string, value: any): void {
    const index = this.objects.indexOf(object);
    const geometry = this.geometry;
    const stylePacked1 = ['opacity', 'fillOpacity', 'strokeOpacity', 'lineWidth'];

    if (this.instanced) {
      if (name === 'fill') {
        const { fill } = object.parsedStyle;
        let fillColor: Tuple4Number = [0, 0, 0, 0];
        if (fill?.type === PARSED_COLOR_TYPE.Constant) {
          fillColor = fill.value;
        }

        geometry.updateVertexBuffer(
          Batch.CommonBufferIndex,
          AttributeLocation.a_Color,
          index,
          new Uint8Array(new Float32Array([...fillColor]).buffer),
        );
      } else if (name === 'stroke') {
        const { stroke } = object.parsedStyle;
        let strokeColor: Tuple4Number = [0, 0, 0, 0];
        if (stroke?.type === PARSED_COLOR_TYPE.Constant) {
          strokeColor = stroke.value;
        }

        geometry.updateVertexBuffer(
          Batch.CommonBufferIndex,
          AttributeLocation.a_StrokeColor,
          index,
          new Uint8Array(new Float32Array([...strokeColor]).buffer),
        );
      } else if (stylePacked1.indexOf(name) > -1) {
        const { opacity, fillOpacity, strokeOpacity, lineWidth = 0 } = object.parsedStyle;
        geometry.updateVertexBuffer(
          Batch.CommonBufferIndex,
          AttributeLocation.a_StylePacked1,
          index,
          new Uint8Array(new Float32Array([opacity, fillOpacity, strokeOpacity, lineWidth]).buffer),
        );
      } else if (name === 'zIndex') {
        // @ts-ignore
        const encodedPickingColor = object.renderable3D.encodedPickingColor;
        // FIXME: z-index should account for context, not global
        geometry.updateVertexBuffer(
          Batch.CommonBufferIndex,
          AttributeLocation.a_PickingColor,
          index,
          new Uint8Array(
            new Float32Array([...encodedPickingColor, object.parsedStyle.zIndex]).buffer,
          ),
        );
      } else if (name === 'modelMatrix') {
        const modelMatrix = mat4.copy(mat4.create(), object.getWorldTransform());
        geometry.updateVertexBuffer(
          Batch.CommonBufferIndex,
          AttributeLocation.a_ModelMatrix0,
          index,
          new Uint8Array(new Float32Array(modelMatrix).buffer),
        );
      } else if (name === 'anchor') {
        const { anchor } = object.parsedStyle;
        geometry.updateVertexBuffer(
          Batch.CommonBufferIndex,
          AttributeLocation.a_Anchor,
          index,
          new Uint8Array(new Float32Array([anchor[0], anchor[1]]).buffer),
        );
      } else if (name === 'visibility') {
        const { visibility } = object.parsedStyle;
        geometry.updateVertexBuffer(
          Batch.CommonBufferIndex,
          AttributeLocation.a_StylePacked2,
          index,
          new Uint8Array(new Float32Array([visibility === 'visible' ? 1 : 0]).buffer),
        );
      }
    }
  }
}
