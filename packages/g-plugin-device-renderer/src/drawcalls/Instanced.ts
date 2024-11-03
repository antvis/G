import type { DisplayObject, Tuple4Number } from '@antv/g-lite';
import { CSSRGB, isPattern, isCSSRGB, parseColor, Shape } from '@antv/g-lite';
import { mat4, vec3 } from 'gl-matrix';
import {
  ChannelWriteMask,
  CompareFunction,
  Format,
  makeTextureDescriptor2D,
  MipmapFilterMode,
  StencilOp,
  FilterMode,
  VertexStepMode,
  AddressMode,
} from '@antv/g-device-api';
import { BufferGeometry, GeometryEvent } from '../geometries';
import type { LightPool } from '../LightPool';
import type { Fog } from '../lights';
import type { Material } from '../materials';
import { MaterialEvent, ShaderMaterial } from '../materials';
import type { RenderInst, RenderInstUniform, RenderHelper } from '../render';
import {
  DeviceProgram,
  makeSortKeyOpaque,
  RendererLayer,
  TextureMapping,
} from '../render';
import type { BatchContext } from '../renderer';
import type { Batch } from '../renderer/Batch';
import { RENDER_ORDER_SCALE } from '../renderer/Batch';
import type { TexturePool } from '../TexturePool';
import { compareDefines, definedProps, enumToObject } from '../utils/enum';
import { packUint8ToFloat } from '../utils/compression';
import { ParsedMeshStyleProps } from '../Mesh';

let counter = 1;
export const FILL_TEXTURE_MAPPING = 'FillTextureMapping';

/**
 * WebGPU has max vertex attribute num(8)
 */
export enum VertexAttributeBufferIndex {
  MODEL_MATRIX = 0,
  PACKED_COLOR,
  PACKED_STYLE,
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
  PACKED_COLOR, // fill & stroke
  PACKED_STYLE1, // opacity fillOpacity strokeOpacity lineWidth
  PACKED_STYLE2, // visibility anchorX anchorY increasedLineWidthForHitTesting
  PICKING_COLOR,
  POSITION,
  NORMAL,
  UV,
  BARYCENTRIC,
  MAX,
}

/**
 * Draw call.
 */
export abstract class Instanced {
  /**
   * unique ID
   */
  id = counter++;
  renderer: Batch;

  /**
   * assigned by user which help BatchManager deciding whether to merge,
   * e.g. `will-change` property in CSS
   */
  key: string;

  /**
   * attribute name used for gradient or pattern
   */
  gradientAttributeName: 'stroke' | 'fill' = 'fill';

  constructor(
    protected renderHelper: RenderHelper,
    protected texturePool: TexturePool,
    protected lightPool: LightPool,
    object: DisplayObject,
    /**
     * All drawcall constructors.
     */
    protected drawcallCtors: (new (..._: any) => Instanced)[],
    /**
     * index in renderer.meshes
     */
    public index = -1,
    public context: BatchContext,
  ) {}

  /**
   * instances
   */
  objects: DisplayObject[] = [];

  material: Material;
  geometry: BufferGeometry;

  clipPath: DisplayObject;
  clipPathTarget: DisplayObject;

  private program: DeviceProgram = new DeviceProgram();
  geometryDirty = true;
  /**
   * the same material maybe shared between different canvases
   */
  materialDirty = true;
  /**
   * texture mappings
   */
  protected textureMappings: TextureMapping[] = [];

  /**
   * Divisor of instanced array.
   */
  protected divisor = 1;

  /**
   * Account for anchor and merge it into modelMatrix.
   */
  protected mergeXYZIntoModelMatrix = false;

  protected checkNodeName = true;

  /**
   * Create a new batch if the number of instances exceeds.
   */
  maxInstances = Infinity;

  protected abstract createMaterial(objects: DisplayObject[]): void;

  get instance() {
    return this.objects[0];
  }

  inited = false;
  init() {
    if (this.inited) {
      return;
    }

    this.renderer.beforeInitMesh(this);
    this.material = new ShaderMaterial(this.context.device);
    this.material.defines = {
      ...enumToObject(VertexAttributeLocation),
      ...this.material.defines,
    };
    this.geometry = new BufferGeometry(this.context.device);

    // make refs so that we can trigger MutationEvent on every object
    this.geometry.meshes = this.objects;
    this.material.meshes = this.objects;

    this.observeGeometryChanged();
    this.observeMaterialChanged();

    this.inited = true;
    this.renderer.afterInitMesh(this);
  }

  observeGeometryChanged() {
    this.geometry.on(GeometryEvent.CHANGED, () => {
      this.geometry.meshes.forEach((mesh) => {
        mesh.renderable.dirty = true;
      });
      this.context.renderingService.dirtify();
    });
  }

  observeMaterialChanged() {
    this.material.on(MaterialEvent.CHANGED, () => {
      this.material.meshes.forEach((mesh) => {
        mesh.renderable.dirty = true;
      });
      this.context.renderingService.dirtify();
    });
  }

  private shouldMergeColor(o1: DisplayObject, o2: DisplayObject, name: string) {
    // c1: CSSRGB | CSSGradientValue[] | Pattern, c2: CSSRGB | CSSGradientValue[] | Pattern
    // can't be merged if gradients & pattern used
    const source = o1.parsedStyle[name];
    const target = o2.parsedStyle[name];

    if (!source && !target) {
      return true;
    }

    // constant color value
    if (isCSSRGB(source) && isCSSRGB(target)) {
      return true;
    }

    // pattern
    if (
      isPattern(source) &&
      isPattern(target) &&
      source.image === target.image
    ) {
      return true;
    }

    // gradients
    if (
      Array.isArray(source) &&
      Array.isArray(target) &&
      o1.style[name] === o2.style[name]
    ) {
      return true;
    }

    return false;
  }

  /**
   * should be merged into current InstancedMesh
   */
  shouldMerge(object: DisplayObject, index: number): boolean {
    if (!this.instance) {
      return true;
    }

    // Path / Polyline could be rendered as Line
    if (this.checkNodeName && this.instance.nodeName !== object.nodeName) {
      return false;
    }

    // can't be merged when using clipPath
    if (object.parsedStyle.clipPath) {
      return false;
    }

    if (
      !this.shouldMergeColor(this.instance, object, 'fill') ||
      !this.shouldMergeColor(this.instance, object, 'stroke')
    ) {
      return false;
    }

    return true;
  }

  protected createGeometry(objects: DisplayObject[]) {
    const modelMatrix = mat4.create();
    const modelViewMatrix = mat4.create();
    // const normalMatrix = mat3.create();
    const packedModelMatrix: number[] = [];
    const packedFillStroke: number[] = [];
    const packedStyle: number[] = [];
    const packedPicking: number[] = [];
    const { divisor } = this;
    const anchorOffset =
      objects[0]?.nodeName === Shape.CIRCLE ||
      objects[0]?.nodeName === Shape.ELLIPSE
        ? 0.5
        : 0;

    // const useNormal = this.material.defines.NORMAL;

    objects.forEach((object) => {
      const {
        fill,
        stroke,
        opacity = 1,
        fillOpacity = 1,
        strokeOpacity = 1,
        lineWidth = 1,
        visibility,
        increasedLineWidthForHitTesting = 0,
      } = object.parsedStyle;
      let fillColor: Tuple4Number = [0, 0, 0, 0];
      if (isCSSRGB(fill)) {
        fillColor = [
          Number(fill.r),
          Number(fill.g),
          Number(fill.b),
          Number(fill.alpha) * 255,
        ];
      }
      let strokeColor: Tuple4Number = [0, 0, 0, 0];
      if (isCSSRGB(stroke)) {
        strokeColor = [
          Number(stroke.r),
          Number(stroke.g),
          Number(stroke.b),
          Number(stroke.alpha) * 255,
        ];
      }

      // if (this.clipPathTarget) {
      //   // account for target's rts
      //   mat4.copy(modelMatrix, object.getLocalTransform());
      //   fillColor = [255, 255, 255, 255];
      //   mat4.mul(
      //     modelMatrix,
      //     this.clipPathTarget.getWorldTransform(),
      //     modelMatrix,
      //   );
      // } else {
      //   mat4.copy(modelMatrix, object.getWorldTransform());
      // }
      mat4.mul(
        modelViewMatrix,
        this.context.camera.getViewTransform(),
        modelMatrix,
      );

      const encodedPickingColor = (object.isInteractive() &&
        // @ts-ignore
        object.renderable3D?.encodedPickingColor) || [0, 0, 0];

      if (this.mergeXYZIntoModelMatrix) {
        const { x, y, z } = object.parsedStyle as ParsedMeshStyleProps;
        mat4.mul(
          modelMatrix,
          object.getWorldTransform(), // apply anchor
          mat4.fromTranslation(modelMatrix, vec3.fromValues(x, y, z)),
        );
      } else {
        mat4.copy(modelMatrix, object.getWorldTransform());
      }
      packedModelMatrix.push(...modelMatrix);
      packedFillStroke.push(
        packUint8ToFloat(fillColor[0], fillColor[1]),
        packUint8ToFloat(fillColor[2], fillColor[3]),
        packUint8ToFloat(strokeColor[0], strokeColor[1]),
        packUint8ToFloat(strokeColor[2], strokeColor[3]),
      );
      packedStyle.push(
        opacity,
        fillOpacity,
        strokeOpacity,
        lineWidth,
        visibility !== 'hidden' ? 1 : 0,
        anchorOffset,
        anchorOffset,
        increasedLineWidthForHitTesting,
      );
      packedPicking.push(
        ...encodedPickingColor,
        object.sortable.renderOrder * RENDER_ORDER_SCALE,
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
      //     stepMode: VertexStepMode.INSTANCE,
      //     attributes: [
      //       {
      //         format: Format.F32_RGB,
      //         bufferByteOffset: 4 * 0,
      //         location: Number(NORMAL_MATRIX0),
      //         divisor
      //       },
      //       {
      //         format: Format.F32_RGB,
      //         bufferByteOffset: 4 * 3,
      //         location: Number(NORMAL_MATRIX1),
      //         divisor
      //       },
      //       {
      //         format: Format.F32_RGB,
      //         bufferByteOffset: 4 * 6,
      //         location: Number(NORMAL_MATRIX2),
      //         divisor
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
      stepMode: VertexStepMode.INSTANCE,
      attributes: [
        {
          format: Format.F32_RGBA,
          bufferByteOffset: 4 * 0,
          location: VertexAttributeLocation.MODEL_MATRIX0,
          divisor,
        },
        {
          format: Format.F32_RGBA,
          bufferByteOffset: 4 * 4,
          location: VertexAttributeLocation.MODEL_MATRIX1,
          divisor,
        },
        {
          format: Format.F32_RGBA,
          bufferByteOffset: 4 * 8,
          location: VertexAttributeLocation.MODEL_MATRIX2,
          divisor,
        },
        {
          format: Format.F32_RGBA,
          bufferByteOffset: 4 * 12,
          location: VertexAttributeLocation.MODEL_MATRIX3,
          divisor,
        },
      ],
      data: new Float32Array(packedModelMatrix),
    });

    this.geometry.setVertexBuffer({
      bufferIndex: VertexAttributeBufferIndex.PACKED_COLOR,
      byteStride: 4 * 4,
      stepMode: VertexStepMode.INSTANCE,
      attributes: [
        {
          format: Format.F32_RGBA,
          bufferByteOffset: 4 * 0,
          location: VertexAttributeLocation.PACKED_COLOR,
          divisor,
        },
      ],
      data: new Float32Array(packedFillStroke),
    });

    this.geometry.setVertexBuffer({
      bufferIndex: VertexAttributeBufferIndex.PACKED_STYLE,
      byteStride: 4 * 8,
      stepMode: VertexStepMode.INSTANCE,
      attributes: [
        {
          format: Format.F32_RGBA,
          bufferByteOffset: 4 * 0,
          location: VertexAttributeLocation.PACKED_STYLE1,
          divisor,
        },
        {
          format: Format.F32_RGBA,
          bufferByteOffset: 4 * 4,
          location: VertexAttributeLocation.PACKED_STYLE2,
          divisor,
        },
      ],
      data: new Float32Array(packedStyle),
    });

    this.geometry.setVertexBuffer({
      bufferIndex: VertexAttributeBufferIndex.PICKING_COLOR,
      byteStride: 4 * 4,
      stepMode: VertexStepMode.INSTANCE,
      attributes: [
        {
          format: Format.F32_RGBA,
          bufferByteOffset: 4 * 0,
          location: VertexAttributeLocation.PICKING_COLOR,
          divisor,
        },
      ],
      data: new Float32Array(packedPicking),
    });
  }

  destroy() {
    if (this.geometry) {
      this.geometry.destroy();
    }
    // if (this.textureMappings) {
    //   this.textureMappings.forEach((mapping) => {
    //     mapping.texture.destroy();
    //   });
    //   this.textureMappings = [];
    // }
  }

  applyRenderInst(renderInst: RenderInst, objects: DisplayObject[]) {
    // detect if scene changed, eg. lights & fog
    const fog = this.lightPool.getFog();
    const useFog = !!fog;

    if (this.clipPathTarget || this.clipPath) {
      if (this.clipPathTarget) {
        this.material.stencilWrite = true;
        // @see https://open.gl/depthstencils
        this.material.depthWrite = false;
        this.material.stencilFront = {
          compare: CompareFunction.ALWAYS,
          passOp: StencilOp.REPLACE,
        };
        this.material.stencilBack = {
          compare: CompareFunction.ALWAYS,
          passOp: StencilOp.REPLACE,
        };
      } else {
        this.material.stencilWrite = false;
        this.material.depthWrite = true;
        this.material.stencilFront = {
          compare: CompareFunction.EQUAL,
          passOp: StencilOp.KEEP,
        };
        this.material.stencilBack = {
          compare: CompareFunction.EQUAL,
          passOp: StencilOp.KEEP,
        };
      }
    } else {
      this.material.stencilWrite = false;
    }

    if (this.materialDirty || this.material.programDirty) {
      this.createMaterial(objects);
    }

    const oldDefines = { ...this.material.defines };

    this.material.defines.USE_FOG = useFog;
    this.material.defines = {
      ...this.lightPool.getDefines(),
      ...this.material.defines,
      ...this.renderHelper.getDefines(),
    };

    // re-upload textures
    if (this.material.textureDirty) {
      this.textureMappings = [];

      // set texture mappings
      const fillTextureMapping = this.createFillGradientTextureMapping(objects);
      if (fillTextureMapping) {
        this.textureMappings.push(fillTextureMapping);
      }

      Object.keys(this.material.textures)
        .sort(
          (a, b) =>
            this.material.samplers.indexOf(a) -
            this.material.samplers.indexOf(b),
        )
        .forEach((key) => {
          const mapping = new TextureMapping();
          mapping.name = key;
          mapping.texture = this.material.textures[key];
          this.context.device.setResourceName(
            mapping.texture,
            `Material Texture ${key}`,
          );
          mapping.sampler = this.renderHelper.getCache().createSampler({
            addressModeU: AddressMode.CLAMP_TO_EDGE,
            addressModeV: AddressMode.CLAMP_TO_EDGE,
            minFilter: FilterMode.POINT,
            magFilter: FilterMode.BILINEAR,
            mipmapFilter: MipmapFilterMode.LINEAR,
            lodMinClamp: 0,
            lodMaxClamp: 0,
          });

          this.textureMappings.push(mapping);
        });

      if (this.textureMappings.length) {
        this.material.defines.USE_UV = true;
        this.material.defines.USE_MAP = true;
      } else {
        this.material.defines.USE_UV = false;
        this.material.defines.USE_MAP = false;
      }

      this.material.textureDirty = false;
    }

    const needRecompileProgram = !compareDefines(
      oldDefines,
      this.material.defines,
    );

    // re-compile program, eg. DEFINE changed
    if (
      needRecompileProgram ||
      this.material.programDirty ||
      this.materialDirty
    ) {
      // set defines
      this.material.defines = {
        ...this.material.defines,
        ...enumToObject(VertexAttributeLocation),
      };

      Object.keys(this.material.defines).forEach((key) => {
        const value = this.material.defines[key];
        if (typeof value === 'boolean') {
          this.program.setDefineBool(key, value);
        } else {
          this.program.setDefineString(key, `${value}`);
        }
      });

      // build shaders
      this.program.vert = this.material.vertexShader;
      this.program.frag = this.material.fragmentShader;
      this.material.programDirty = false;
      this.materialDirty = false;
    }

    if (this.material.geometryDirty) {
      // wireframe 需要额外生成 geometry 重心坐标
      this.geometryDirty = true;
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
    }

    // cached input layout
    const program = this.renderHelper
      .getCache()
      .createProgramSimple(this.program);
    const inputLayout = this.renderHelper.getCache().createInputLayout({
      ...this.geometry.inputLayoutDescriptor,
      program,
    });

    const useIndexes = !!this.geometry.indexBuffer;
    renderInst.renderPipelineDescriptor.topology = this.geometry.drawMode;
    renderInst.setProgram(program);
    renderInst.setVertexInput(
      inputLayout,
      this.geometry.vertexBuffers
        .filter((b) => !!b)
        .map((buffer) => ({
          buffer,
          byteOffset: 0,
        })),
      useIndexes ? { buffer: this.geometry.indexBuffer, offset: 0 } : null,
    );

    this.renderer.beforeUploadUBO(renderInst, this);
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
      renderInst.drawPrimitives(
        this.geometry.vertexCount,
        this.geometry.primitiveStart,
      );
    }
    // FIXME: 暂时都当作非透明物体，按照创建顺序排序
    renderInst.sortKey = makeSortKeyOpaque(
      RendererLayer.OPAQUE,
      objects[0].sortable.renderOrder,
    );
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
    if (objects.length === 0) {
      return;
    }

    const stylePacked = [
      'opacity',
      'fillOpacity',
      'strokeOpacity',
      'lineWidth',
      'visibility',
      'anchor',
      'increasedLineWidthForHitTesting',
    ];

    if (name === 'fill' || name === 'stroke') {
      const packedFillStroke: number[] = [];

      objects.forEach((object) => {
        const { fill, stroke } = object.parsedStyle;

        let fillColor: Tuple4Number = [0, 0, 0, 0];
        if (isCSSRGB(fill)) {
          fillColor = [
            Number(fill.r),
            Number(fill.g),
            Number(fill.b),
            Number(fill.alpha) * 255,
          ];
        }
        let strokeColor: Tuple4Number = [0, 0, 0, 0];
        if (isCSSRGB(stroke)) {
          strokeColor = [
            Number(stroke.r),
            Number(stroke.g),
            Number(stroke.b),
            Number(stroke.alpha) * 255,
          ];
        }

        packedFillStroke.push(
          packUint8ToFloat(fillColor[0], fillColor[1]),
          packUint8ToFloat(fillColor[2], fillColor[3]),
          packUint8ToFloat(strokeColor[0], strokeColor[1]),
          packUint8ToFloat(strokeColor[2], strokeColor[3]),
        );
      });

      this.geometry.updateVertexBuffer(
        VertexAttributeBufferIndex.PACKED_COLOR,
        VertexAttributeLocation.PACKED_COLOR,
        startIndex,
        new Uint8Array(new Float32Array(packedFillStroke).buffer),
      );

      const { fill } = this.instance.parsedStyle;
      const i = this.textureMappings.findIndex(
        (m) => m.name === FILL_TEXTURE_MAPPING,
      );
      if (isCSSRGB(fill)) {
        if (i >= 0) {
          // remove original fill texture mapping
          this.textureMappings.splice(i, -1);
          this.material.textureDirty = true;
        }
      } else {
        const fillTextureMapping = this.createFillGradientTextureMapping([
          this.instance,
        ]);
        if (i >= 0) {
          this.textureMappings.splice(i, 1, fillTextureMapping);
        }
        this.material.textureDirty = true;
      }
    } else if (stylePacked.indexOf(name) > -1) {
      const packed: number[] = [];
      const anchorOffset =
        objects[0]?.nodeName === Shape.CIRCLE ||
        objects[0]?.nodeName === Shape.ELLIPSE
          ? 0.5
          : 0;
      objects.forEach((object) => {
        const {
          opacity = 1,
          fillOpacity = 1,
          strokeOpacity = 1,
          lineWidth = 1,
          visibility,
          increasedLineWidthForHitTesting = 0,
        } = object.parsedStyle;
        packed.push(
          opacity,
          fillOpacity,
          strokeOpacity,
          lineWidth,
          visibility !== 'hidden' ? 1 : 0,
          anchorOffset,
          anchorOffset,
          increasedLineWidthForHitTesting,
        );
      });

      this.geometry.updateVertexBuffer(
        VertexAttributeBufferIndex.PACKED_STYLE,
        VertexAttributeLocation.PACKED_STYLE1,
        startIndex,
        new Uint8Array(new Float32Array(packed).buffer),
      );
    } else if (
      name === 'modelMatrix' ||
      (this.mergeXYZIntoModelMatrix &&
        (name === 'x' || name === 'y' || name === 'z'))
    ) {
      const packed: number[] = [];
      const modelMatrix = mat4.create();
      objects.forEach((object) => {
        if (this.mergeXYZIntoModelMatrix) {
          const { x, y, z } = object.parsedStyle as ParsedMeshStyleProps;
          mat4.mul(
            modelMatrix,
            object.getWorldTransform(), // apply anchor
            mat4.fromTranslation(modelMatrix, vec3.fromValues(x, y, z)),
          );
        } else {
          mat4.copy(modelMatrix, object.getWorldTransform());
        }
        packed.push(...modelMatrix);
      });

      this.geometry.updateVertexBuffer(
        VertexAttributeBufferIndex.MODEL_MATRIX,
        VertexAttributeLocation.MODEL_MATRIX0,
        startIndex,
        new Uint8Array(new Float32Array(packed).buffer),
      );
    } else if (name === 'pointerEvents') {
      const packed: number[] = [];
      objects.forEach((object) => {
        const encodedPickingColor = (value &&
          object.isInteractive() &&
          // @ts-ignore
          object.renderable3D?.encodedPickingColor) || [0, 0, 0];
        packed.push(
          ...encodedPickingColor,
          object.sortable.renderOrder * RENDER_ORDER_SCALE,
        );
      });
      this.geometry.updateVertexBuffer(
        VertexAttributeBufferIndex.PICKING_COLOR,
        VertexAttributeLocation.PICKING_COLOR,
        startIndex,
        new Uint8Array(new Float32Array(packed).buffer),
      );
    }
  }

  updateAttribute(
    objects: DisplayObject[],
    startIndex: number,
    name: string,
    value: any,
  ): void {
    if (name === 'clipPath') {
      if (this.clipPath) {
        this.geometryDirty = true;
      }
    }

    // fix https://github.com/antvis/G/issues/1768
    if (this.geometryDirty === true && this.objects.length !== 0) {
      if (this.geometry) {
        this.geometry.destroy();
      }
      this.createGeometry(this.objects);

      this.geometryDirty = false;
    }
  }

  changeRenderOrder(object: DisplayObject, renderOrder: number) {
    const index = this.objects.indexOf(object);

    const encodedPickingColor = (object.isInteractive() &&
      // @ts-ignore
      object.renderable3D?.encodedPickingColor) || [0, 0, 0];
    this.geometry.updateVertexBuffer(
      VertexAttributeBufferIndex.PICKING_COLOR,
      VertexAttributeLocation.PICKING_COLOR,
      index,
      new Uint8Array(
        new Float32Array([
          ...encodedPickingColor,
          renderOrder * RENDER_ORDER_SCALE,
        ]).buffer,
      ),
    );
  }

  private generateWireframe(geometry: BufferGeometry) {
    // need generate barycentric coordinates
    const { indices } = geometry;
    const indiceNum = geometry.indices.length;
    const originalVertexBuffers = geometry.vertices.map((buffer) => {
      // @ts-ignore
      return buffer.slice();
    }) as ArrayBufferView[];
    for (
      let i = VertexAttributeBufferIndex.PICKING_COLOR;
      i < geometry.vertexBuffers.length;
      i++
    ) {
      const { arrayStride } =
        geometry.inputLayoutDescriptor.vertexBufferDescriptors[i];
      geometry.vertices[i] = new Float32Array((arrayStride / 4) * indiceNum);
    }
    // reallocate attribute data
    let cursor = 0;
    const uniqueIndices = new Uint32Array(indiceNum);
    for (let i = 0; i < indiceNum; i++) {
      const ii = indices[i];
      for (let j = 1; j < geometry.vertices.length; j++) {
        const { arrayStride } =
          geometry.inputLayoutDescriptor.vertexBufferDescriptors[j];
        const size = arrayStride / 4;
        for (let k = 0; k < size; k++) {
          geometry.vertices[j][cursor * size + k] =
            originalVertexBuffers[j][ii * size + k];
        }
      }
      uniqueIndices[i] = cursor;
      cursor++;
    }
    for (
      let i = VertexAttributeBufferIndex.PICKING_COLOR + 1;
      i < geometry.vertexBuffers.length;
      i++
    ) {
      // if (i === 3) {
      //   continue;
      // }
      const { stepMode, arrayStride } =
        geometry.inputLayoutDescriptor.vertexBufferDescriptors[i];
      const descriptor =
        geometry.inputLayoutDescriptor.vertexBufferDescriptors[i].attributes[0];
      if (descriptor) {
        const {
          shaderLocation: location,
          offset: bufferByteOffset,
          format,
          divisor,
        } = descriptor;
        geometry.setVertexBuffer({
          bufferIndex: i,
          byteStride: arrayStride,
          stepMode,
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
      stepMode: VertexStepMode.VERTEX,
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

  protected beforeUploadUBO(
    renderInst: RenderInst,
    objects: DisplayObject[],
  ): void {}
  private uploadUBO(renderInst: RenderInst): void {
    const numUniformBuffers = 1; // Scene UBO
    const { material } = this;
    const lights = this.lightPool.getAllLights();
    const fog = this.lightPool.getFog();
    const useFog = !!fog;
    const useLight = material.defines.USE_LIGHT ?? !!lights.length;

    const useWireframe = material.defines.USE_WIREFRAME;

    // collect uniforms
    const uniforms = [];
    if (useWireframe) {
      const wireframeColor = parseColor(material.wireframeColor) as CSSRGB;
      uniforms.push({
        name: 'u_WireframeLineColor',
        value: [
          Number(wireframeColor.r) / 255,
          Number(wireframeColor.g) / 255,
          Number(wireframeColor.b) / 255,
        ],
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
        this.material.uniformNames.indexOf(a.name) -
        this.material.uniformNames.indexOf(b.name),
    );

    // TODO: should not upload all uniforms if no change
    renderInst.setUniforms(numUniformBuffers, uniforms);

    const {
      depthCompare,
      depthWrite,
      stencilFront,
      stencilBack,
      stencilWrite,
      stencilRef,
      cullMode,
      frontFace,
      polygonOffset,
      blendConstant,
      blendEquation,
      blendEquationAlpha,
      blendSrc,
      blendDst,
      blendSrcAlpha,
      blendDstAlpha,
    } = material;

    const materialMegaState = definedProps({
      blendConstant,
      depthCompare,
      depthWrite,
      stencilFront,
      stencilBack,
      stencilWrite,
      stencilRef,
      cullMode,
      frontFace,
      polygonOffset,
    });

    const currentAttachmentsState =
      renderInst.getMegaStateFlags().attachmentsState[0];

    renderInst.setMegaStateFlags({
      attachmentsState: [
        {
          // should not affect color buffer when drawing stencil
          channelWriteMask: this.material.stencilWrite
            ? ChannelWriteMask.NONE
            : ChannelWriteMask.ALL,
          // channelWriteMask: ChannelWriteMask.AllChannels,
          rgbBlendState: {
            ...currentAttachmentsState.rgbBlendState,
            ...definedProps({
              blendMode: blendEquation,
              blendSrcFactor: blendSrc,
              blendDstFactor: blendDst,
            }),
          },
          alphaBlendState: {
            ...currentAttachmentsState.alphaBlendState,
            ...definedProps({
              blendMode: blendEquationAlpha,
              blendSrcFactor: blendSrcAlpha,
              blendDstFactor: blendDstAlpha,
            }),
          },
        },
      ],
      ...materialMegaState,
    });

    renderInst.setBindingLayout({
      numUniformBuffers,
      numSamplers: this.textureMappings.length,
    });

    renderInst.setSamplerBindingsFromTextureMappings(this.textureMappings);
  }

  private uploadFog(uniforms: RenderInstUniform[], fog: Fog) {
    const { type, fill, start, end, density } = fog.parsedStyle;

    if (isCSSRGB(fill)) {
      const fillColor = [
        Number(fill.r) / 255,
        Number(fill.g) / 255,
        Number(fill.b) / 255,
        Number(fill.alpha),
      ];
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

  protected createFillGradientTextureMapping(
    objects: DisplayObject[],
  ): TextureMapping | null {
    const instance = objects[0];

    // should account for Line, Path, Polyline and Polyline
    const fill = instance.parsedStyle[this.gradientAttributeName];

    let texImageSource: string | TexImageSource;

    // use pattern & gradient
    if (fill && (isPattern(fill) || Array.isArray(fill))) {
      if (Array.isArray(fill)) {
        this.program.setDefineBool('USE_PATTERN', false);
        this.texturePool.getOrCreateGradient({
          gradients: fill,
          width: 128,
          height: 128,
          instance,
        });
      } else if (isPattern(fill)) {
        this.program.setDefineBool('USE_PATTERN', true);
        this.texturePool.getOrCreatePattern(fill, instance, () => {
          // need re-render
          objects.forEach((object) => {
            object.renderable.dirty = true;
          });
          this.material.textureDirty = true;
        });
      }

      texImageSource = this.texturePool.getOrCreateCanvas() as TexImageSource;
      const texture = this.texturePool.getOrCreateTexture(
        this.context.device,
        texImageSource,
        makeTextureDescriptor2D(Format.U8_RGBA_NORM, 1, 1, 1),
      );

      if (texture) {
        const fillMapping = new TextureMapping();
        fillMapping.name = FILL_TEXTURE_MAPPING;
        fillMapping.texture = texture;
        fillMapping.texture.on('loaded', () => {
          // need re-render
          objects.forEach((object) => {
            object.renderable.dirty = true;
          });
          this.material.textureDirty = true;
        });
        this.context.device.setResourceName(
          fillMapping.texture,
          `Fill Texture${this.id}`,
        );
        fillMapping.sampler = this.renderHelper.getCache().createSampler({
          addressModeU: AddressMode.CLAMP_TO_EDGE,
          addressModeV: AddressMode.CLAMP_TO_EDGE,
          minFilter: FilterMode.POINT,
          magFilter: FilterMode.BILINEAR,
          mipmapFilter: MipmapFilterMode.LINEAR,
          lodMinClamp: 0,
          lodMaxClamp: 0,
        });

        return fillMapping;
      }
    }

    return null;
  }
}
