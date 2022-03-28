import { Camera, DefaultCamera, parseColor, PARSED_COLOR_TYPE, Shape } from '@antv/g';
import type {
  Tuple4Number,
  DisplayObject,
  ParsedBaseStyleProps,
  ParsedColorStyleProperty,
  RenderingService,
} from '@antv/g';
import { inject, injectable } from 'mana-syringe';
import { mat4 } from 'gl-matrix';
import { BufferGeometry } from '../geometries';
import type { Material } from '../materials';
import { ShaderMaterial } from '../materials';
import type { BindingLayoutSamplerDescriptor, Device, InputState } from '../platform';
import {
  ChannelWriteMask,
  CompareMode,
  Format,
  makeTextureDescriptor2D,
  MipFilterMode,
  StencilOp,
  TexFilterMode,
  VertexBufferFrequency,
  WrapMode,
} from '../platform';
import type { RenderInst, RenderInstUniform } from '../render';
import {
  DeviceProgram,
  makeSortKeyOpaque,
  RendererLayer,
  RenderHelper,
  TextureMapping,
} from '../render';
import type { ProgramDescriptorSimpleWithOrig } from '../shader/compiler';
import { preprocessProgramObj_GLSL } from '../shader/compiler';
import type { Batch } from '../renderer/Batch';
import { RENDER_ORDER_SCALE } from '../renderer/Batch';
import { TexturePool } from '../TexturePool';
import type { Fog } from '../lights';
import { LightPool } from '../LightPool';
import { enumToObject } from '../utils/enum';

let counter = 1;
const FILL_TEXTURE_MAPPING = 'FillTextureMapping';

export enum VertexAttributeBufferIndex {
  MODEL_MATRIX = 0,
  FILL,
  STROKE,
  PACKED_STYLE1,
  PACKED_STYLE2,
  PICKING_COLOR, // built-in
  POSITION,
  NORMAL,
  UV,
  BARYCENTRIC,
  MAX,
}

/**
 * GL.MAX_VERTEX_ATTRIBS
 */
export enum VertexAttributeLocation {
  // TODO: bind mat4 in WebGL2 instead of decomposed 4 * vec4?
  // @see https://stackoverflow.com/questions/38853096/webgl-how-to-bind-values-to-a-mat4-attribute/38853623#38853623
  MODEL_MATRIX0,
  MODEL_MATRIX1,
  MODEL_MATRIX2,
  MODEL_MATRIX3,
  COLOR,
  STROKE_COLOR,
  PACKED_STYLE1, // opacity fillOpacity strokeOpacity lineWidth
  PACKED_STYLE2, // visibility anchorX anchorY
  PICKING_COLOR,
  POSITION,
  NORMAL,
  UV,
  BARYCENTRIC,
  MAX,
}

/**
 * Instanced mesh
 */
@injectable()
export abstract class Instanced {
  /**
   * unique ID
   */
  id = counter++;
  renderer: Batch;

  /**
   * index in renderer.meshes
   */
  index = -1;

  @inject(RenderHelper)
  protected renderHelper: RenderHelper;

  @inject(TexturePool)
  protected texturePool: TexturePool;

  @inject(DefaultCamera)
  protected camera: Camera;

  @inject(LightPool)
  protected lightPool: LightPool;

  device: Device;

  renderingService: RenderingService;

  /**
   * instances
   */
  objects: DisplayObject[] = [];

  material: Material;
  geometry: BufferGeometry;

  clipPath: DisplayObject;
  clipPathTarget: DisplayObject;

  private inputState: InputState;
  private program: DeviceProgram = new DeviceProgram();
  private programDescriptorSimpleWithOrig?: ProgramDescriptorSimpleWithOrig;
  geometryDirty = true;

  /**
   * the same material maybe shared between different canvases
   */
  materialDirty = true;
  private inputStateDirty = true;
  /**
   * texture mappings
   */
  protected textureMappings: TextureMapping[] = [];
  protected samplerEntries: BindingLayoutSamplerDescriptor[];

  protected abstract createMaterial(objects: DisplayObject[]): void;

  get instance() {
    return this.objects[0];
  }

  inited = false;
  init(device: Device, renderingService: RenderingService) {
    if (this.inited) {
      return;
    }

    this.renderer.beforeInitMesh(this);
    this.device = device;
    this.renderingService = renderingService;
    this.material = new ShaderMaterial(this.device);
    this.material.defines = {
      ...enumToObject(VertexAttributeLocation),
      ...this.material.defines,
    };
    this.geometry = new BufferGeometry(this.device);
    this.inited = true;
    this.renderer.afterInitMesh(this);
  }

  /**
   * should be merged into current InstancedMesh
   */
  shouldMerge(object: DisplayObject, index: number): boolean {
    if (!this.instance) {
      return true;
    }

    if (this.instance.nodeName !== object.nodeName) {
      return false;
    }

    // can't be merged when using clipPath
    if (object.parsedStyle.clipPath) {
      return false;
    }

    return true;
  }

  protected createGeometry(objects: DisplayObject[]) {
    const modelMatrix = mat4.create();
    const modelViewMatrix = mat4.create();
    // const normalMatrix = mat3.create();
    const packedModelMatrix: number[] = [];
    const packedFill: number[] = [];
    const packedStroke: number[] = [];
    const packedStyle1: number[] = [];
    const packedStyle2: number[] = [];
    const packedPicking: number[] = [];

    // const useNormal = this.material.defines.NORMAL;

    objects.forEach((object) => {
      const { fill, stroke, opacity, fillOpacity, strokeOpacity, lineWidth, anchor, visibility } =
        object.parsedStyle as ParsedBaseStyleProps;
      let fillColor: Tuple4Number = [0, 0, 0, 0];
      if (fill?.type === PARSED_COLOR_TYPE.Constant) {
        fillColor = fill.value;
      }
      let strokeColor: Tuple4Number = [0, 0, 0, 0];
      if (stroke?.type === PARSED_COLOR_TYPE.Constant) {
        // if (object.)
        strokeColor = stroke.value;
      }

      if (this.clipPathTarget) {
        // account for target's rts
        mat4.copy(modelMatrix, object.getLocalTransform());
        fillColor = [1, 1, 1, 1];
        mat4.mul(modelMatrix, this.clipPathTarget.getWorldTransform(), modelMatrix);
      } else {
        mat4.copy(modelMatrix, object.getWorldTransform());
      }
      mat4.mul(modelViewMatrix, this.camera.getViewTransform(), modelMatrix);

      // @ts-ignore
      const encodedPickingColor = object.renderable3D?.encodedPickingColor || [0, 0, 0];

      packedModelMatrix.push(...modelMatrix);
      packedFill.push(...fillColor);
      packedStroke.push(...strokeColor);
      packedStyle1.push(opacity, fillOpacity, strokeOpacity, lineWidth.value);
      packedStyle2.push(visibility === 'visible' ? 1 : 0, anchor[0], anchor[1], 0);
      packedPicking.push(...encodedPickingColor, object.sortable.renderOrder * RENDER_ORDER_SCALE);

      // if (useNormal) {
      //   // should not calc normal matrix in shader, mat3.invert is not cheap
      //   // @see https://stackoverflow.com/a/21079741
      //   mat3.fromMat4(normalMatrix, modelViewMatrix);
      //   mat3.invert(normalMatrix, normalMatrix);
      //   mat3.transpose(normalMatrix, normalMatrix);

      //   const { NORMAL_MATRIX0, NORMAL_MATRIX1, NORMAL_MATRIX2 } = this.material.defines;
      //   this.bufferGeometry.setVertexBuffer({
      //     bufferIndex: 4,
      //     byteStride: 4 * (3 * 3),
      //     frequency: VertexBufferFrequency.PerInstance,
      //     attributes: [
      //       {
      //         format: Format.F32_RGB,
      //         bufferByteOffset: 4 * 0,
      //         location: Number(NORMAL_MATRIX0),
      //         divisor: 1,
      //       },
      //       {
      //         format: Format.F32_RGB,
      //         bufferByteOffset: 4 * 3,
      //         location: Number(NORMAL_MATRIX1),
      //         divisor: 1,
      //       },
      //       {
      //         format: Format.F32_RGB,
      //         bufferByteOffset: 4 * 6,
      //         location: Number(NORMAL_MATRIX2),
      //         divisor: 1,
      //       },
      //     ],
      //     data: new Float32Array(normalMatrix),
      //   });
      // }
    });

    this.geometry.instancedCount = objects.length;

    this.geometry.setVertexBuffer({
      bufferIndex: VertexAttributeBufferIndex.MODEL_MATRIX,
      byteStride: 4 * (4 * 4),
      frequency: VertexBufferFrequency.PerInstance,
      attributes: [
        {
          format: Format.F32_RGBA,
          bufferByteOffset: 4 * 0,
          location: VertexAttributeLocation.MODEL_MATRIX0,
          divisor: 1,
        },
        {
          format: Format.F32_RGBA,
          bufferByteOffset: 4 * 4,
          location: VertexAttributeLocation.MODEL_MATRIX1,
          divisor: 1,
        },
        {
          format: Format.F32_RGBA,
          bufferByteOffset: 4 * 8,
          location: VertexAttributeLocation.MODEL_MATRIX2,
          divisor: 1,
        },
        {
          format: Format.F32_RGBA,
          bufferByteOffset: 4 * 12,
          location: VertexAttributeLocation.MODEL_MATRIX3,
          divisor: 1,
        },
      ],
      data: new Float32Array(packedModelMatrix),
    });

    this.geometry.setVertexBuffer({
      bufferIndex: VertexAttributeBufferIndex.FILL,
      byteStride: 4 * 4,
      frequency: VertexBufferFrequency.PerInstance,
      attributes: [
        {
          format: Format.F32_RGBA,
          bufferByteOffset: 4 * 0,
          location: VertexAttributeLocation.COLOR,
          divisor: 1,
        },
      ],
      data: new Float32Array(packedFill),
    });

    this.geometry.setVertexBuffer({
      bufferIndex: VertexAttributeBufferIndex.STROKE,
      byteStride: 4 * 4,
      frequency: VertexBufferFrequency.PerInstance,
      attributes: [
        {
          format: Format.F32_RGBA,
          bufferByteOffset: 4 * 0,
          location: VertexAttributeLocation.STROKE_COLOR,
          divisor: 1,
        },
      ],
      data: new Float32Array(packedStroke),
    });

    this.geometry.setVertexBuffer({
      bufferIndex: VertexAttributeBufferIndex.PACKED_STYLE1,
      byteStride: 4 * 4,
      frequency: VertexBufferFrequency.PerInstance,
      attributes: [
        {
          format: Format.F32_RGBA,
          bufferByteOffset: 4 * 0,
          location: VertexAttributeLocation.PACKED_STYLE1,
          divisor: 1,
        },
      ],
      data: new Float32Array(packedStyle1),
    });

    this.geometry.setVertexBuffer({
      bufferIndex: VertexAttributeBufferIndex.PACKED_STYLE2,
      byteStride: 4 * 4,
      frequency: VertexBufferFrequency.PerInstance,
      attributes: [
        {
          format: Format.F32_RGBA,
          bufferByteOffset: 4 * 0,
          location: VertexAttributeLocation.PACKED_STYLE2,
          divisor: 1,
        },
      ],
      data: new Float32Array(packedStyle2),
    });

    this.geometry.setVertexBuffer({
      bufferIndex: VertexAttributeBufferIndex.PICKING_COLOR,
      byteStride: 4 * 4,
      frequency: VertexBufferFrequency.PerInstance,
      attributes: [
        {
          format: Format.F32_RGBA,
          bufferByteOffset: 4 * 0,
          location: VertexAttributeLocation.PICKING_COLOR,
          divisor: 1,
        },
      ],
      data: new Float32Array(packedPicking),
    });
  }

  destroy() {
    if (this.geometry) {
      this.geometry.destroy();
    }
    if (this.inputState) {
      this.inputState.destroy();
    }
  }

  applyRenderInst(renderInst: RenderInst, objects: DisplayObject[]) {
    // detect if scene changed, eg. lights & fog
    const lights = this.lightPool.getAllLights();
    const fog = this.lightPool.getFog();
    const useFog = !!fog;
    const useLight = !!lights.length;

    // toggle fog, need re-compile material
    if (useFog !== this.material.defines.USE_FOG || useLight !== this.material.defines.USE_LIGHT) {
      this.material.programDirty = true;
    }
    this.material.defines.USE_FOG = useFog;
    this.material.defines.USE_LIGHT = useLight;
    this.material.defines = {
      ...this.material.defines,
      ...this.lightPool.getDefines(),
    };

    if (this.clipPathTarget || this.clipPath) {
      if (this.clipPathTarget) {
        this.material.stencilWrite = true;
        // @see https://open.gl/depthstencils
        this.material.depthWrite = false;
        this.material.stencilCompare = CompareMode.Always;
        this.material.stencilPassOp = StencilOp.Replace;
      } else {
        this.material.stencilWrite = false;
        this.material.depthWrite = true;
        this.material.stencilCompare = CompareMode.Equal;
        this.material.stencilPassOp = StencilOp.Keep;
      }
    } else {
      this.material.stencilWrite = false;
    }

    // re-upload textures
    if (this.material.textureDirty || this.materialDirty) {
      this.textureMappings = [];

      // set texture mappings
      const fillTextureMapping = this.createFillGradientTextureMapping(objects);
      if (fillTextureMapping) {
        this.material.defines.USE_UV = true;
        this.material.defines.USE_MAP = true;
        this.textureMappings.push(fillTextureMapping);
      }
    }

    // re-compile program, eg. DEFINE changed
    if (this.material.programDirty || this.materialDirty) {
      this.createMaterial(objects);
      // set defines
      this.material.defines = {
        ...this.material.defines,
        ...enumToObject(VertexAttributeLocation),
      };
      Object.keys(this.material.defines).forEach((key) => {
        const value = this.material.defines[key];
        if (typeof value === 'number') {
          this.program.setDefineString(key, `${value}`);
        } else {
          this.program.setDefineBool(key, value);
        }
      });

      // build shaders
      this.program.vert = this.material.vertexShader;
      this.program.frag = this.material.fragmentShader;
      // use cached program
      this.programDescriptorSimpleWithOrig = preprocessProgramObj_GLSL(this.device, this.program);
      this.material.programDirty = false;
    }

    if (this.material.textureDirty || this.materialDirty) {
      Object.keys(this.material.textures)
        .sort((a, b) => this.material.samplers.indexOf(a) - this.material.samplers.indexOf(b))
        .forEach((key) => {
          const mapping = new TextureMapping();
          mapping.name = key;
          mapping.texture = this.material.textures[key];

          this.device.setResourceName(mapping.texture, 'Material Texture ' + key);
          mapping.sampler = this.renderHelper.getCache().createSampler({
            wrapS: WrapMode.Clamp,
            wrapT: WrapMode.Clamp,
            minFilter: TexFilterMode.Point,
            magFilter: TexFilterMode.Bilinear,
            mipFilter: MipFilterMode.Linear,
            minLOD: 0,
            maxLOD: 0,
          });

          this.textureMappings.push(mapping);
        });

      this.material.textureDirty = false;
      this.materialDirty = false;
    }

    if (this.material.geometryDirty) {
      // wireframe 需要额外生成 geometry 重心坐标
      this.geometryDirty = true;
      this.inputStateDirty = true;
      this.material.geometryDirty = false;
    }

    if (this.geometryDirty || this.geometry.dirty) {
      // destroy first
      if (this.geometry) {
        this.geometry.destroy();
      }
      // re-create buffer geometry
      this.createGeometry(objects);

      // generate wireframe
      if (this.material.wireframe) {
        this.generateWireframe(this.geometry);
      }

      // sync to internal Geometry
      this.geometryDirty = false;
      this.geometry.dirty = false;
      this.inputStateDirty = true;
    }

    // cached input layout
    const inputLayout = this.renderHelper
      .getCache()
      .createInputLayout(this.geometry.inputLayoutDescriptor);

    const program = this.renderHelper
      .getCache()
      .createProgramSimple(this.programDescriptorSimpleWithOrig);

    const useIndexes = !!this.geometry.indexBuffer;
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
        useIndexes ? { buffer: this.geometry.indexBuffer, byteOffset: 0 } : null,
        program,
      );
      this.inputStateDirty = false;
    }

    renderInst.renderPipelineDescriptor.topology = this.geometry.drawMode;
    renderInst.setProgram(program);
    renderInst.setInputLayoutAndState(inputLayout, this.inputState);

    this.renderer.beforeUploadUBO(renderInst, this, this.index);
    // upload uniform buffer object
    this.uploadUBO(renderInst);

    if (useIndexes) {
      // drawElements
      renderInst.drawIndexesInstanced(
        this.geometry.vertexCount,
        this.geometry.instancedCount,
        this.geometry.indexStart,
      );
    } else {
      // drawArrays
      renderInst.drawPrimitives(this.geometry.vertexCount, this.geometry.primitiveStart);
    }
    // FIXME: 暂时都当作非透明物体，按照创建顺序排序
    renderInst.sortKey = makeSortKeyOpaque(RendererLayer.OPAQUE, objects[0].sortable.renderOrder);
  }

  /**
   * update a continuous GPU buffer
   */
  protected updateBatchedAttribute(
    objects: DisplayObject[],
    startIndex: number,
    name: string,
    value: any,
  ) {
    const stylePacked1 = ['opacity', 'fillOpacity', 'strokeOpacity', 'lineWidth'];

    if (name === 'fill') {
      const { fill } = this.instance.parsedStyle;
      const i = this.textureMappings.findIndex((m) => m.name === FILL_TEXTURE_MAPPING);
      if (fill?.type === PARSED_COLOR_TYPE.Constant) {
        const fillColors: number[] = [];
        objects.forEach((object) => fillColors.push(...object.parsedStyle.fill.value));

        this.geometry.updateVertexBuffer(
          VertexAttributeBufferIndex.FILL,
          VertexAttributeLocation.COLOR,
          startIndex,
          new Uint8Array(new Float32Array(fillColors).buffer),
        );
        if (i >= 0) {
          // remove original fill texture mapping
          this.textureMappings.splice(i, -1);
        }
      } else {
        const fillTextureMapping = this.createFillGradientTextureMapping([this.instance]);
        if (i >= 0) {
          this.textureMappings.splice(i, 1, fillTextureMapping);
        }
        this.material.textureDirty = true;
      }
    } else if (name === 'stroke') {
      const strokeColors: number[] = [];
      objects.forEach((object) => strokeColors.push(...object.parsedStyle.stroke.value));

      this.geometry.updateVertexBuffer(
        VertexAttributeBufferIndex.STROKE,
        VertexAttributeLocation.STROKE_COLOR,
        startIndex,
        new Uint8Array(new Float32Array(strokeColors).buffer),
      );
    } else if (stylePacked1.indexOf(name) > -1) {
      const packed: number[] = [];
      objects.forEach((object) => {
        const { opacity, fillOpacity, strokeOpacity, lineWidth } =
          object.parsedStyle as ParsedBaseStyleProps;
        packed.push(opacity, fillOpacity, strokeOpacity, lineWidth.value);
      });

      this.geometry.updateVertexBuffer(
        VertexAttributeBufferIndex.PACKED_STYLE1,
        VertexAttributeLocation.PACKED_STYLE1,
        startIndex,
        new Uint8Array(new Float32Array(packed).buffer),
      );
    } else if (name === 'modelMatrix') {
      const packed: number[] = [];
      objects.forEach((object) => {
        const modelMatrix = mat4.copy(mat4.create(), object.getWorldTransform());
        packed.push(...modelMatrix);
      });

      this.geometry.updateVertexBuffer(
        VertexAttributeBufferIndex.MODEL_MATRIX,
        VertexAttributeLocation.MODEL_MATRIX0,
        startIndex,
        new Uint8Array(new Float32Array(packed).buffer),
      );
    } else if (name === 'visibility' || name === 'anchor') {
      const packed: number[] = [];
      objects.forEach((object) => {
        const { visibility, anchor } = object.parsedStyle;
        packed.push(visibility === 'visible' ? 1 : 0, anchor[0], anchor[1], 0);
      });
      this.geometry.updateVertexBuffer(
        VertexAttributeBufferIndex.PACKED_STYLE2,
        VertexAttributeLocation.PACKED_STYLE2,
        startIndex,
        new Uint8Array(new Float32Array(packed).buffer),
      );
    }
  }

  updateAttribute(objects: DisplayObject[], startIndex: number, name: string, value: any): void {
    if (name === 'clipPath') {
      if (this.clipPath) {
        this.geometryDirty = true;
      }
    }
  }

  changeRenderOrder(object: DisplayObject, renderOrder: number) {
    const index = this.objects.indexOf(object);

    // @ts-ignore
    const encodedPickingColor = object.renderable3D?.encodedPickingColor || [0, 0, 0];
    this.geometry.updateVertexBuffer(
      VertexAttributeBufferIndex.PICKING_COLOR,
      VertexAttributeLocation.PICKING_COLOR,
      index,
      new Uint8Array(
        new Float32Array([...encodedPickingColor, renderOrder * RENDER_ORDER_SCALE]).buffer,
      ),
    );
  }

  private generateWireframe(geometry: BufferGeometry) {
    // need generate barycentric coordinates
    const indices = geometry.indices;
    const indiceNum = geometry.indices.length;

    const originalVertexBuffers = geometry.vertices.map((buffer) => {
      // @ts-ignore
      return buffer.slice();
    }) as ArrayBufferView[];

    for (let i = VertexAttributeBufferIndex.PICKING_COLOR; i < geometry.vertexBuffers.length; i++) {
      const { byteStride } = geometry.inputLayoutDescriptor.vertexBufferDescriptors[i];
      geometry.vertices[i] = new Float32Array((byteStride / 4) * indiceNum);
    }

    // reallocate attribute data
    let cursor = 0;
    const uniqueIndices = new Uint32Array(indiceNum);
    for (let i = 0; i < indiceNum; i++) {
      const ii = indices[i];

      for (let j = 1; j < geometry.vertices.length; j++) {
        const { byteStride } = geometry.inputLayoutDescriptor.vertexBufferDescriptors[j];
        const size = byteStride / 4;

        for (let k = 0; k < size; k++) {
          geometry.vertices[j][cursor * size + k] = originalVertexBuffers[j][ii * size + k];
        }
      }

      uniqueIndices[i] = cursor;
      cursor++;
    }

    for (let i = VertexAttributeBufferIndex.PICKING_COLOR; i < geometry.vertexBuffers.length; i++) {
      if (i === 4) {
        continue;
      }

      const { frequency, byteStride } = geometry.inputLayoutDescriptor.vertexBufferDescriptors[i];

      const descriptor = geometry.inputLayoutDescriptor.vertexAttributeDescriptors.find(
        ({ bufferIndex }) => bufferIndex === i,
      );
      if (descriptor) {
        const { location, bufferIndex, bufferByteOffset, format, divisor } = descriptor;

        geometry.setVertexBuffer({
          bufferIndex,
          byteStride,
          frequency,
          attributes: [
            {
              format,
              bufferByteOffset,
              location,
              divisor,
            },
          ],
          data: geometry.vertices[i],
        });

        // geometry.updateVertexBuffer(
        //   bufferIndex,
        //   location,
        //   0,
        //   new Uint8Array(geometry.vertices[i].buffer),
        // );
      }
    }

    // create barycentric attributes
    const barycentricBuffer = new Float32Array(indiceNum * 3);
    for (let i = 0; i < indiceNum; ) {
      for (let j = 0; j < 3; j++) {
        const ii = uniqueIndices[i++];
        barycentricBuffer[ii * 3 + j] = 1;
      }
    }

    geometry.setVertexBuffer({
      bufferIndex: VertexAttributeBufferIndex.BARYCENTRIC,
      byteStride: 4 * 3,
      frequency: VertexBufferFrequency.PerVertex,
      attributes: [
        {
          format: Format.F32_RGB,
          bufferByteOffset: 4 * 0,
          location: Number(VertexAttributeLocation.BARYCENTRIC),
        },
      ],
      data: barycentricBuffer,
    });

    geometry.setIndexBuffer(uniqueIndices);
  }

  protected beforeUploadUBO(renderInst: RenderInst, objects: DisplayObject[], i: number): void {}
  private uploadUBO(renderInst: RenderInst): void {
    const numUniformBuffers = 1; // Scene UBO
    const material = this.material;
    const lights = this.lightPool.getAllLights();
    const fog = this.lightPool.getFog();
    const useFog = !!fog;
    const useLight = !!lights.length;
    const useWireframe = material.defines.USE_WIREFRAME;

    // collect uniforms
    const uniforms = [];
    if (useWireframe) {
      const wireframeColor = parseColor(material.wireframeColor).value as Tuple4Number;
      uniforms.push({
        name: 'u_WireframeLineColor',
        value: wireframeColor.slice(0, 3),
      });
      uniforms.push({
        name: 'u_WireframeLineWidth',
        value: material.wireframeLineWidth,
      });
    }

    if (useFog) {
      this.uploadFog(uniforms, fog);
    }
    this.uploadMaterial(uniforms, material);

    if (useLight) {
      const counter: Record<string, number> = {};

      lights.forEach((light) => {
        if (!counter[light.define]) {
          counter[light.define] = -1;
        }

        counter[light.define]++;

        light.uploadUBO(uniforms, counter[light.define]);
      });
    }

    uniforms.sort(
      (a, b) =>
        this.material.uniformNames.indexOf(a.name) - this.material.uniformNames.indexOf(b.name),
    );

    renderInst.setUniforms(numUniformBuffers, uniforms);

    const {
      depthCompare,
      depthWrite,
      stencilCompare,
      stencilWrite,
      stencilPassOp,
      stencilRef,
      cullMode,
      frontFace,
      polygonOffset,
      blendEquation,
      blendEquationAlpha,
      blendSrc,
      blendDst,
      blendSrcAlpha,
      blendDstAlpha,
    } = material;

    renderInst.setMegaStateFlags({
      attachmentsState: [
        {
          // should not affect color buffer when drawing stencil
          channelWriteMask: this.material.stencilWrite
            ? ChannelWriteMask.None
            : ChannelWriteMask.AllChannels,
          // channelWriteMask: ChannelWriteMask.AllChannels,
          rgbBlendState: {
            blendMode: blendEquation,
            blendSrcFactor: blendSrc,
            blendDstFactor: blendDst,
          },
          alphaBlendState: {
            blendMode: blendEquationAlpha,
            blendSrcFactor: blendSrcAlpha,
            blendDstFactor: blendDstAlpha,
          },
        },
      ],
      // blendConstant: Color;
      depthCompare,
      depthWrite,
      stencilCompare,
      stencilWrite,
      stencilPassOp,
      stencilRef,
      cullMode,
      frontFace,
      polygonOffset,
    });

    renderInst.setBindingLayouts([
      {
        numUniformBuffers,
        numSamplers: this.textureMappings.length,
        samplerEntries: this.samplerEntries,
      },
    ]);

    renderInst.setSamplerBindingsFromTextureMappings(this.textureMappings);
  }

  private uploadFog(uniforms: RenderInstUniform[], fog: Fog) {
    const { type, fill, start, end, density } = fog.parsedStyle;

    if (fill?.type === PARSED_COLOR_TYPE.Constant) {
      const fillColor = fill.value as Tuple4Number;
      uniforms.push({
        name: 'u_FogInfos',
        value: [type, start, end, density],
      });
      uniforms.push({
        name: 'u_FogColor',
        value: fillColor,
      });
    }
  }

  private uploadMaterial(uniforms: RenderInstUniform[], material: Material) {
    // sort
    const materialUniforms = Object.keys(material.uniforms).map((name) => ({
      name,
      value: material.uniforms[name],
    }));
    uniforms.push(...materialUniforms);
  }

  protected createFillGradientTextureMapping(objects: DisplayObject[]): TextureMapping | null {
    const instance = objects[0];

    const fill = (
      instance.nodeName === Shape.LINE ? instance.parsedStyle.stroke : instance.parsedStyle.fill
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

      const fillMapping = new TextureMapping();
      fillMapping.name = FILL_TEXTURE_MAPPING;
      fillMapping.texture = this.texturePool.getOrCreateTexture(
        this.device,
        texImageSource,
        makeTextureDescriptor2D(Format.U8_RGBA_NORM, 1, 1, 1),
        () => {
          // need re-render
          objects.forEach((object) => {
            object.renderable.dirty = true;

            this.renderingService.dirtify();
          });
        },
      );
      this.device.setResourceName(fillMapping.texture, 'Fill Texture' + this.id);
      fillMapping.sampler = this.renderHelper.getCache().createSampler({
        // wrapS: WrapMode.Clamp,
        // wrapT: WrapMode.Clamp,
        wrapS: WrapMode.Repeat,
        wrapT: WrapMode.Repeat,
        minFilter: TexFilterMode.Point,
        magFilter: TexFilterMode.Bilinear,
        mipFilter: MipFilterMode.Linear,
        minLOD: 0,
        maxLOD: 0,
      });

      return fillMapping;
    }

    return null;
  }
}
