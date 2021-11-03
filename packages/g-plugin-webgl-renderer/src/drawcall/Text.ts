import { inject, injectable } from 'inversify';
import { mat4 } from 'gl-matrix';
import { DisplayObject, PARSED_COLOR_TYPE, Text, Tuple4Number } from '@antv/g';
import { fillVec4, makeSortKeyOpaque, RendererLayer } from '../render/utils';
import { Format, MipFilterMode, TexFilterMode, VertexBufferFrequency, WrapMode } from '../platform';
import { RenderInst } from '../render/RenderInst';
import { DeviceProgram } from '../render/DeviceProgram';
import { Batch } from '.';
import { TextureMapping } from '../render/TextureHolder';
import { BASE_FONT_WIDTH, GlyphManager } from './symbol/GlyphManager';
import { getGlyphQuads } from './symbol/SymbolQuad';
import GlyphAtlas from './symbol/GlyphAtlas';
import { RenderInstList } from '../render/RenderInstList';
import { Renderable3D } from '../components/Renderable3D';

class TextProgram extends DeviceProgram {
  static a_Tex = Object.keys(Batch.AttributeLocation).length;
  static a_Offset = Object.keys(Batch.AttributeLocation).length + 1;

  static ub_ObjectParams = 1;

  both: string = `
  ${Batch.ShaderLibrary.BothDeclaration}
  layout(std140) uniform ub_ObjectParams {
    vec2 u_SDFMapSize;
    float u_FontSize;
    float u_GammaScale;
    float u_StrokeBlur;
    bool u_HasStroke;
  };
  `;

  vert: string = `
  ${Batch.ShaderLibrary.VertDeclaration}
  layout(location = ${TextProgram.a_Tex}) attribute vec2 a_Tex;
  layout(location = ${TextProgram.a_Offset}) attribute vec2 a_Offset;

  out vec2 v_UV;
  out float v_GammaScale;
  
  void main() {
    ${Batch.ShaderLibrary.Vert}

    v_UV = a_Tex / u_SDFMapSize;

    float fontScale = u_FontSize / 24.;

    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_ModelMatrix * vec4(a_Offset * fontScale, -u_ZIndex, 1.0);
    v_GammaScale = gl_Position.w;
  }
  `;

  frag: string = `
  in vec2 v_UV;
  in float v_GammaScale;

  ${Batch.ShaderLibrary.FragDeclaration}

  uniform sampler2D u_SDFMap;

  #define SDF_PX 8.0
  
  void main() {
    ${Batch.ShaderLibrary.Frag}

    float dist = texture(SAMPLER_2D(u_SDFMap), v_UV).a;

    float EDGE_GAMMA = 0.105 / u_DevicePixelRatio;
    float fontScale = u_FontSize / 24.0;
    highp float gamma = EDGE_GAMMA / (fontScale * u_GammaScale);
    lowp vec4 color = u_Color;
    lowp float buff = (256.0 - 64.0) / 256.0;
    float opacity = u_FillOpacity;
    if (u_HasStroke && u_StrokeWidth > 0.0) {
      color = u_StrokeColor;
      gamma = (u_StrokeBlur * 1.19 / SDF_PX + EDGE_GAMMA) / (fontScale * u_GammaScale);
      buff = (6.0 - u_StrokeWidth / fontScale / 2.0) / SDF_PX;
      opacity = u_StrokeOpacity;
    }

    highp float gamma_scaled = gamma * v_GammaScale;
    highp float alpha = smoothstep(buff - gamma_scaled, buff + gamma_scaled, dist);

    gl_FragColor = color * (alpha * opacity * u_Opacity);
  }
  `;
}

@injectable()
export class TextRenderer extends Batch {
  program = new TextProgram();

  instanced = false;

  @inject(GlyphManager)
  private glyphManager: GlyphManager;

  buildGeometry() {
    this.generateAtlas();
  }

  validate(object: DisplayObject) {
    const instance = this.objects[0] as DisplayObject;
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

  updateAttribute(object: DisplayObject, name: string, value: any): void {
    super.updateAttribute(object, name, value);

    if (
      name === 'text' ||
      name === 'fontFamily' ||
      name === 'textBaseline' ||
      name === 'letterSpacing' ||
      name === 'wordWrapWidth' ||
      name === 'lineHeight' ||
      name === 'wordWrap' ||
      name === 'textAlign' ||
      name === 'modelMatrix'
    ) {
      this.recreateGeometry = true;
    } else if (name === 'zIndex') {
      const encodedPickingColor = object.entity.getComponent(Renderable3D).encodedPickingColor;
      // this.geometry.updateVertexBuffer(
      //   Batch.CommonBufferIndex,
      //   Batch.AttributeLocation.a_PickingColor,
      //   index,
      //   new Uint8Array(
      //     new Float32Array([...encodedPickingColor, object.parsedStyle.zIndex]).buffer,
      //   ),
      // );
    }
  }

  uploadUBO(renderInst: RenderInst): void {
    // need 1 sampler
    renderInst.setBindingLayouts([{ numUniformBuffers: 2, numSamplers: 1 }]);

    const object = this.objects[0];

    const text = object as Text;

    const { fontSize } = text.parsedStyle;

    renderInst.setSamplerBindingsFromTextureMappings([this.mapping]);

    const glyphAtlas = this.glyphManager.getAtlas();
    const { width: atlasWidth, height: atlasHeight } = glyphAtlas.image;

    // Upload to our UBO.
    let offs = renderInst.allocateUniformBuffer(TextProgram.ub_ObjectParams, 4 + 4);
    const d = renderInst.mapUniformBufferF32(TextProgram.ub_ObjectParams);
    offs += fillVec4(d, offs, atlasWidth, atlasHeight, fontSize, 1);
    offs += fillVec4(d, offs, 0.2, 1); // u_HasStroke
  }

  /**
   * use another draw call for stroke
   */
  afterRender(list: RenderInstList) {
    const instance = this.objects[0] as Text;
    const { stroke, lineWidth } = instance.parsedStyle;
    const hasStroke = stroke && lineWidth;

    if (hasStroke) {
      // cached input layout
      const inputLayout = this.renderHelper
        .getCache()
        .createInputLayout(this.geometry.inputLayoutDescriptor);

      // cached program
      const program = this.renderHelper
        .getCache()
        .createProgramSimple(this.programDescriptorSimpleWithOrig);

      // new render instance
      const renderInst = this.renderHelper.renderInstManager.newRenderInst();
      renderInst.setProgram(program);
      renderInst.setInputLayoutAndState(inputLayout, this.inputState);

      // upload UBO
      this.uploadUBO(renderInst);
      let offs = renderInst.getUniformBufferOffset(TextProgram.ub_ObjectParams);
      const d = renderInst.mapUniformBufferF32(TextProgram.ub_ObjectParams);
      fillVec4(d, offs + 4, 0.2, 0); // u_HasStroke

      // draw elements
      renderInst.drawIndexesInstanced(this.geometry.vertexCount, this.geometry.maxInstancedCount);
      renderInst.sortKey = makeSortKeyOpaque(RendererLayer.OPAQUE, program.id);
      this.renderHelper.renderInstManager.submitRenderInst(renderInst, list);
    }
  }

  private generateAtlas() {
    const geometry = this.geometry;

    const object = this.objects[0] as Text;
    const {
      textBaseline,
      fontSize = 0,
      fontFamily = '',
      fontWeight = 'normal',
      letterSpacing = 0,
      metrics,
    } = object.parsedStyle;
    const { font } = metrics;

    const allText = this.objects.map((object) => object.parsedStyle.text).join('');

    this.glyphManager.generateAtlas(font, fontFamily, fontWeight, allText, this.device);
    const glyphAtlasTexture = this.glyphManager.getAtlasTexture();
    const glyphAtlas = this.glyphManager.getAtlas();

    const mapping = new TextureMapping();
    mapping.texture = glyphAtlasTexture;
    this.device.setResourceName(mapping.texture, 'TextSDF Texture');
    mapping.sampler = this.renderHelper.getCache().createSampler({
      wrapS: WrapMode.Clamp,
      wrapT: WrapMode.Clamp,
      minFilter: TexFilterMode.Bilinear,
      magFilter: TexFilterMode.Bilinear,
      mipFilter: MipFilterMode.NoMip,
      minLOD: 0,
      maxLOD: 0,
    });
    this.mapping = mapping;

    // scale current font size to base(24)
    const fontScale = BASE_FONT_WIDTH / fontSize;

    const indices = [];
    const uvOffsets = [];
    const packed = [];
    let indicesOff = 0;
    this.objects.forEach((object) => {
      const { metrics } = object.parsedStyle;
      const { font, lines, height, lineHeight } = metrics;

      let linePositionY = 0;
      // handle vertical text baseline
      if (textBaseline === 'middle') {
        linePositionY = -height / 2;
      } else if (
        textBaseline === 'bottom' ||
        textBaseline === 'alphabetic' ||
        textBaseline === 'ideographic'
      ) {
        linePositionY = -height;
      } else if (textBaseline === 'top' || textBaseline === 'hanging') {
        linePositionY = 0;
      }

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

    geometry.vertexCount = indices.length;
    // geometry.vertexCount = 6;
    // geometry.maxInstancedCount = indices.length / 6;
    geometry.setIndices(new Uint32Array(indices));
    this.geometry.setVertexBuffer({
      bufferIndex: 0,
      byteStride: 4 * (4 * 4 + 4 + 4 + 4 + 4),
      // frequency: VertexBufferFrequency.PerInstance,
      frequency: VertexBufferFrequency.PerVertex,
      attributes: [
        {
          format: Format.F32_RGBA,
          bufferByteOffset: 4 * 0,
          location: Batch.AttributeLocation.a_ModelMatrix0,
          // byteStride: 4 * 4,
          //          divisor: 1,
        },
        {
          format: Format.F32_RGBA,
          bufferByteOffset: 4 * 4,
          location: Batch.AttributeLocation.a_ModelMatrix1,
          // byteStride: 4 * 4,
          //          divisor: 1,
        },
        {
          format: Format.F32_RGBA,
          bufferByteOffset: 4 * 8,
          location: Batch.AttributeLocation.a_ModelMatrix2,
          // byteStride: 4 * 4,
          //          divisor: 1,
        },
        {
          format: Format.F32_RGBA,
          bufferByteOffset: 4 * 12,
          location: Batch.AttributeLocation.a_ModelMatrix3,
          // byteStride: 4 * 4,
          //          divisor: 1,
        },
        {
          format: Format.F32_RGBA,
          bufferByteOffset: 4 * 16,
          location: Batch.AttributeLocation.a_Color,
          // byteStride: 4 * 4,
          //          divisor: 1,
        },
        {
          format: Format.F32_RGBA,
          bufferByteOffset: 4 * 20,
          location: Batch.AttributeLocation.a_StrokeColor,
          // byteStride: 4 * 4,
          //          divisor: 1,
        },
        {
          format: Format.F32_RGBA,
          bufferByteOffset: 4 * 24,
          location: Batch.AttributeLocation.a_StylePacked1,
          // byteStride: 4 * 4,
          //          divisor: 1,
        },
        {
          format: Format.F32_RGBA,
          bufferByteOffset: 4 * 28,
          location: Batch.AttributeLocation.a_PickingColor,
          // byteStride: 4 * 4,
          //          divisor: 1,
        },
      ],
      data: new Float32Array(packed),
    });

    geometry.setVertexBuffer({
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

    const { fill, stroke, opacity, fillOpacity, strokeOpacity, lineWidth, anchor, zIndex } =
      object.parsedStyle;
    let fillColor: Tuple4Number = [0, 0, 0, 0];
    if (fill?.type === PARSED_COLOR_TYPE.Constant) {
      fillColor = fill.value;
    }
    let strokeColor: Tuple4Number = [0, 0, 0, 0];
    if (stroke?.type === PARSED_COLOR_TYPE.Constant) {
      strokeColor = stroke.value;
    }
    const encodedPickingColor = object.entity.getComponent(Renderable3D).encodedPickingColor;

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
      // TODO: instanced
      charPackedBuffer.push(
        ...modelMatrix,
        ...fillColor,
        ...strokeColor,
        opacity,
        fillOpacity,
        strokeOpacity,
        lineWidth,
        ...encodedPickingColor,
        zIndex,
      );
      charPackedBuffer.push(
        ...modelMatrix,
        ...fillColor,
        ...strokeColor,
        opacity,
        fillOpacity,
        strokeOpacity,
        lineWidth,
        ...encodedPickingColor,
        zIndex,
      );
      charPackedBuffer.push(
        ...modelMatrix,
        ...fillColor,
        ...strokeColor,
        opacity,
        fillOpacity,
        strokeOpacity,
        lineWidth,
        ...encodedPickingColor,
        zIndex,
      );
      charPackedBuffer.push(
        ...modelMatrix,
        ...fillColor,
        ...strokeColor,
        opacity,
        fillOpacity,
        strokeOpacity,
        lineWidth,
        ...encodedPickingColor,
        zIndex,
      );

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
