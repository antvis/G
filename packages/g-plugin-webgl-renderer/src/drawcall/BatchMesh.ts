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
import { mat3, mat4 } from 'gl-matrix';
import { BufferGeometry, Geometry, makeStaticDataBuffer } from '../geometries';
import { Material, ShaderMaterial } from '../materials';
import {
  BindingLayoutSamplerDescriptor,
  BufferUsage,
  ChannelWriteMask,
  CompareMode,
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
  fillVec4,
  makeSortKeyOpaque,
  RendererLayer,
  RenderHelper,
  RenderInst,
  TextureMapping,
} from '../render';
import { preprocessProgramObj_GLSL, ProgramDescriptorSimpleWithOrig } from '../shader/compiler';
import { AttributeLocation, RENDER_ORDER_SCALE, Batch } from './Batch';
import { TexturePool } from '../TexturePool';
import { Fog } from '../lights';
import { LightPool } from '../LightPool';

let counter = 1;
const FILL_TEXTURE_MAPPING = 'FillTextureMapping';

@injectable()
export abstract class BatchMesh {
  id = counter++;

  @inject(RenderHelper)
  protected renderHelper: RenderHelper;

  @inject(TexturePool)
  protected texturePool: TexturePool;

  @inject(DefaultCamera)
  protected camera: Camera;

  @inject(LightPool)
  protected lightPool: LightPool;

  renderingService: RenderingService;

  bufferGeometry: BufferGeometry = new BufferGeometry();
  material: Material = new ShaderMaterial();
  geometry: Geometry = new Geometry();

  clipPath: DisplayObject;
  clipPathTarget: DisplayObject;

  private inputState: InputState;
  private program: DeviceProgram = new DeviceProgram();
  private programDescriptorSimpleWithOrig?: ProgramDescriptorSimpleWithOrig;
  geometryDirty = true;
  private inputStateDirty = true;
  /**
   * texture mappings
   */
  protected textureMappings: TextureMapping[] = [];
  protected samplerEntries: BindingLayoutSamplerDescriptor[];

  protected abstract createGeometry(objects: DisplayObject[]): void;
  protected abstract createMaterial(objects: DisplayObject[]): void;

  protected createBatchedGeometry(objects: DisplayObject[]) {
    const modelMatrix = mat4.create();
    const modelViewMatrix = mat4.create();
    const normalMatrix = mat3.create();
    const packed = [];
    objects.forEach((object) => {
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

      if (this.clipPathTarget) {
        // account for target's rts
        mat4.copy(modelMatrix, object.getLocalTransform());
        fillColor = [1, 1, 1, 1];
        mat4.mul(modelMatrix, this.clipPathTarget.getWorldTransform(), modelMatrix);
      } else {
        mat4.copy(modelMatrix, object.getWorldTransform());
      }
      mat4.mul(modelViewMatrix, this.camera.getViewTransform(), modelMatrix);
      // should not calc normal matrix in shader, mat3.invert is not cheap
      // @see https://stackoverflow.com/a/21079741
      mat3.fromMat4(normalMatrix, modelViewMatrix);
      mat3.invert(normalMatrix, normalMatrix);
      mat3.transpose(normalMatrix, normalMatrix);

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
    });

    this.bufferGeometry.instancedCount = objects.length;

    this.bufferGeometry.setVertexBuffer({
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

  destroy() {
    if (this.geometry) {
      this.geometry.destroy();
    }
    if (this.inputState) {
      this.inputState.destroy();
    }
  }

  shouldSubmitRenderInst(renderInst: RenderInst, objects: DisplayObject[], index: number) {
    return true;
  }

  applyRenderInst(renderInst: RenderInst, objects: DisplayObject[], i: number) {
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
    if (this.material.textureDirty) {
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
    if (this.material.programDirty) {
      this.createMaterial(objects);
      // set defines
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
      this.programDescriptorSimpleWithOrig = preprocessProgramObj_GLSL(
        this.geometry.device,
        this.program,
      );
      this.material.programDirty = false;
    }

    if (this.material.textureDirty) {
      this.material.textures.forEach(({ name, texture }) => {
        const mapping = new TextureMapping();
        const { src, sampler, pixelStore, loadedTexture } = texture.descriptor;

        mapping.name = name;
        if (loadedTexture) {
          mapping.texture = loadedTexture;
        } else {
          mapping.texture = this.texturePool.getOrCreateTexture(
            this.geometry.device,
            src,
            {
              ...makeTextureDescriptor2D(Format.U8_RGBA_NORM, 1, 1, 1),
              pixelStore,
            },
            () => {
              // need re-render
              objects.forEach((object) => {
                const renderable = object.renderable;
                renderable.dirty = true;

                this.renderingService.dirtify();
              });
            },
          );
        }
        this.geometry.device.setResourceName(mapping.texture, 'Material Texture ' + name);
        mapping.sampler = this.renderHelper.getCache().createSampler(sampler);

        this.textureMappings.push(mapping);
      });
      this.material.textureDirty = false;
    }

    if (this.material.geometryDirty) {
      // wireframe 需要额外生成 geometry 重心坐标
      this.geometryDirty = true;
      this.inputStateDirty = true;
      this.material.geometryDirty = false;
    }

    if (this.geometryDirty) {
      // destroy first
      if (this.geometry) {
        this.geometry.destroy();
      }
      // re-create buffer geometry
      this.createGeometry(objects);

      // generate wireframe
      if (this.material.wireframe) {
        this.generateWireframe(this.bufferGeometry);
      }

      // sync to internal Geometry
      if (this.bufferGeometry.indices) {
        this.geometry.setIndices(this.bufferGeometry.indices);
      }
      this.geometry.primitiveStart = this.bufferGeometry.primitiveStart;
      this.geometry.indexStart = this.bufferGeometry.indexStart;
      this.geometry.vertexCount = this.bufferGeometry.vertexCount;
      this.geometry.instancedCount = this.bufferGeometry.instancedCount;
      this.geometry.inputLayoutDescriptor = this.bufferGeometry.inputLayoutDescriptor;
      this.bufferGeometry.vertexBuffers.forEach((data, i) => {
        const buffer = makeStaticDataBuffer(this.geometry.device, BufferUsage.Vertex, data.buffer);
        this.geometry.vertexBuffers[i] = buffer;
      });

      this.geometryDirty = false;
      this.inputStateDirty = true;
    }

    // cached input layout
    const inputLayout = this.renderHelper
      .getCache()
      .createInputLayout(this.geometry.inputLayoutDescriptor);

    const program = this.renderHelper
      .getCache()
      .createProgramSimple(this.programDescriptorSimpleWithOrig);

    const useIndexes = !!this.geometry.indicesBuffer;
    // prevent rebinding VAO too many times
    if (this.inputStateDirty) {
      if (this.inputState) {
        this.inputState.destroy();
      }
      this.inputState = this.geometry.device.createInputState(
        inputLayout,
        this.geometry.vertexBuffers.map((buffer) => ({
          buffer,
          byteOffset: 0,
        })),
        useIndexes ? { buffer: this.geometry.indicesBuffer, byteOffset: 0 } : null,
        program,
      );
      this.inputStateDirty = false;
    }

    renderInst.setProgram(program);
    renderInst.setInputLayoutAndState(inputLayout, this.inputState);

    this.beforeUploadUBO(renderInst, objects, i);
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
    renderInst.sortKey = makeSortKeyOpaque(RendererLayer.OPAQUE, program.id);
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
          Batch.CommonBufferIndex,
          AttributeLocation.a_Color,
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
        Batch.CommonBufferIndex,
        AttributeLocation.a_StrokeColor,
        index,
        new Uint8Array(new Float32Array([...strokeColor]).buffer),
      );
    } else if (stylePacked1.indexOf(name) > -1) {
      const { opacity, fillOpacity, strokeOpacity, lineWidth = 0 } = object.parsedStyle;
      this.geometry.updateVertexBuffer(
        Batch.CommonBufferIndex,
        AttributeLocation.a_StylePacked1,
        index,
        new Uint8Array(new Float32Array([opacity, fillOpacity, strokeOpacity, lineWidth]).buffer),
      );
    } else if (name === 'modelMatrix') {
      const modelMatrix = mat4.copy(mat4.create(), object.getWorldTransform());
      this.geometry.updateVertexBuffer(
        Batch.CommonBufferIndex,
        AttributeLocation.a_ModelMatrix0,
        index,
        new Uint8Array(new Float32Array(modelMatrix).buffer),
      );
    } else if (name === 'anchor') {
      const { anchor } = object.parsedStyle;
      this.geometry.updateVertexBuffer(
        Batch.CommonBufferIndex,
        AttributeLocation.a_Anchor,
        index,
        new Uint8Array(new Float32Array([anchor[0], anchor[1]]).buffer),
      );
    } else if (name === 'visibility') {
      const { visibility } = object.parsedStyle;
      this.geometry.updateVertexBuffer(
        Batch.CommonBufferIndex,
        AttributeLocation.a_StylePacked2,
        index,
        new Uint8Array(new Float32Array([visibility === 'visible' ? 1 : 0]).buffer),
      );
    }
  }

  protected abstract updateMeshAttribute(
    object: DisplayObject,
    index: number,
    name: string,
    value: any,
  ): void;
  updateAttribute(object: DisplayObject, index: number, name: string, value: any): void {
    if (name === 'clipPath') {
      if (this.clipPath) {
        this.geometryDirty = true;
      }
    }

    this.updateMeshAttribute(object, index, name, value);
  }

  changeRenderOrder(object: DisplayObject, index: number, renderOrder: number) {
    // wait for geometry updated
    if (!this.geometry.device || this.geometryDirty) {
      return;
    }
    // @ts-ignore
    const encodedPickingColor = object.renderable3D?.encodedPickingColor || [0, 0, 0];
    this.geometry.updateVertexBuffer(
      Batch.CommonBufferIndex,
      AttributeLocation.a_PickingColor,
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

    const originalVertexBuffers = geometry.vertexBuffers.map((buffer) => {
      // @ts-ignore
      return buffer.slice();
    });

    for (let i = 1; i < geometry.vertexBuffers.length; i++) {
      const { byteStride } = geometry.inputLayoutDescriptor.vertexBufferDescriptors[i];
      geometry.vertexBuffers[i] = new Float32Array((byteStride / 4) * indiceNum);
    }

    // reallocate attribute data
    let cursor = 0;
    const uniqueIndices = new Uint32Array(indiceNum);
    for (var i = 0; i < indiceNum; i++) {
      var ii = indices[i];

      for (let j = 1; j < geometry.vertexBuffers.length; j++) {
        const { byteStride } = geometry.inputLayoutDescriptor.vertexBufferDescriptors[j];
        const size = byteStride / 4;

        for (var k = 0; k < size; k++) {
          geometry.vertexBuffers[j][cursor * size + k] = originalVertexBuffers[j][ii * size + k];
        }
      }

      uniqueIndices[i] = cursor;
      cursor++;
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
          location: 13,
        },
      ],
      data: barycentricBuffer,
    });

    geometry.setIndices(uniqueIndices);
  }

  protected beforeUploadUBO(renderInst: RenderInst, objects: DisplayObject[], i: number): void {}
  private uploadUBO(renderInst: RenderInst): void {
    let numUniformBuffers = 1; // Scene UBO
    let wordCount = 0;

    const material = this.material;
    const lights = this.lightPool.getAllLights();
    const fog = this.lightPool.getFog();
    const useFog = !!fog;
    const useLight = !!lights.length;
    const useWireframe = material.defines.USE_WIREFRAME;

    // materials
    wordCount += material.uboBuffer.length;
    if (useWireframe) {
      wordCount += 4; // u_WireframeLineColor & u_WireframeLineWidth
    }
    // add fog
    if (useFog) {
      wordCount += 8;
    }
    if (useLight) {
      wordCount += lights.reduce((prev, cur) => prev + cur.getUniformWordCount(), 0);
    }

    let offs = renderInst.allocateUniformBuffer(numUniformBuffers, wordCount);
    const d = renderInst.mapUniformBufferF32(numUniformBuffers);
    if (useWireframe) {
      const wireframeColor = parseColor(material.wireframeColor).value as Tuple4Number;
      offs += fillVec4(
        d,
        offs,
        ...(wireframeColor.slice(0, 3) as [number, number, number]),
        material.wireframeLineWidth,
      ); // u_WireframeLineColor & u_WireframeLineWidth
    }

    if (useFog) {
      offs = this.uploadFog(d, offs, fog);
    }
    offs = this.uploadMaterial(d, offs, material);

    if (useLight) {
      lights.forEach((light) => {
        offs += light.uploadUBO(d, offs);
      });
    }

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

  private uploadFog(d: Float32Array, offs: number, fog: Fog) {
    const { type, fill, start, end, density } = fog.parsedStyle;

    if (fill?.type === PARSED_COLOR_TYPE.Constant) {
      const fillColor = fill.value as Tuple4Number;
      offs += fillVec4(d, offs, type, start, end, density); // u_FogInfos
      offs += fillVec4(d, offs, ...fillColor); // u_FogColor
    }
    return offs;
  }

  private uploadMaterial(d: Float32Array, offs: number, material: Material) {
    for (let i = 0; i < material.uboBuffer.length; i += 4) {
      offs += fillVec4(
        d,
        offs,
        material.uboBuffer[i],
        material.uboBuffer[i + 1],
        material.uboBuffer[i + 2],
        material.uboBuffer[i + 3],
      );
    }
    return offs;
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
        this.geometry.device,
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
      this.geometry.device.setResourceName(fillMapping.texture, 'Fill Texture' + this.id);
      fillMapping.sampler = this.renderHelper.getCache().createSampler({
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

      return fillMapping;
    }

    return null;
  }
}
