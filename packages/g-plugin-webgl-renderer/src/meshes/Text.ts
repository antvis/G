import { inject, injectable } from 'mana-syringe';
import { mat4 } from 'gl-matrix';
import {
  DisplayObject,
  ParsedTextStyleProps,
  PARSED_COLOR_TYPE,
  Text as TextShape,
  Tuple4Number,
} from '@antv/g';
import { Format, VertexBufferFrequency, CullMode } from '../platform';
import { RENDER_ORDER_SCALE } from '../renderer/Batch';
import { BASE_FONT_WIDTH, GlyphManager } from './symbol/GlyphManager';
import { getGlyphQuads } from './symbol/SymbolQuad';
import GlyphAtlas from './symbol/GlyphAtlas';
import vert from '../shader/text.vert';
import frag from '../shader/text.frag';
import { VertexAttributeLocation } from '../geometries';
import { Instanced } from './Instanced';
import { enumToObject } from '../utils/enum';

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

@injectable()
export class TextMesh extends Instanced {
  @inject(GlyphManager)
  private glyphManager: GlyphManager;

  shouldMerge(object: DisplayObject, index: number) {
    const shouldMerge = super.shouldMerge(object, index);

    if (!shouldMerge) {
      return false;
    }

    if (this.index !== index) {
      return false;
    }

    const instance = this.instance;
    const instancedAttributes = ['fontFamily', 'fontWeight', 'textBaseline', 'letterSpacing'];

    // fontStack & fontSize should be same
    if (instance.parsedStyle.fontSize.value !== object.parsedStyle.fontSize.value) {
      return false;
    }
    if (
      instance.parsedStyle.metrics.font !== object.parsedStyle.metrics.font ||
      instancedAttributes.some((name) => instance.parsedStyle[name] !== object.parsedStyle[name])
    ) {
      return false;
    }

    return true;
  }

  createGeometry(objects: DisplayObject[]): void {
    const object = this.instance as TextShape;
    const { textBaseline, fontSize, letterSpacing = 0 } = object.parsedStyle;

    // scale current font size to base(24)
    const fontScale = BASE_FONT_WIDTH / fontSize.value;

    const indices = [];
    const uvOffsets = [];
    const packed = [];
    let indicesOff = 0;
    objects.forEach((object) => {
      const { metrics, dx, dy } = object.parsedStyle;
      const { font, lines, height, lineHeight } = metrics;

      // account for dx & dy
      let offsetX = 0;
      let offsetY = 0;
      if (dx && dx.unit === 'px') {
        offsetX += dx.value;
      }
      if (dy && dy.unit === 'px') {
        offsetY += dy.value;
      }

      let linePositionY = 0;
      // handle vertical text baseline
      if (textBaseline === 'middle') {
        linePositionY = -height / 2;
      } else if (textBaseline === 'bottom') {
        linePositionY = -height;
      } else if (textBaseline === 'top' || textBaseline === 'hanging') {
        linePositionY = 0;
      } else if (textBaseline === 'alphabetic') {
        linePositionY = -height + lineHeight * 0.25;
      } else if (textBaseline === 'ideographic') {
        linePositionY = -height;
      }

      const glyphAtlas = this.glyphManager.getAtlas();
      const { indicesOffset, indexBuffer, charUVOffsetBuffer, charPackedBuffer } =
        this.buildTextBuffers({
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

      packed.push(...charPackedBuffer);
      uvOffsets.push(...charUVOffsetBuffer);
      indices.push(...indexBuffer);
    });

    this.geometry.vertexCount = indices.length;
    this.geometry.setIndexBuffer(new Uint32Array(indices));
    this.geometry.setVertexBuffer({
      bufferIndex: 0,
      byteStride: 4 * (4 * 4 + 4 + 4 + 4 + 4 + 4),
      // frequency: VertexBufferFrequency.PerInstance,
      frequency: VertexBufferFrequency.PerVertex,
      attributes: [
        {
          format: Format.F32_RGBA,
          bufferByteOffset: 4 * 0,
          location: VertexAttributeLocation.MODEL_MATRIX0,
          // byteStride: 4 * 4,
          //          divisor: 1,
        },
        {
          format: Format.F32_RGBA,
          bufferByteOffset: 4 * 4,
          location: VertexAttributeLocation.MODEL_MATRIX1,
          // byteStride: 4 * 4,
          //          divisor: 1,
        },
        {
          format: Format.F32_RGBA,
          bufferByteOffset: 4 * 8,
          location: VertexAttributeLocation.MODEL_MATRIX2,
          // byteStride: 4 * 4,
          //          divisor: 1,
        },
        {
          format: Format.F32_RGBA,
          bufferByteOffset: 4 * 12,
          location: VertexAttributeLocation.MODEL_MATRIX3,
          // byteStride: 4 * 4,
          //          divisor: 1,
        },
        {
          format: Format.F32_RGBA,
          bufferByteOffset: 4 * 16,
          location: VertexAttributeLocation.COLOR,
          // byteStride: 4 * 4,
          //          divisor: 1,
        },
        {
          format: Format.F32_RGBA,
          bufferByteOffset: 4 * 20,
          location: VertexAttributeLocation.STROKE_COLOR,
          // byteStride: 4 * 4,
          //          divisor: 1,
        },
        {
          format: Format.F32_RGBA,
          bufferByteOffset: 4 * 24,
          location: VertexAttributeLocation.PACKED_STYLE1,
          // byteStride: 4 * 4,
          //          divisor: 1,
        },
        {
          format: Format.F32_RGBA,
          bufferByteOffset: 4 * 28,
          location: VertexAttributeLocation.PACKED_STYLE2,
          // byteStride: 4 * 4,
          //          divisor: 1,
        },
        {
          format: Format.F32_RGBA,
          bufferByteOffset: 4 * 32,
          location: VertexAttributeLocation.PICKING_COLOR,
          // byteStride: 4 * 4,
          //          divisor: 1,
        },
      ],
      data: new Float32Array(packed),
    });

    this.geometry.setVertexBuffer({
      bufferIndex: 1,
      byteStride: 4 * (2 + 2),
      frequency: VertexBufferFrequency.PerVertex,
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
    this.material.cullMode = CullMode.Back;
    this.material.defines = {
      ...this.material.defines,
      ...enumToObject(TextVertexAttributeLocation),
    };

    const object = this.instance as TextShape;
    const {
      fontSize,
      fontFamily = '',
      fontWeight = 'normal',
      fontStyle,
      metrics,
    } = object.parsedStyle;
    const { font } = metrics;
    const allText = objects.map((object) => object.parsedStyle.text).join('');

    this.glyphManager.generateAtlas(font, fontFamily, fontWeight, fontStyle, allText, this.device);
    const glyphAtlasTexture = this.glyphManager.getAtlasTexture();
    const glyphAtlas = this.glyphManager.getAtlas();

    this.device.setResourceName(glyphAtlasTexture, 'TextSDF Texture');

    const { width: atlasWidth, height: atlasHeight } = glyphAtlas.image;

    this.material.setUniforms({
      [TextUniform.SDF_MAP]: glyphAtlasTexture,
      [TextUniform.SDF_MAP_SIZE]: [atlasWidth, atlasHeight],
      [TextUniform.FONT_SIZE]: fontSize.value,
      [TextUniform.GAMMA_SCALE]: 1,
      [TextUniform.STROKE_BLUR]: 0.2,
      [TextUniform.HAS_STROKE]: this.index,
    });
  }

  changeRenderOrder(object: DisplayObject, renderOrder: number) {
    if (this.material) {
      this.material.programDirty = true;
      this.material.geometryDirty = true;
    }
  }

  updateAttribute(objects: DisplayObject[], startIndex: number, name: string, value: any): void {
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
      name === 'modelMatrix' ||
      name === 'visibility' ||
      name === 'dx' ||
      name === 'dy'
    ) {
      this.material.programDirty = true;
      this.material.geometryDirty = true;
      // need re-upload SDF texture
      this.material.textureDirty = true;
    } else if (
      name === 'fill' ||
      name === 'fillOpacity' ||
      name === 'stroke' ||
      name === 'strokeOpacity' ||
      name === 'opacity' ||
      name === 'lineWidth' ||
      name === 'visibility'
    ) {
      this.material.geometryDirty = true;
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
    const { textAlign = 'start' } = object.parsedStyle;

    const { fill, stroke, opacity, fillOpacity, strokeOpacity, lineWidth, visibility } =
      object.parsedStyle as ParsedTextStyleProps;
    let fillColor: Tuple4Number = [0, 0, 0, 0];
    if (fill?.type === PARSED_COLOR_TYPE.Constant) {
      fillColor = fill.value;
    }
    let strokeColor: Tuple4Number = [0, 0, 0, 0];
    if (stroke?.type === PARSED_COLOR_TYPE.Constant) {
      strokeColor = stroke.value;
    }
    // @ts-ignore
    const encodedPickingColor = object.renderable3D?.encodedPickingColor || [0, 0, 0];

    const modelMatrix = mat4.copy(mat4.create(), object.getWorldTransform());

    const charPackedBuffer: number[] = [];
    const charUVOffsetBuffer: number[] = [];
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
      const packed: number[] = [
        ...modelMatrix,
        ...fillColor,
        ...strokeColor,
        opacity,
        fillOpacity,
        strokeOpacity,
        lineWidth.value,
        visibility === 'visible' ? 1 : 0,
        0,
        0,
        0,
        ...encodedPickingColor,
        object.sortable.renderOrder * RENDER_ORDER_SCALE,
      ];
      // FIXME: instanced
      charPackedBuffer.push(...packed, ...packed, ...packed, ...packed);

      // interleaved uv & offsets
      charUVOffsetBuffer.push(quad.tex.x, quad.tex.y, quad.tl.x, quad.tl.y);
      charUVOffsetBuffer.push(quad.tex.x + quad.tex.w, quad.tex.y, quad.tr.x, quad.tr.y);
      charUVOffsetBuffer.push(
        quad.tex.x + quad.tex.w,
        quad.tex.y + quad.tex.h,
        quad.br.x,
        quad.br.y,
      );
      charUVOffsetBuffer.push(quad.tex.x, quad.tex.y + quad.tex.h, quad.bl.x, quad.bl.y);

      indexBuffer.push(0 + i, 2 + i, 1 + i);
      indexBuffer.push(2 + i, 0 + i, 3 + i);
      i += 4;
    });

    return {
      indexBuffer,
      charUVOffsetBuffer,
      charPackedBuffer,
      indicesOffset: i,
    };
  }
}
