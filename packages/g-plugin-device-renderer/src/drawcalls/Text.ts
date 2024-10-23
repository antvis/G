import type {
  DisplayObject,
  ParsedTextStyleProps,
  Text as TextShape,
  Tuple4Number,
} from '@antv/g-lite';
import { isCSSRGB } from '@antv/g-lite';
import { mat4 } from 'gl-matrix';
import { CullMode, Format, VertexStepMode } from '@antv/g-device-api';
import { RENDER_ORDER_SCALE } from '../renderer/Batch';
import frag from '../shader/text.frag';
import vert from '../shader/text.vert';
import { enumToObject } from '../utils/enum';
import {
  Instanced,
  VertexAttributeBufferIndex,
  VertexAttributeLocation,
} from './Instanced';
import type GlyphAtlas from './symbol/GlyphAtlas';
import { BASE_FONT_WIDTH, GlyphManager } from './symbol/GlyphManager';
import { getGlyphQuads } from './symbol/SymbolQuad';
import { packUint8ToFloat } from '../utils/compression';
import { LightPool } from '../LightPool';
import { TexturePool } from '../TexturePool';
import { RenderHelper } from '../render';
import { BatchContext } from '../renderer';

enum TextVertexAttributeBufferIndex {
  INSTANCED = VertexAttributeBufferIndex.POSITION + 1,
  TEX,
}

enum TextVertexAttributeLocation {
  TEX = VertexAttributeLocation.MAX,
  OFFSET,
}

export enum TextUniform {
  SDF_MAP = 'u_SDFMap',
  SDF_MAP_SIZE = 'u_SDFMapSize',
  FONT_SIZE = 'u_FontSize',
  GAMMA_SCALE = 'u_GammaScale',
  STROKE_BLUR = 'u_StrokeBlur',
  HAS_STROKE = 'u_HasStroke',
}

export class TextDrawcall extends Instanced {
  private glyphManager: GlyphManager;

  private packedBufferObjectMap = new WeakMap<
    DisplayObject,
    [number, number]
  >();

  private tmpMat4 = mat4.create();

  private fontHash: string;

  constructor(
    protected renderHelper: RenderHelper,
    protected texturePool: TexturePool,
    protected lightPool: LightPool,
    object: DisplayObject,
    drawcallCtors: (new (..._: any) => Instanced)[],
    index: number,
    context: BatchContext,
  ) {
    super(
      renderHelper,
      texturePool,
      lightPool,
      object,
      drawcallCtors,
      index,
      context,
    );
    this.fontHash = this.calcFontHash(object);
    this.glyphManager = new GlyphManager(this.context);
  }

  private calcFontHash(object: DisplayObject) {
    // Trigger text geometry calculation.
    object.getBounds();

    const instancedAttributes = [
      'fontSize',
      'fontFamily',
      'fontWeight',
      'textBaseline',
      'letterSpacing',
    ];
    return (
      object.parsedStyle.metrics.font +
      instancedAttributes.reduce((prev, cur) => {
        return prev + object.parsedStyle[cur];
      }, '')
    );
  }

  shouldMerge(object: DisplayObject, index: number) {
    const shouldMerge = super.shouldMerge(object, index);

    if (!shouldMerge) {
      return false;
    }

    if (this.index !== index) {
      return false;
    }

    return this.fontHash === this.calcFontHash(object);
  }

  createGeometry(objects: DisplayObject[]): void {
    const object = this.instance as TextShape;
    const { fontSize = 16, letterSpacing = 0 } = object.parsedStyle;
    let { textBaseline = 'alphabetic' } = object.parsedStyle;

    // scale current font size to base(24)
    const fontScale = BASE_FONT_WIDTH / fontSize;

    const indices = [];
    const positions = [];
    const uvOffsets = [];
    const packed = [];
    let indicesOff = 0;
    objects.forEach((object) => {
      const {
        metrics,
        dx = 0,
        dy = 0,
      } = object.parsedStyle as ParsedTextStyleProps;
      const { font, lines, height, lineHeight } = metrics;

      // account for dx & dy
      const offsetX = dx;
      const offsetY = dy;

      if (textBaseline === 'alphabetic') {
        textBaseline = 'bottom';
      }

      let linePositionY = 0;
      // handle vertical text baseline
      if (textBaseline === 'middle') {
        linePositionY += -height / 2;
      } else if (textBaseline === 'bottom') {
        linePositionY += -height;
      } else if (textBaseline === 'top' || textBaseline === 'hanging') {
        linePositionY += 0;
      } else if (textBaseline === 'ideographic') {
        linePositionY += -height;
      }

      const glyphAtlas = this.glyphManager.getAtlas();
      const {
        indicesOffset,
        indexBuffer,
        charUVOffsetBuffer,
        charPositionsBuffer,
        charPackedBuffer,
      } = this.buildTextBuffers({
        object,
        lines,
        fontStack: font,
        lineHeight: fontScale * lineHeight,
        offsetX: fontScale * offsetX,
        offsetY: fontScale * (linePositionY + offsetY),
        letterSpacing: fontScale * letterSpacing,
        glyphAtlas,
        indicesOffset: indicesOff,
      });
      indicesOff = indicesOffset;

      const start = packed.length;
      packed.push(...charPackedBuffer);
      const end = packed.length;
      this.packedBufferObjectMap.set(object, [start, end]);

      uvOffsets.push(...charUVOffsetBuffer);
      positions.push(...charPositionsBuffer);
      indices.push(...indexBuffer);
    });

    this.geometry.vertexCount = indices.length;
    this.geometry.setIndexBuffer(new Uint32Array(indices));
    this.geometry.setVertexBuffer({
      bufferIndex: TextVertexAttributeBufferIndex.INSTANCED,
      byteStride: 4 * (4 * 4 + 4 + 4 + 4 + 4), // 32
      stepMode: VertexStepMode.VERTEX,
      attributes: [
        {
          format: Format.F32_RGBA,
          bufferByteOffset: 4 * 0,
          location: VertexAttributeLocation.MODEL_MATRIX0,
        },
        {
          format: Format.F32_RGBA,
          bufferByteOffset: 4 * 4,
          location: VertexAttributeLocation.MODEL_MATRIX1,
        },
        {
          format: Format.F32_RGBA,
          bufferByteOffset: 4 * 8,
          location: VertexAttributeLocation.MODEL_MATRIX2,
        },
        {
          format: Format.F32_RGBA,
          bufferByteOffset: 4 * 12,
          location: VertexAttributeLocation.MODEL_MATRIX3,
        },
        {
          format: Format.F32_RGBA,
          bufferByteOffset: 4 * 16,
          location: VertexAttributeLocation.PACKED_COLOR,
        },
        {
          format: Format.F32_RGBA,
          bufferByteOffset: 4 * 20,
          location: VertexAttributeLocation.PACKED_STYLE1,
        },
        {
          format: Format.F32_RGBA,
          bufferByteOffset: 4 * 24,
          location: VertexAttributeLocation.PACKED_STYLE2,
        },
        {
          format: Format.F32_RGBA,
          bufferByteOffset: 4 * 28,
          location: VertexAttributeLocation.PICKING_COLOR,
        },
      ],
      data: new Float32Array(packed),
    });

    this.geometry.setVertexBuffer({
      bufferIndex: VertexAttributeBufferIndex.POSITION,
      byteStride: 4 * 3,
      stepMode: VertexStepMode.VERTEX,
      attributes: [
        {
          format: Format.F32_RGB,
          bufferByteOffset: 4 * 0,
          location: VertexAttributeLocation.POSITION,
        },
      ],
      data: new Float32Array(positions),
    });
    this.geometry.setVertexBuffer({
      bufferIndex: TextVertexAttributeBufferIndex.TEX,
      byteStride: 4 * (2 + 2),
      stepMode: VertexStepMode.VERTEX,
      attributes: [
        {
          format: Format.F32_RG,
          bufferByteOffset: 4 * 0,
          location: TextVertexAttributeLocation.TEX,
        },
        {
          format: Format.F32_RG,
          bufferByteOffset: 4 * 2,
          location: TextVertexAttributeLocation.OFFSET,
        },
      ],
      data: new Float32Array(uvOffsets),
    });
  }

  protected createMaterial(objects: DisplayObject[]): void {
    this.material.vertexShader = vert;
    this.material.fragmentShader = frag;
    this.material.cullMode = CullMode.BACK;
    this.material.defines = {
      ...this.material.defines,
      ...enumToObject(TextVertexAttributeLocation),
    };

    const object = this.instance as TextShape;
    const {
      fontSize = 16,
      fontFamily = 'sans-serif',
      fontWeight = 'normal',
      fontStyle = 'normal',
      metrics,
    } = object.parsedStyle;
    const { font } = metrics;
    const allText = objects.map((object) => object.parsedStyle.text).join('');

    this.glyphManager.generateAtlas(
      this.texturePool.context.config.offscreenCanvas,
      font,
      fontFamily,
      fontWeight.toString(),
      fontStyle,
      allText,
      this.context.device,
    );
    const glyphAtlasTexture = this.glyphManager.getAtlasTexture();
    const glyphAtlas = this.glyphManager.getAtlas();

    this.context.device.setResourceName(glyphAtlasTexture, 'TextSDF Texture');

    const { width: atlasWidth, height: atlasHeight } = glyphAtlas.image;

    this.material.setUniforms({
      [TextUniform.SDF_MAP]: glyphAtlasTexture,
      [TextUniform.SDF_MAP_SIZE]: [atlasWidth, atlasHeight],
      [TextUniform.FONT_SIZE]: fontSize,
      [TextUniform.GAMMA_SCALE]: 1,
      [TextUniform.STROKE_BLUR]: 0.2,
      [TextUniform.HAS_STROKE]: this.index,
    });
  }

  changeRenderOrder(object: DisplayObject, renderOrder: number) {
    const vertice = this.geometry.vertices[
      TextVertexAttributeBufferIndex.INSTANCED
    ] as Float32Array;
    const { arrayStride } =
      this.geometry.inputLayoutDescriptor.vertexBufferDescriptors[
        TextVertexAttributeBufferIndex.INSTANCED
      ];
    const bytes = arrayStride / 4;
    const [start, end] = this.packedBufferObjectMap.get(object);
    const sliced = vertice.slice(start, end);
    for (let i = 0; i < end - start; i += bytes) {
      sliced[i + bytes - 1] = renderOrder * RENDER_ORDER_SCALE;
    }
    this.geometry.updateVertexBuffer(
      TextVertexAttributeBufferIndex.INSTANCED,
      VertexAttributeLocation.MODEL_MATRIX0,
      start / bytes,
      new Uint8Array(sliced.buffer),
    );
  }

  updateAttribute(
    objects: DisplayObject[],
    startIndex: number,
    name: string,
    value: any,
  ): void {
    // fix https://github.com/antvis/G/issues/1755
    if (objects.length === 0) {
      return;
    }

    super.updateAttribute(objects, startIndex, name, value);

    if (
      name === 'text' ||
      name === 'fontFamily' ||
      name === 'fontSize' ||
      name === 'fontWeight' ||
      name === 'fontStyle' ||
      name === 'fontVariant' ||
      name === 'textBaseline' ||
      name === 'letterSpacing' ||
      name === 'wordWrapWidth' ||
      name === 'lineHeight' ||
      name === 'wordWrap' ||
      name === 'textAlign' ||
      name === 'x' ||
      name === 'y' ||
      name === 'dx' ||
      name === 'dy'
    ) {
      this.material.programDirty = true;
      this.material.geometryDirty = true;
      // need re-upload SDF texture
      this.material.textureDirty = true;
    } else if (
      name === 'modelMatrix' ||
      name === 'fill' ||
      name === 'fillOpacity' ||
      name === 'stroke' ||
      name === 'strokeOpacity' ||
      name === 'opacity' ||
      name === 'lineWidth' ||
      name === 'visibility' ||
      name === 'pointerEvents' ||
      name === 'isBillboard' ||
      name === 'billboardRotation' ||
      name === 'isSizeAttenuation'
    ) {
      const vertice = this.geometry.vertices[
        TextVertexAttributeBufferIndex.INSTANCED
      ] as Float32Array;
      const { arrayStride } =
        this.geometry.inputLayoutDescriptor.vertexBufferDescriptors[
          TextVertexAttributeBufferIndex.INSTANCED
        ];
      const bytes = arrayStride / 4;

      objects.forEach((object) => {
        const {
          fill,
          stroke,
          opacity = 1,
          fillOpacity = 1,
          strokeOpacity = 1,
          lineWidth = 1,
          visibility,
          isBillboard,
          billboardRotation,
          isSizeAttenuation,
        } = object.parsedStyle as ParsedTextStyleProps;
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

        const encodedPickingColor = (object.isInteractive() &&
          // @ts-ignore
          object.renderable3D?.encodedPickingColor) || [0, 0, 0];

        const modelMatrix = mat4.copy(this.tmpMat4, object.getWorldTransform());

        const [start, end] = this.packedBufferObjectMap.get(object);
        const sliced = vertice.slice(start, end);
        for (let i = 0; i < end - start; i += bytes) {
          // if (name === 'modelMatrix') {
          sliced[i + 0] = modelMatrix[0];
          sliced[i + 1] = modelMatrix[1];
          sliced[i + 2] = modelMatrix[2];
          sliced[i + 3] = modelMatrix[3];
          sliced[i + 4] = modelMatrix[4];
          sliced[i + 5] = modelMatrix[5];
          sliced[i + 6] = modelMatrix[6];
          sliced[i + 7] = modelMatrix[7];
          sliced[i + 8] = modelMatrix[8];
          sliced[i + 9] = modelMatrix[9];
          sliced[i + 10] = modelMatrix[10];
          sliced[i + 11] = modelMatrix[11];
          sliced[i + 12] = modelMatrix[12];
          sliced[i + 13] = modelMatrix[13];
          sliced[i + 14] = modelMatrix[14];
          sliced[i + 15] = modelMatrix[15];
          // } else if (name === 'fill') {
          sliced[i + 16] = packUint8ToFloat(fillColor[0], fillColor[1]);
          sliced[i + 17] = packUint8ToFloat(fillColor[2], fillColor[3]);
          // } else if (name === 'stroke') {
          sliced[i + 18] = packUint8ToFloat(strokeColor[0], strokeColor[1]);
          sliced[i + 19] = packUint8ToFloat(strokeColor[2], strokeColor[3]);
          // }
          sliced[i + 20] = opacity;
          sliced[i + 21] = fillOpacity;
          sliced[i + 22] = strokeOpacity;
          sliced[i + 23] = lineWidth;
          sliced[i + 24] = visibility !== 'hidden' ? 1 : 0;
          sliced[i + 25] = isBillboard ? 1 : 0;
          sliced[i + 26] = isSizeAttenuation ? 1 : 0;
          sliced[i + 27] = billboardRotation ?? 0;
          sliced[i + 28] = encodedPickingColor[0];
          sliced[i + 29] = encodedPickingColor[1];
          sliced[i + 30] = encodedPickingColor[2];
          // sliced[i + 31] = object.sortable.renderOrder * RENDER_ORDER_SCALE;
        }

        this.geometry.updateVertexBuffer(
          TextVertexAttributeBufferIndex.INSTANCED,
          VertexAttributeLocation.MODEL_MATRIX0,
          start / bytes,
          new Uint8Array(sliced.buffer),
        );
      });
    }
  }

  private buildTextBuffers({
    object,
    lines,
    fontStack,
    lineHeight,
    letterSpacing,
    offsetX,
    offsetY,
    glyphAtlas,
    indicesOffset,
  }: {
    object: DisplayObject;
    lines: string[];
    fontStack: string;
    lineHeight: number;
    letterSpacing: number;
    offsetX: number;
    offsetY: number;
    glyphAtlas: GlyphAtlas;
    indicesOffset: number;
  }) {
    const {
      textAlign = 'start',
      fill,
      stroke,
      opacity = 1,
      fillOpacity = 1,
      strokeOpacity = 1,
      lineWidth = 1,
      visibility,
      isBillboard,
      billboardRotation,
      isSizeAttenuation,
      x = 0,
      y = 0,
      z = 0,
    } = object.parsedStyle as ParsedTextStyleProps;
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

    const encodedPickingColor = (object.isInteractive() &&
      // @ts-ignore
      object.renderable3D?.encodedPickingColor) || [0, 0, 0];

    const modelMatrix = mat4.copy(this.tmpMat4, object.getWorldTransform());

    const charPackedBuffer: number[] = [];
    const charUVOffsetBuffer: number[] = [];
    const charPositionsBuffer: number[] = [];
    const indexBuffer: number[] = [];

    let i = indicesOffset;
    const positionedGlyphs = this.glyphManager.layout(
      lines,
      fontStack,
      lineHeight,
      textAlign,
      letterSpacing,
      offsetX,
      offsetY,
    );

    // 计算每个独立字符相对于锚点的位置信息
    const glyphQuads = getGlyphQuads(positionedGlyphs, glyphAtlas.positions);

    glyphQuads.forEach((quad) => {
      // rollup will use `concat`
      const temp = [];
      temp.push(...modelMatrix);
      const packed: number[] = [
        ...temp,
        packUint8ToFloat(fillColor[0], fillColor[1]),
        packUint8ToFloat(fillColor[2], fillColor[3]),
        packUint8ToFloat(strokeColor[0], strokeColor[1]),
        packUint8ToFloat(strokeColor[2], strokeColor[3]),
        opacity,
        fillOpacity,
        strokeOpacity,
        lineWidth,
        visibility !== 'hidden' ? 1 : 0,
        isBillboard ? 1 : 0,
        isSizeAttenuation ? 1 : 0,
        billboardRotation ?? 0,
        ...encodedPickingColor,
        object.sortable.renderOrder * RENDER_ORDER_SCALE,
      ];
      // Can't use instanced here since the total number of each Text can be different.
      charPackedBuffer.push(...packed, ...packed, ...packed, ...packed);

      // interleaved uv & offsets
      charUVOffsetBuffer.push(quad.tex.x, quad.tex.y, quad.tl.x, quad.tl.y);
      charUVOffsetBuffer.push(
        quad.tex.x + quad.tex.w,
        quad.tex.y,
        quad.tr.x,
        quad.tr.y,
      );
      charUVOffsetBuffer.push(
        quad.tex.x + quad.tex.w,
        quad.tex.y + quad.tex.h,
        quad.br.x,
        quad.br.y,
      );
      charUVOffsetBuffer.push(
        quad.tex.x,
        quad.tex.y + quad.tex.h,
        quad.bl.x,
        quad.bl.y,
      );
      charPositionsBuffer.push(x, y, z, x, y, z, x, y, z, x, y, z);

      indexBuffer.push(0 + i, 2 + i, 1 + i);
      indexBuffer.push(2 + i, 0 + i, 3 + i);
      i += 4;
    });

    return {
      indexBuffer,
      charUVOffsetBuffer,
      charPositionsBuffer,
      charPackedBuffer,
      indicesOffset: i,
    };
  }

  destroy() {
    super.destroy();
    this.glyphManager.destroy();
  }
}
