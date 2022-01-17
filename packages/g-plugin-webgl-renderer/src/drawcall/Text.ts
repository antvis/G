import { inject, injectable } from 'mana-syringe';
import { mat4 } from 'gl-matrix';
import { DisplayObject, PARSED_COLOR_TYPE, SHAPE, Text, Tuple4Number } from '@antv/g';
import { Format, VertexBufferFrequency } from '../platform';
import { RenderInst } from '../render/RenderInst';
import { Batch, AttributeLocation, RENDER_ORDER_SCALE } from './Batch';
import { BASE_FONT_WIDTH, GlyphManager } from './symbol/GlyphManager';
import { getGlyphQuads } from './symbol/SymbolQuad';
import GlyphAtlas from './symbol/GlyphAtlas';
import { ShapeMesh, ShapeRenderer } from '../tokens';
import vert from '../shader/text.vert';
import frag from '../shader/text.frag';
import { BatchMesh } from './BatchMesh';
import { Texture2D } from '../Texture2D';

enum TextProgram {
  a_Tex = AttributeLocation.MAX,
  a_Offset,
}

enum Uniform {
  SDF_MAP_SIZE = 'u_SDFMapSize',
  FONT_SIZE = 'u_FontSize',
  GAMMA_SCALE = 'u_GammaScale',
  STROKE_BLUR = 'u_StrokeBlur',
  HAS_STROKE = 'u_HasStroke',
}

const SDF_TEXTURE_MAPPING = 'SDF_TEXTURE_MAPPING';

@injectable({
  token: [{ token: ShapeMesh, named: SHAPE.Text }],
})
export class TextBatchMesh extends BatchMesh {
  glyphManager: GlyphManager;

  protected createGeometry(objects: DisplayObject<any, any>[]): void {
    const object = objects[0] as Text;
    const { textBaseline, fontSize = 0, letterSpacing = 0 } = object.parsedStyle;

    // scale current font size to base(24)
    const fontScale = BASE_FONT_WIDTH / fontSize;

    const indices = [];
    const uvOffsets = [];
    const packed = [];
    let indicesOff = 0;
    objects.forEach((object) => {
      const { metrics } = object.parsedStyle;
      const { font, lines, height, lineHeight } = metrics;

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
          offsetY: fontScale * linePositionY,
          letterSpacing: fontScale * letterSpacing,
          glyphAtlas,
          indicesOffset: indicesOff,
        });
      indicesOff = indicesOffset;

      packed.push(...charPackedBuffer);
      uvOffsets.push(...charUVOffsetBuffer);
      indices.push(...indexBuffer);
    });

    this.bufferGeometry.vertexCount = indices.length;
    this.bufferGeometry.setIndices(new Uint32Array(indices));
    this.bufferGeometry.setVertexBuffer({
      bufferIndex: 0,
      byteStride: 4 * (4 * 4 + 4 + 4 + 4 + 4 + 4),
      // frequency: VertexBufferFrequency.PerInstance,
      frequency: VertexBufferFrequency.PerVertex,
      attributes: [
        {
          format: Format.F32_RGBA,
          bufferByteOffset: 4 * 0,
          location: AttributeLocation.a_ModelMatrix0,
          // byteStride: 4 * 4,
          //          divisor: 1,
        },
        {
          format: Format.F32_RGBA,
          bufferByteOffset: 4 * 4,
          location: AttributeLocation.a_ModelMatrix1,
          // byteStride: 4 * 4,
          //          divisor: 1,
        },
        {
          format: Format.F32_RGBA,
          bufferByteOffset: 4 * 8,
          location: AttributeLocation.a_ModelMatrix2,
          // byteStride: 4 * 4,
          //          divisor: 1,
        },
        {
          format: Format.F32_RGBA,
          bufferByteOffset: 4 * 12,
          location: AttributeLocation.a_ModelMatrix3,
          // byteStride: 4 * 4,
          //          divisor: 1,
        },
        {
          format: Format.F32_RGBA,
          bufferByteOffset: 4 * 16,
          location: AttributeLocation.a_Color,
          // byteStride: 4 * 4,
          //          divisor: 1,
        },
        {
          format: Format.F32_RGBA,
          bufferByteOffset: 4 * 20,
          location: AttributeLocation.a_StrokeColor,
          // byteStride: 4 * 4,
          //          divisor: 1,
        },
        {
          format: Format.F32_RGBA,
          bufferByteOffset: 4 * 24,
          location: AttributeLocation.a_StylePacked1,
          // byteStride: 4 * 4,
          //          divisor: 1,
        },
        {
          format: Format.F32_RGBA,
          bufferByteOffset: 4 * 28,
          location: AttributeLocation.a_StylePacked2,
          // byteStride: 4 * 4,
          //          divisor: 1,
        },
        {
          format: Format.F32_RGBA,
          bufferByteOffset: 4 * 32,
          location: AttributeLocation.a_PickingColor,
          // byteStride: 4 * 4,
          //          divisor: 1,
        },
      ],
      data: new Float32Array(packed),
    });

    this.bufferGeometry.setVertexBuffer({
      bufferIndex: 1,
      byteStride: 4 * (2 + 2),
      frequency: VertexBufferFrequency.PerVertex,
      attributes: [
        {
          format: Format.F32_RG,
          bufferByteOffset: 4 * 0,
          location: TextProgram.a_Tex,
        },
        {
          format: Format.F32_RG,
          bufferByteOffset: 4 * 2,
          location: TextProgram.a_Offset,
        },
      ],
      data: new Float32Array(uvOffsets),
    });
  }

  protected createMaterial(objects: DisplayObject<any, any>[]): void {
    this.material.vertexShader = vert;
    this.material.fragmentShader = frag;

    const object = objects[0] as Text;
    const {
      fontSize = 0,
      fontFamily = '',
      fontWeight = 'normal',
      fontStyle,
      metrics,
    } = object.parsedStyle;
    const { font } = metrics;
    const allText = objects.map((object) => object.parsedStyle.text).join('');

    this.glyphManager.generateAtlas(
      font,
      fontFamily,
      fontWeight,
      fontStyle,
      allText,
      this.geometry.device,
    );
    const glyphAtlasTexture = this.glyphManager.getAtlasTexture();
    const glyphAtlas = this.glyphManager.getAtlas();

    this.geometry.device.setResourceName(glyphAtlasTexture, 'TextSDF Texture');

    this.material.addTexture(
      new Texture2D({
        loadedTexture: glyphAtlasTexture,
      }),
      SDF_TEXTURE_MAPPING,
    );

    const { width: atlasWidth, height: atlasHeight } = glyphAtlas.image;

    this.material.addUniform({
      name: Uniform.SDF_MAP_SIZE,
      format: Format.U32_RG,
      data: [atlasWidth, atlasHeight],
    });
    this.material.addUniform({
      name: Uniform.FONT_SIZE,
      format: Format.U32_R,
      data: fontSize,
    });
    this.material.addUniform({
      name: Uniform.GAMMA_SCALE,
      format: Format.U32_R,
      data: 1,
    });
    this.material.addUniform({
      name: Uniform.STROKE_BLUR,
      format: Format.U32_R,
      data: 0.2,
    });
    this.material.addUniform({
      name: Uniform.HAS_STROKE,
      format: Format.U32_R,
      data: 1,
    });
  }

  beforeUploadUBO(renderInst: RenderInst, objects: DisplayObject[], index: number) {
    this.material.updateUniformData(Uniform.HAS_STROKE, 1 - index);
  }

  shouldSubmitRenderInst(renderInst: RenderInst, objects: DisplayObject[], index: number) {
    const { stroke, lineWidth } = objects[0].parsedStyle;
    const hasStroke = !!(stroke && lineWidth);

    if (!hasStroke && index === 1) {
      // skip rendering stroke
      return false;
    }
    return true;
  }

  changeRenderOrder(object: DisplayObject, index: number, renderOrder: number) {
    this.material.programDirty = true;
    this.material.geometryDirty = true;
  }

  protected updateMeshAttribute(
    object: DisplayObject<any, any>,
    index: number,
    name: string,
    value: any,
  ): void {
    if (
      name === 'text' ||
      name === 'fontFamily' ||
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
      name === 'visibility'
    ) {
      this.material.programDirty = true;
      this.material.geometryDirty = true;
      // need re-upload SDF texture
      this.material.textureDirty = true;
    } else if (name === 'fontSize') {
      // no need to re-upload SDF texture
      this.material.programDirty = true;
      this.material.geometryDirty = true;
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
    offsetY,
    glyphAtlas,
    indicesOffset,
  }: {
    object: DisplayObject;
    lines: string[];
    fontStack: string;
    lineHeight: number;
    letterSpacing: number;
    offsetY: number;
    glyphAtlas: GlyphAtlas;
    indicesOffset: number;
  }) {
    const { textAlign = 'start' } = object.parsedStyle;

    const { fill, stroke, opacity, fillOpacity, strokeOpacity, lineWidth, visibility } =
      object.parsedStyle;
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
      offsetY,
    );

    // 计算每个独立字符相对于锚点的位置信息
    const glyphQuads = getGlyphQuads(positionedGlyphs, glyphAtlas.positions);

    glyphQuads.forEach((quad) => {
      const packed = [
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

@injectable({
  token: [{ token: ShapeRenderer, named: SHAPE.Text }],
})
export class TextRenderer extends Batch {
  @inject(GlyphManager)
  private glyphManager: GlyphManager;

  protected createBatchMeshList(): void {
    const mesh = this.meshFactory(SHAPE.Text) as TextBatchMesh;
    mesh.glyphManager = this.glyphManager;
    // use 2 meshes to draw stroke & fill
    this.batchMeshList.push(mesh, mesh);
  }

  validate(object: DisplayObject) {
    const instance = this.instance;
    const instancedAttributes = [
      'fontSize',
      'fontFamily',
      'fontWeight',
      'textBaseline',
      'letterSpacing',
    ];
    // fontStack & fontSize should be same
    if (
      instance.parsedStyle.metrics.font !== object.parsedStyle.metrics.font ||
      instancedAttributes.some((name) => instance.parsedStyle[name] !== object.parsedStyle[name])
    ) {
      return false;
    }

    return true;
  }
}
