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
import { FogType, Material } from '../materials';
import { fillVec4 } from '../render/utils';
import { LightPool } from '../LightPool';

@injectable({
  token: [{ token: ShapeRenderer, named: Mesh.tag }],
})
export class MeshRenderer extends Batch {
  protected program = new DeviceProgram();

  private textureMappings: TextureMapping[] = [];

  @inject(LightPool)
  private lightPool: LightPool;

  materialDirty = true;

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

      const lights = this.lightPool.getAll();
      const useLight = !!lights.length;

      if (useLight) {
        material.defines.USE_LIGHT = true;
        material.defines.NUM_DIR_LIGHTS = lights.length;
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
      this.program.vert = material.props.vertexShader;
      this.program.frag = material.props.fragmentShader;
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
    // geometry.setVertexBuffer({

    // });

    const common = this.geometry.inputLayoutDescriptor.vertexBufferDescriptors[0];

    // generate wireframe
    if (material.props.wireframe) {
      // need generate barycentric coordinates
      const indices = geometry.indices;
      const indiceNum = geometry.indices.length;

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
            geometry.vertexBuffers[j][cursor * size + k] = geometry.vertexBuffers[j][ii * size + k];
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

    // this.geometry.updateVertexBuffer(
    //   Batch.CommonBufferIndex,
    //   AttributeLocation.a_Color,
    //   index,
    //   new Uint8Array(new Float32Array([...fillColor]).buffer),
    // );

    // console.log('updated', index, this.objects, name, value);
  }

  protected uploadUBO(renderInst: RenderInst): void {
    const instance = this.instance as Mesh;
    const material = instance.style.material as Material;
    let numUniformBuffers = 1; // Scene UBO
    let wordCount = 0;

    const lights = this.lightPool.getAll();

    wordCount += material.getUniformWordCount();
    if (material.defines.USE_FOG) {
      wordCount += 8;
    }
    if (material.defines.USE_LIGHT) {
      wordCount += lights.reduce((prev, cur) => prev + cur.getUniformWordCount(), 0);
    }
    if (material.defines.USE_BUMPMAP) {
      wordCount += 4;
    }

    let offs = renderInst.allocateUniformBuffer(numUniformBuffers, wordCount);
    const d = renderInst.mapUniformBufferF32(numUniformBuffers);

    const { emissive, shininess, specular } = material.props;
    // Phong Material
    // vec3 u_Emissive;
    // float u_Shininess;
    // vec3 u_Specular;
    // vec3 u_AmbientLightColor
    const emissiveColor = parseColor(emissive).value as Tuple4Number;
    const specularColor = parseColor(specular).value as Tuple4Number;
    offs += fillVec4(d, offs, emissiveColor[0], emissiveColor[1], emissiveColor[2], shininess);
    offs += fillVec4(d, offs, ...specularColor);
    offs += fillVec4(d, offs, 0, 0, 0, 0);

    if (material.defines.USE_FOG) {
      const {
        fogType = FogType.NONE,
        fogColor = 'black',
        fogStart = 1,
        fogEnd = 1000,
        fogDensity = 0,
      } = material.props;

      const parsedFogColor = parseColor(fogColor).value as Tuple4Number;
      offs += fillVec4(d, offs, fogType, fogStart, fogEnd, fogDensity); // u_FogInfos
      offs += fillVec4(d, offs, ...parsedFogColor); // u_FogColor
    }

    if (material.defines.USE_LIGHT) {
      lights.forEach((light) => {
        // offs += light.uploadUBO(d, offs);
        const { fill, direction, intensity } = light.parsedStyle;

        if (fill?.type === PARSED_COLOR_TYPE.Constant) {
          const fillColor = fill.value as Tuple4Number;
          // @ts-ignore
          offs += fillVec4(d, offs, ...direction, intensity); // direction
          offs += fillVec4(d, offs, ...fillColor); // color
        }
      });
    }

    if (material.defines.USE_BUMPMAP) {
      const { bumpScale } = material.props;
      offs += fillVec4(d, offs, bumpScale); // u_BumpScale
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
    } = material.props;

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
}
