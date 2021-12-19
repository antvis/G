import { vec3, mat3, mat4 } from 'gl-matrix';
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
import { Geometry } from '../geometries';
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

/**
 * render order start from 0, our default camera's Z is 500
 */
export const RENDER_ORDER_SCALE = 1 / 200;

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

  fillMapping: TextureMapping;

  geometryDirty = true;

  inputStateDirty = true;

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
      this.geometryDirty = true;
    }
  }

  purge(object: DisplayObject) {
    this.geometryDirty = true;
    const index = this.objects.indexOf(object);
    this.objects.splice(index, 1);
  }

  protected abstract buildGeometry(): void;

  private createGeometry() {
    this.buildGeometry();
    const modelMatrix = mat4.create();
    const modelViewMatrix = mat4.create();
    const normalMatrix = mat3.create();

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

        mat4.copy(modelMatrix, object.getWorldTransform());
        mat4.mul(modelViewMatrix, this.camera.getViewTransform(), modelMatrix);
        // should not calc normal matrix in shader, mat3.invert is not cheap
        // @see https://stackoverflow.com/a/21079741
        mat3.fromMat4(normalMatrix, modelViewMatrix);
        mat3.invert(normalMatrix, normalMatrix);
        mat3.transpose(normalMatrix, normalMatrix);

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
          object.sortable.renderOrder * RENDER_ORDER_SCALE,
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

      this.fillMapping = new TextureMapping();
      this.fillMapping.texture = this.texturePool.getOrCreateTexture(
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
      this.device.setResourceName(this.fillMapping.texture, 'Fill Texture' + this.id);
      this.fillMapping.sampler = this.renderHelper.getCache().createSampler({
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
    if (this.beforeRender) {
      this.beforeRender(list);
    }

    if (this.geometryDirty) {
      if (this.geometry) {
        this.geometry.destroy();
      }
      this.createGeometry();
      this.geometryDirty = false;
      this.inputStateDirty = true;
    }

    // cached input layout
    const inputLayout = this.renderHelper
      .getCache()
      .createInputLayout(this.geometry.inputLayoutDescriptor);

    // use cached program
    if (this.program.dirty) {
      this.programDescriptorSimpleWithOrig = preprocessProgramObj_GLSL(this.device, this.program);
      this.program.dirty = false;
    }
    const program = this.renderHelper
      .getCache()
      .createProgramSimple(this.programDescriptorSimpleWithOrig);

    // prevent rebinding VAO too many times
    if (this.inputStateDirty) {
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
      this.inputStateDirty = false;
    }

    // new render instance
    const renderInst = this.renderHelper.renderInstManager.newRenderInst();
    renderInst.setProgram(program);
    renderInst.setInputLayoutAndState(inputLayout, this.inputState);

    // bind UBO and upload
    // TODO: no need to re-upload unchanged uniforms
    if (this.fillMapping) {
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

  changeRenderOrder(object: DisplayObject, renderOrder: number) {
    const index = this.objects.indexOf(object);
    const geometry = this.geometry;

    if (this.instanced && geometry.vertexBuffers.length) {
      // @ts-ignore
      const encodedPickingColor = object.renderable3D.encodedPickingColor;
      geometry.updateVertexBuffer(
        Batch.CommonBufferIndex,
        AttributeLocation.a_PickingColor,
        index,
        new Uint8Array(
          new Float32Array([...encodedPickingColor, renderOrder * RENDER_ORDER_SCALE]).buffer,
        ),
      );
    }
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
