import {
  Camera,
  DefaultCamera,
  DisplayObject,
  parseColor,
  ParsedColorStyleProperty,
  PARSED_COLOR_TYPE,
  RenderingService,
  SHAPE,
} from '@antv/g';
import type { Tuple4Number } from '@antv/g';
import { inject, injectable } from 'mana-syringe';
import { mat4 } from 'gl-matrix';
import { BufferGeometry, VertexAttributeLocation } from '../geometries';
import { Material, ShaderMaterial } from '../materials';
import {
  BindingLayoutSamplerDescriptor,
  ChannelWriteMask,
  CompareMode,
  Device,
  Format,
  InputState,
  makeTextureDescriptor2D,
  MipFilterMode,
  StencilOp,
  TexFilterMode,
  VertexBufferFrequency,
  WrapMode,
} from '../platform';
import {
  DeviceProgram,
  makeSortKeyOpaque,
  RendererLayer,
  RenderHelper,
  RenderInst,
  RenderInstUniform,
  TextureMapping,
} from '../render';
import { preprocessProgramObj_GLSL, ProgramDescriptorSimpleWithOrig } from '../shader/compiler';
import { RENDER_ORDER_SCALE, Batch } from '../renderer/Batch';
import { TexturePool } from '../TexturePool';
import { Fog } from '../lights';
import { LightPool } from '../LightPool';
import { enumToObject } from '../utils/enum';

let counter = 1;
const FILL_TEXTURE_MAPPING = 'FillTextureMapping';

export enum InstancedVertexAttributeBufferIndex {
  INSTANCED = 0,
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
    const packed = [];

    // const useNormal = this.material.defines.NORMAL;

    objects.forEach((object) => {
      const {
        fill,
        stroke,
        opacity,
        fillOpacity,
        strokeOpacity,
        lineWidth = 0,
        lineDash,
        anchor,
        visibility,
      } = object.parsedStyle;
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
      bufferIndex: InstancedVertexAttributeBufferIndex.INSTANCED,
      byteStride: 4 * (4 * 4 + 4 + 4 + 4 + 4 + 4 + 2),
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
        {
          format: Format.F32_RGBA,
          bufferByteOffset: 4 * 16,
          location: VertexAttributeLocation.COLOR,
          divisor: 1,
        },
        {
          format: Format.F32_RGBA,
          bufferByteOffset: 4 * 20,
          location: VertexAttributeLocation.STROKE_COLOR,
          divisor: 1,
        },
        {
          format: Format.F32_RGBA,
          bufferByteOffset: 4 * 24,
          location: VertexAttributeLocation.PACKED_STYLE1,
          divisor: 1,
        },
        {
          format: Format.F32_RGBA,
          bufferByteOffset: 4 * 28,
          location: VertexAttributeLocation.PACKED_STYLE2,
          divisor: 1,
        },
        {
          format: Format.F32_RGBA,
          bufferByteOffset: 4 * 32,
          location: VertexAttributeLocation.PICKING_COLOR,
          divisor: 1,
        },
        {
          format: Format.F32_RG,
          bufferByteOffset: 4 * 36,
          location: VertexAttributeLocation.ANCHOR,
          divisor: 1,
        },
      ],
      data: new Float32Array(packed),
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
    const useWireframe = this.material.defines.USE_WIREFRAME;

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

  protected updateBatchedAttribute(object: DisplayObject, index: number, name: string, value: any) {
    const stylePacked1 = ['opacity', 'fillOpacity', 'strokeOpacity', 'lineWidth'];

    if (name === 'fill') {
      const { fill } = object.parsedStyle;
      const i = this.textureMappings.findIndex((m) => m.name === FILL_TEXTURE_MAPPING);
      let fillColor: Tuple4Number = [0, 0, 0, 0];
      if (fill?.type === PARSED_COLOR_TYPE.Constant) {
        fillColor = fill.value;

        this.geometry.updateVertexBuffer(
          InstancedVertexAttributeBufferIndex.INSTANCED,
          VertexAttributeLocation.COLOR,
          index,
          new Uint8Array(new Float32Array([...fillColor]).buffer),
        );
        if (i >= 0) {
          // remove original fill texture mapping
          this.textureMappings.splice(i, -1);
        }
      } else {
        const fillTextureMapping = this.createFillGradientTextureMapping([object]);
        if (i >= 0) {
          this.textureMappings.splice(i, 1, fillTextureMapping);
        }
        this.material.textureDirty = true;
      }
    } else if (name === 'stroke') {
      const { stroke } = object.parsedStyle;
      let strokeColor: Tuple4Number = [0, 0, 0, 0];
      if (stroke?.type === PARSED_COLOR_TYPE.Constant) {
        strokeColor = stroke.value;
      }

      this.geometry.updateVertexBuffer(
        InstancedVertexAttributeBufferIndex.INSTANCED,
        VertexAttributeLocation.STROKE_COLOR,
        index,
        new Uint8Array(new Float32Array([...strokeColor]).buffer),
      );
    } else if (stylePacked1.indexOf(name) > -1) {
      const { opacity, fillOpacity, strokeOpacity, lineWidth = 0 } = object.parsedStyle;
      this.geometry.updateVertexBuffer(
        InstancedVertexAttributeBufferIndex.INSTANCED,
        VertexAttributeLocation.PACKED_STYLE1,
        index,
        new Uint8Array(new Float32Array([opacity, fillOpacity, strokeOpacity, lineWidth]).buffer),
      );
    } else if (name === 'modelMatrix') {
      const modelMatrix = mat4.copy(mat4.create(), object.getWorldTransform());
      this.geometry.updateVertexBuffer(
        InstancedVertexAttributeBufferIndex.INSTANCED,
        VertexAttributeLocation.MODEL_MATRIX0,
        index,
        new Uint8Array(new Float32Array(modelMatrix).buffer),
      );
    } else if (name === 'anchor') {
      const { anchor } = object.parsedStyle;
      this.geometry.updateVertexBuffer(
        InstancedVertexAttributeBufferIndex.INSTANCED,
        VertexAttributeLocation.ANCHOR,
        index,
        new Uint8Array(new Float32Array([anchor[0], anchor[1]]).buffer),
      );
    } else if (name === 'visibility') {
      const { visibility } = object.parsedStyle;
      this.geometry.updateVertexBuffer(
        InstancedVertexAttributeBufferIndex.INSTANCED,
        VertexAttributeLocation.PACKED_STYLE2,
        index,
        new Uint8Array(new Float32Array([visibility === 'visible' ? 1 : 0]).buffer),
      );
    }
  }

  updateAttribute(object: DisplayObject, name: string, value: any): void {
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
      InstancedVertexAttributeBufferIndex.INSTANCED,
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

    for (let i = 1; i < geometry.vertexBuffers.length; i++) {
      const { byteStride } = geometry.inputLayoutDescriptor.vertexBufferDescriptors[i];
      geometry.vertices[i] = new Float32Array((byteStride / 4) * indiceNum);
    }

    // reallocate attribute data
    let cursor = 0;
    const uniqueIndices = new Uint32Array(indiceNum);
    for (var i = 0; i < indiceNum; i++) {
      var ii = indices[i];

      for (let j = 1; j < geometry.vertices.length; j++) {
        const { byteStride } = geometry.inputLayoutDescriptor.vertexBufferDescriptors[j];
        const size = byteStride / 4;

        for (var k = 0; k < size; k++) {
          geometry.vertices[j][cursor * size + k] = originalVertexBuffers[j][ii * size + k];
        }
      }

      uniqueIndices[i] = cursor;
      cursor++;
    }

    for (let i = 1; i < geometry.vertexBuffers.length; i++) {
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
      bufferIndex: 4,
      byteStride: 4 * 3,
      frequency: VertexBufferFrequency.PerVertex,
      attributes: [
        {
          format: Format.F32_RGB,
          bufferByteOffset: 4 * 0,
          location: Number(this.material.defines.BARYCENTRIC),
        },
      ],
      data: barycentricBuffer,
    });

    geometry.setIndexBuffer(uniqueIndices);
  }

  protected beforeUploadUBO(renderInst: RenderInst, objects: DisplayObject[], i: number): void {}
  private uploadUBO(renderInst: RenderInst): void {
    let numUniformBuffers = 1; // Scene UBO
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
