import { SceneGraphNode, TextService, DisplayObject, ShapeAttrs } from '@antv/g';
import { Entity } from '@antv/g-ecs';
import { inject, injectable } from 'inversify';
import { ShaderModuleService } from '../services/shader-module';
import symbolVertex from './shaders/webgl.symbol.vert.glsl';
import symbolFragment from './shaders/webgl.symbol.frag.glsl';
import { rgb2arr } from '../utils/color';
import { gl } from '../services/renderer/constants';
import { IUniformBinding, Material3D } from '../components/Material3D';
import { Geometry3D } from '../components/Geometry3D';
import { Renderable3D } from '../components/Renderable3D';
import { BufferData, ITexture2D, IUniform } from '../services/renderer';
import { ModelBuilder } from '.';
import GlyphAtlas from './symbol/GlyphAtlas';
import { StyleGlyph } from './symbol/AlphaImage';
import { BASE_FONT_WIDTH, getDefaultCharacterSet, GlyphManager } from './symbol/GlyphManager';
import { getGlyphQuads } from './symbol/SymbolQuad';

const ATTRIBUTE = {
  Tex: 'a_Tex',
  Offset: 'a_Offset',
};

const UNIFORM = {
  SDFMap: 'u_SDFMap',
  SDFMapSize: 'u_SDFMapSize',
  FontSize: 'u_FontSize',
  FontColor: 'u_FontColor',
  FillOpacity: 'u_FillOpacity',
  GammaScale: 'u_GammaScale',
  StrokeColor: 'u_StrokeColor',
  StrokeOpacity: 'u_StrokeOpacity',
  StrokeWidth: 'u_StrokeWidth',
  StrokeBlur: 'u_StrokeBlur',
  HasStroke: 'u_HasStroke',
};

/**
 * Render text with SDF
 * @see
 */
@injectable()
export class TextModelBuilder implements ModelBuilder {
  @inject(ShaderModuleService)
  private shaderModule: ShaderModuleService;

  @inject(TextService)
  private textService: TextService;

  @inject(GlyphManager)
  private glyphManager: GlyphManager;

  onAttributeChanged(object: DisplayObject, name: string, value: any) {
    const entity = object.getEntity();
    const material = entity.getComponent(Material3D);

    if (name === 'fontSize') {
      material.setUniform(UNIFORM.FontSize, value);
    } else if (name === 'fill') {
      const fillColor = rgb2arr(value);
      material.setUniform(UNIFORM.FontColor, Float32Array.from(fillColor));
    } else if (name === 'fillOpacity') {
      material.setUniform(UNIFORM.FillOpacity, value);
    } else if (name === 'stroke') {
      const strokeColor = rgb2arr(value);
      material.setUniform(UNIFORM.StrokeColor, strokeColor);
    } else if (name === 'strokeOpacity') {
      material.setUniform(UNIFORM.StrokeOpacity, value);
    } else if (name === 'lineWidth') {
      material.setUniform(UNIFORM.StrokeWidth, value);
    } else if (
      name === 'text' ||
      name === 'fontFamily' ||
      name === 'textBaseline' ||
      name === 'letterSpacing' ||
      name === 'wordWrapWidth' ||
      name === 'lineHeight' ||
      name === 'wordWrap' ||
      name === 'textAlign'
    ) {
      this.generateAtlas(object);
    }
  }

  prepareModel(object: DisplayObject) {
    const entity = object.getEntity();
    const { attributes } = entity.getComponent(SceneGraphNode);
    const material = entity.getComponent(Material3D);

    const {
      fill = '',
      fillOpacity = 1,
      stroke = '',
      strokeOpacity = 1,
      fontSize = 0,
      lineWidth = 0,
    } = attributes;

    const fillColor = rgb2arr(fill);
    const strokeColor = rgb2arr(stroke);

    this.shaderModule.registerModule('symbol', {
      vs: symbolVertex,
      fs: symbolFragment,
    });
    const { vs, fs, uniforms: extractedUniforms } = this.shaderModule.getModule('symbol');

    material.vertexShaderGLSL = vs || '';
    material.fragmentShaderGLSL = fs || '';
    material.cull = {
      enable: true,
      face: gl.BACK,
    };
    material.depth = {
      enable: false,
    };
    material.blend = {
      enable: true,
      func: {
        srcRGB: gl.SRC_ALPHA,
        dstRGB: gl.ONE_MINUS_SRC_ALPHA,
      },
    };

    // TODO: support define stroke-relative props per point
    material.setUniform({
      ...(extractedUniforms as Record<string, BufferData>),
      [UNIFORM.FontColor]: fillColor,
      [UNIFORM.FontSize]: fontSize,
      [UNIFORM.FillOpacity]: fillOpacity,
      [UNIFORM.StrokeOpacity]: strokeOpacity,
      [UNIFORM.StrokeColor]: strokeColor,
      [UNIFORM.StrokeWidth]: lineWidth,
    });

    this.generateAtlas(object);
  }

  /**
   * draw 2 passes: stroke & fill
   */
  renderModel(object: DisplayObject) {
    const entity = object.getEntity();
    const { attributes: { stroke, lineWidth } } = entity.getComponent(SceneGraphNode);
    const material = entity.getComponent(Material3D);
    const geometry = entity.getComponent(Geometry3D);
    const renderable3d = entity.getComponent(Renderable3D);

    if (renderable3d.model) {
      const uniforms = material.uniforms.reduce(
        (cur: { [key: string]: IUniform }, prev: IUniformBinding) => {
          cur[prev.name] = prev.data;
          return cur;
        },
        {},
      );
      const attributes = geometry.attributes.reduce(
        (cur: { [key: string]: any }, prev: any) => {
          cur[prev.name] = prev.buffer;
          return cur;
        },
        {},
      );

      // props in each rendering batch
      const drawProps = {
        attributes,
        elements: geometry.indicesBuffer,
        instances: 1,
      };

      const batch = [];
      const hasStroke = stroke && lineWidth;
      if (hasStroke) {
        batch.push({
          ...drawProps,
          uniforms: {
            ...uniforms,
            [UNIFORM.HasStroke]: true,
          },
        });
      }

      batch.push({
        ...drawProps,
        uniforms: {
          ...uniforms,
          [UNIFORM.HasStroke]: false,
        },
      });

      renderable3d.model.draw(batch);
    }
  }

  private generateAtlas(object: DisplayObject) {
    const entity = object.getEntity();
    const { attributes } = entity.getComponent(SceneGraphNode);
    const material = entity.getComponent(Material3D);
    const geometry = entity.getComponent(Geometry3D);
    const renderable3d = entity.getComponent(Renderable3D);
    const {
      text,
      textBaseline,
      fontSize = 0,
      fontFamily = '',
      fontWeight = 'normal',
      letterSpacing = 0,
    } = attributes;

    // shaping text
    const { font, lines, height, lineHeight, maxLineWidth } = this.textService.measureText(text, attributes);

    // @ts-ignore
    this.glyphManager.generateAtlas(font, fontFamily, fontWeight, text, renderable3d.engine);
    const glyphAtlasTexture = this.glyphManager.getAtlasTexture();
    const glyphMap = this.glyphManager.getMap();
    const glyphAtlas = this.glyphManager.getAtlas();
    const { width: atlasWidth, height: atlasHeight } = glyphAtlas.image;

    material.setUniform({
      [UNIFORM.SDFMap]: glyphAtlasTexture,
      [UNIFORM.SDFMapSize]: [atlasWidth, atlasHeight],
    });

    // scale current font size to base(24)
    const fontScale = BASE_FONT_WIDTH / fontSize;

    let linePositionY = 0;
    // handle vertical text baseline
    if (textBaseline === 'middle') {
      linePositionY = -height / 2;
    } else if (textBaseline === 'bottom' || textBaseline === 'alphabetic' || textBaseline === 'ideographic') {
      linePositionY = -height;
    } else if (textBaseline === 'top' || textBaseline === 'hanging') {
      linePositionY = 0;
    }

    const { indexBuffer, charOffsetBuffer, charUVBuffer } = this.buildTextBuffers({
      attributes,
      lines,
      fontStack: font,
      lineHeight: fontScale * lineHeight,
      offsetY: fontScale * linePositionY,
      letterSpacing: fontScale * letterSpacing,
      glyphAtlas,
    });

    geometry.maxInstancedCount = charOffsetBuffer.length / 8;
    geometry.setIndex(indexBuffer);

    geometry.setAttribute(ATTRIBUTE.Tex, Float32Array.from(charUVBuffer), {
      arrayStride: 4 * 2,
      stepMode: 'vertex',
      attributes: [
        {
          shaderLocation: 1,
          offset: 0,
          format: 'float2',
        },
      ],
    });

    geometry.setAttribute(ATTRIBUTE.Offset, Float32Array.from(charOffsetBuffer), {
      arrayStride: 4 * 2,
      stepMode: 'vertex',
      attributes: [
        {
          shaderLocation: 2,
          offset: 0,
          format: 'float2',
        },
      ],
    });
  }

  private buildTextBuffers({
    attributes,
    lines,
    fontStack,
    lineHeight,
    letterSpacing,
    offsetY,
    glyphAtlas,
  }: {
    attributes: ShapeAttrs;
    lines: string[];
    fontStack: string;
    lineHeight: number;
    letterSpacing: number;
    offsetY: number;
    glyphAtlas: GlyphAtlas;
  }) {
    const {
      textAlign = 'start',
    } = attributes;

    const charUVBuffer: number[] = [];
    const charOffsetBuffer: number[] = [];
    const indexBuffer: number[] = [];

    let i = 0;
    const positionedGlyphs = this.glyphManager.layout(
      lines, fontStack, lineHeight,
      textAlign, letterSpacing, offsetY);


    // 计算每个独立字符相对于锚点的位置信息
    const glyphQuads = getGlyphQuads(positionedGlyphs, glyphAtlas.positions);

    glyphQuads.forEach((quad) => {
      charUVBuffer.push(quad.tex.x, quad.tex.y);
      charUVBuffer.push(quad.tex.x + quad.tex.w, quad.tex.y);
      charUVBuffer.push(quad.tex.x + quad.tex.w, quad.tex.y + quad.tex.h);
      charUVBuffer.push(quad.tex.x, quad.tex.y + quad.tex.h);

      charOffsetBuffer.push(quad.tl.x, quad.tl.y);
      charOffsetBuffer.push(quad.tr.x, quad.tr.y);
      charOffsetBuffer.push(quad.br.x, quad.br.y);
      charOffsetBuffer.push(quad.bl.x, quad.bl.y);

      indexBuffer.push(0 + i, 2 + i, 1 + i);
      indexBuffer.push(2 + i, 0 + i, 3 + i);
      i += 4;
    });

    return {
      indexBuffer,
      charUVBuffer,
      charOffsetBuffer,
    };
  }
}
