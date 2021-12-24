import { inject, injectable } from 'mana-syringe';
import {
  DisplayObject,
  Image,
  parseColor,
  PARSED_COLOR_TYPE,
  Renderable,
  SHAPE,
  Tuple4Number,
} from '@antv/g';
import {
  BufferUsage,
  ChannelWriteMask,
  Format,
  makeTextureDescriptor2D,
  MipFilterMode,
  TexFilterMode,
  VertexBufferFrequency,
  WrapMode,
} from '../platform';
import { RenderInst } from '../render/RenderInst';
import { DeviceProgram } from '../render/DeviceProgram';
import { Batch, AttributeLocation } from './Batch';
import { ShapeRenderer } from '../tokens';
import { TextureMapping } from '../render/TextureHolder';
import { Mesh } from '../Mesh';
import { BufferGeometry, makeStaticDataBuffer } from '../geometries';
import { Material } from '../materials';
import { fillVec4 } from '../render/utils';
import { LightPool } from '../LightPool';
import { Fog } from '../lights';

@injectable({
  token: [{ token: ShapeRenderer, named: Mesh.tag }],
})
export class MeshRenderer extends Batch {
  protected program = new DeviceProgram();

  private textureMappings: TextureMapping[] = [];

  @inject(LightPool)
  private lightPool: LightPool;

  /**
   * material can be shared between many Canvases
   */
  private materialDirty = true;

  protected validate(object: Mesh): boolean {
    if (this.instance.nodeName === Mesh.tag) {
      // Material 必须为同一个，Geometry 类型必须相同，例如同为 CubeGeometry
      if (
        this.instance.parsedStyle.material !== object.parsedStyle.material ||
        this.instance.parsedStyle.geometry !== object.parsedStyle.geometry
      ) {
        return false;
      }
    }

    return true;
  }

  beforeRender() {
    const instance = this.instance as Mesh;
    const material = instance.style.material as Material;

    if (material.dirty || this.materialDirty) {
      this.textureMappings = [];

      const lights = this.lightPool.getAllLights();
      const useLight = !!lights.length;

      const lightCategory = {};
      lights.forEach((light) => {
        if (!lightCategory[light.define]) {
          lightCategory[light.define] = 0;
        }
        lightCategory[light.define]++;
      });
      material.defines = {
        ...material.defines,
        ...lightCategory,
      };
      if (useLight) {
        material.defines.USE_LIGHT = true;
      }

      // set defines
      Object.keys(material.defines).forEach((key) => {
        const value = material.defines[key];
        if (typeof value === 'number') {
          this.program.setDefineString(key, `${value}`);
        } else {
          this.program.setDefineBool(key, value);
        }
      });

      // build shaders
      this.program.vert = material.vertexShader;
      this.program.frag = material.fragmentShader;
      this.program.dirty = true;

      // set texture mappings
      material.textures.forEach(({ name, texture }) => {
        const mapping = new TextureMapping();
        const { src, sampler, flipY } = texture.descriptor;

        mapping.texture = this.texturePool.getOrCreateTexture(
          this.device,
          src,
          {
            ...makeTextureDescriptor2D(Format.U8_RGBA_NORM, 1, 1, 1),
            flipY,
          },
          () => {
            // need re-render
            this.objects.forEach((object) => {
              const renderable = object.renderable;
              renderable.dirty = true;

              this.renderingService.dirtify();
            });
          },
        );
        this.device.setResourceName(mapping.texture, 'Material Texture ' + name);
        mapping.sampler = this.renderHelper.getCache().createSampler(sampler);

        this.textureMappings.push(mapping);

        // wireframe 需要额外生成 geometry 重心坐标
        if (material.defines.USE_WIREFRAME) {
          this.geometryDirty = true;
          this.inputStateDirty = true;
        }
      });

      material.dirty = false;
      this.materialDirty = false;
    }
  }

  protected buildGeometry() {
    const instance = this.instance as Mesh;
    const geometry = instance.style.geometry as BufferGeometry;
    const material = instance.style.material as Material;

    // build batched geometry
    geometry.build(this.objects);

    // generate wireframe
    if (material.wireframe) {
      this.generateWireframe(geometry);
    }

    // sync to internal Geometry
    this.geometry.setIndices(geometry.indices);
    this.geometry.vertexCount = geometry.vertexCount;
    this.geometry.maxInstancedCount = geometry.instancedCount;

    this.geometry.inputLayoutDescriptor = geometry.inputLayoutDescriptor;
    geometry.vertexBuffers.forEach((data, i) => {
      const buffer = makeStaticDataBuffer(this.device, BufferUsage.Vertex, data.buffer);
      this.geometry.vertexBuffers[i] = buffer;
    });
  }

  updateAttribute(object: DisplayObject, name: string, value: any): void {
    super.updateAttribute(object, name, value);
    const index = this.objects.indexOf(object);

    const instance = this.instance as Mesh;
    const geometry = instance.style.geometry as BufferGeometry;
    const patches = geometry.update(index, object, name, value);
    patches.forEach(({ bufferIndex, location, data }) => {
      this.geometry.updateVertexBuffer(bufferIndex, location, index, new Uint8Array(data.buffer));
    });
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

  protected uploadUBO(renderInst: RenderInst): void {
    const instance = this.instance as Mesh;
    const material = instance.style.material as Material;
    let numUniformBuffers = 1; // Scene UBO
    let wordCount = 0;

    const lights = this.lightPool.getAllLights();
    const fog = this.lightPool.getFog();

    // toggle fog, need re-compile material
    if (!!fog !== material.defines.USE_FOG) {
      material.dirty = true;
    }

    // add fog
    if (fog) {
      material.defines.USE_FOG = true;
      wordCount += 8;
    } else {
      material.defines.USE_FOG = false;
    }

    // materials
    wordCount += 4; // placeholder
    wordCount += material.uboBuffer.length;
    if (material.defines.USE_LIGHT) {
      wordCount += lights.reduce((prev, cur) => prev + cur.getUniformWordCount(), 0);
    }

    let offs = renderInst.allocateUniformBuffer(numUniformBuffers, wordCount);
    const d = renderInst.mapUniformBufferF32(numUniformBuffers);
    offs += fillVec4(d, offs, 0, 0, 0, 0); // u_Placeholder

    if (fog) {
      offs = this.uploadFog(d, offs, fog);
    }
    offs = this.uploadMaterial(d, offs, material);

    if (material.defines.USE_LIGHT) {
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
          channelWriteMask: ChannelWriteMask.AllChannels,
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
      cullMode,
      frontFace,
      polygonOffset,
    });

    renderInst.setBindingLayouts([{ numUniformBuffers, numSamplers: this.textureMappings.length }]);
    renderInst.setSamplerBindingsFromTextureMappings(this.textureMappings);
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
}
