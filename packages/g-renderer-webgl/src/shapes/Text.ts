import { SceneGraphNode, TextService, SHAPE, ShapeAttrs } from '@antv/g';
import { Entity } from '@antv/g-ecs';
import { inject, injectable } from 'inversify';
import { ShaderModuleService } from '../services/shader-module';
import symbolVertex from './shaders/webgl.symbol.vert.glsl';
import symbolFragment from './shaders/webgl.symbol.frag.glsl';
import { rgb2arr } from '../utils/color';
import { gl } from '../services/renderer/constants';
import { Material3D } from '../components/Material3D';
import { Geometry3D } from '../components/Geometry3D';
import { Renderable3D } from '../components/Renderable3D';
import { BufferData, ITexture2D } from '../services/renderer';
import { WebGLRenderingContext } from '../services/WebGLContextService';
import { ModelBuilder } from '.';
import GlyphAtlas from './symbol/GlyphAtlas';
import { StyleGlyph } from './symbol/AlphaImage';
import { getDefaultCharacterSet, GlyphManager } from './symbol/GlyphManager';
import { getGlyphQuads } from './symbol/SymbolQuad';
import { shapeText } from './symbol/layout';
import { mat4 } from 'gl-matrix';

const pointShapes = ['circle', 'ellipse', 'rect', 'rounded-rect'];

interface IPointConfig {
  id: number;
  shape: 'circle' | 'ellipse' | 'rect';
  size: [number, number];
  color: [number, number, number, number]; // sRGB
  opacity: number;
  strokeWidth: number;
  strokeOpacity: number;
  strokeColor: [number, number, number, number]; // sRGB
}

interface IInstanceAttributes {
  extrudes: number[];
  instancedColors: number[];
  instancedSizes: number[];
}

const ATTRIBUTE = {
  Pos: 'a_Pos',
  Tex: 'a_Tex',
  Offset: 'a_Offset',
};

const UNIFORM = {
  SDFMap: 'u_SDFMap',
  SDFMapSize: 'u_SDFMapSize',
  LabelMatrix: 'u_LabelMatrix',
  FontSize: 'u_FontSize',
  FontColor: 'u_FontColor',
  FontOpacity: 'u_FontOpacity',
  GammaScale: 'u_GammaScale',
  HaloColor: 'u_HaloColor',
  HaloWidth: 'u_HaloWidth',
  HaloBlur: 'u_HaloBlur',
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

  private glyphAtlas: GlyphAtlas;
  private glyphMap: { [key: string]: StyleGlyph };
  private glyphAtlasTexture: ITexture2D;

  async onAttributeChanged(entity: Entity, name: string, value: any) {
    const renderable = entity.getComponent(SceneGraphNode);
    const renderable3d = entity.getComponent(Renderable3D);
    // if we are updating sub renderable's attribute
    // if (renderable3d && renderable3d.source && renderable3d.sourceEntity) {
    //   const sourceGeometry = renderable3d.sourceEntity.getComponent(Geometry3D);
    //   // TODO: update subdata in this buffer
    //   const { r = 0, lineWidth = 0, rx = 0, ry = 0 } = renderable.attributes;
    //   const index = renderable3d.source.instances.indexOf(renderable3d);
    //   if (name === 'r') {
    //     const sizeAttribute = sourceGeometry.getAttribute(ATTRIBUTE.Size);
    //     if (sizeAttribute) {
    //       sizeAttribute.buffer?.subData({
    //         data: Float32Array.from([value - lineWidth / 2, value - lineWidth / 2]),
    //         offset: index * Float32Array.BYTES_PER_ELEMENT * 2,
    //       });
    //     }
    //   }
    // } else {
    const material = entity.getComponent(Material3D);
    const geometry = entity.getComponent(Geometry3D);

    //   if (material && geometry) {
    if (name === 'fontSize') {
      material.setUniform(UNIFORM.FontSize, value);
    }
    //     if (name === 'fill') {
    //       const fillColor = rgb2arr(value);
    //       geometry.setAttribute(ATTRIBUTE.Color, Float32Array.from(fillColor));
    //     } else if (name === 'stroke') {
    //       const strokeColor = rgb2arr(value);
    //       material.setUniform(UNIFORM.StrokeColor, strokeColor);
    //     } else if (name === 'strokeOpacity') {
    //       material.setUniform(UNIFORM.StrokeOpacity, value);
    //     } else if (name === 'r') {
    //       geometry.setAttribute(ATTRIBUTE.Size, Float32Array.from([value - lineWidth / 2, value - lineWidth / 2]));
    //     } else if (name === 'rx') {
    //       geometry.setAttribute(ATTRIBUTE.Size, Float32Array.from([value - lineWidth / 2, ry - lineWidth / 2]));
    //     } else if (name === 'ry') {
    //       geometry.setAttribute(ATTRIBUTE.Size, Float32Array.from([rx - lineWidth / 2, value - lineWidth / 2]));
    //     } else if (name === 'width') {
    //       geometry.setAttribute(
    //         ATTRIBUTE.Size,
    //         Float32Array.from([value / 2 - lineWidth / 2, height / 2 - lineWidth / 2])
    //       );
    //     } else if (name === 'height') {
    //       geometry.setAttribute(
    //         ATTRIBUTE.Size,
    //         Float32Array.from([width / 2 - lineWidth / 2, value / 2 - lineWidth / 2])
    //       );
    //     } else if (name === 'lineWidth') {
    //       // 改变线宽时需要同时修改半径，保持与 Canvas 渲染效果一致
    //       geometry.setAttribute(
    //         ATTRIBUTE.Size,
    //         Float32Array.from([(rx || r || width / 2) - value / 2, (ry || r || height / 2) - value / 2])
    //       );
    //       material.setUniform(UNIFORM.StrokeWidth, value);
    //     } else if (name === 'radius') {
    //       material.setUniform(UNIFORM.RectRadius, value);
    //     }
    //   }
    // }
  }

  async prepareModel(context: WebGLRenderingContext, entity: Entity) {
    const sceneGraphNode = entity.getComponent(SceneGraphNode);
    const material = entity.getComponent(Material3D);
    const geometry = entity.getComponent(Geometry3D);
    const renderable3d = entity.getComponent(Renderable3D);
    const instancing = renderable3d.instances.length > 0;

    const {
      text,
      fill = '',
      fillOpacity = 1,
      stroke = '',
      strokeOpacity = 1,
      fontSize = 0,
    } = sceneGraphNode.attributes;

    this.initGlyphAtlas(context, sceneGraphNode.attributes);

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

    const { width, height, data } = this.glyphAtlas.image;
    this.glyphAtlasTexture = context.engine.createTexture2D({
      width,
      height,
      mag: gl.LINEAR,
      min: gl.LINEAR,
      format: gl.ALPHA,
      data,
    });

    // TODO: support define stroke-relative props per point
    material.setUniform({
      ...(extractedUniforms as Record<string, BufferData>),
      [UNIFORM.FontColor]: fillColor,
      [UNIFORM.FontSize]: fontSize,
      [UNIFORM.SDFMap]: this.glyphAtlasTexture,
      [UNIFORM.SDFMapSize]: [width, height],
      [UNIFORM.LabelMatrix]: mat4.create(),
    });

    // const attributes = this.buildAttributes(config);
    const { indexBuffer, charOffsetBuffer, charPositionBuffer, charUVBuffer } = this.buildTextBuffers([
      {
        text,
        position: [0, 0],
      },
    ]);

    // geometry.maxInstancedCount = attributes.instancedSizes.length / 2;
    geometry.vertexCount = charOffsetBuffer.length / 2;

    geometry.setIndex(indexBuffer);

    geometry.setAttribute(ATTRIBUTE.Pos, Float32Array.from(charPositionBuffer), {
      arrayStride: 4 * 2,
      stepMode: 'vertex',
      attributes: [
        {
          shaderLocation: 0,
          offset: 0,
          format: 'float2',
        },
      ],
    });

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

  // private buildAttribute(config: Partial<IPointConfig>, attributes: IInstanceAttributes, index: number) {
  //   attributes.instancedColors.push(...(config.color || [1, 0, 0, 1]));
  //   attributes.instancedSizes.push(...(config.size || [0.2, 0.2]));
  // }

  // private buildAttributes(config: Partial<IPointConfig> | Array<Partial<IPointConfig>>) {
  //   const attributes: IInstanceAttributes = {
  //     extrudes: [1, 1, 1, -1, -1, -1, -1, 1],
  //     instancedColors: [],
  //     instancedSizes: [],
  //   };

  //   if (Array.isArray(config)) {
  //     config.forEach((c, i) => {
  //       this.buildAttribute(c, attributes, i);
  //     });
  //   } else {
  //     this.buildAttribute(config, attributes, 0);
  //   }

  //   return attributes;
  // }

  /**
   * 创建 Atlas
   */
  private initGlyphAtlas(context: WebGLRenderingContext, attributes: ShapeAttrs) {
    const fontStack = `${attributes.fontFamily} ${attributes.fontWeight}`;
    this.fontStack = fontStack;

    const glyphMap = getDefaultCharacterSet()
      .map((char) => {
        return this.glyphManager.generateSDF(fontStack, char);
      })
      .reduce((prev, cur) => {
        // @ts-ignore
        prev[cur.id] = cur;
        return prev;
      }, {}) as StyleGlyph;

    if (!this.glyphMap) {
      this.glyphMap = {};
    }

    this.glyphMap[fontStack] = glyphMap;

    this.glyphAtlas = new GlyphAtlas(this.glyphMap);
  }

  private buildTextBuffers(textArray: ITextFeature[]) {
    const charPositionBuffer: number[] = [];
    const charUVBuffer: number[] = [];
    const charOffsetBuffer: number[] = [];
    const indexBuffer: number[] = [];

    // const textOffset: [number, number] = [ this.textOffsetX, this.textOffsetY ];
    const textOffset: [number, number] = [0, 0];
    // const fontScale = this.fontSize / 24;

    // 首先按权重从高到低排序
    // textArray.sort(compareClusterText);

    let i = 0;
    textArray.forEach(({ text, position }) => {
      // 锚点
      // const anchor = new Point(position[0], position[1]);
      // 计算布局
      //
      // const shaping = shapeText(text, this.glyphMap, this.fontStack, 0, 24, this.symbolAnchor, this.textJustify, this.textSpacing, textOffset, 1);
      const shaping = shapeText(text, this.glyphMap, this.fontStack, 0, 24, 'center', 'center', 0, textOffset, 1);

      if (shaping) {
        // 加入索引
        // const { box } = this.collisionIndex.placeCollisionBox({
        //   x1: shaping.left * fontScale,
        //   x2: shaping.right * fontScale,
        //   y1: shaping.top * fontScale,
        //   y2: shaping.bottom * fontScale,
        //   anchorPointX: position[0],
        //   anchorPointY: position[1],
        // }, false, textPixelRatio, posMatrix);

        // if (box && box.length) {
        //   this.collisionIndex.insertCollisionBox(box, 0, 0, 0);

        // 计算每个独立字符相对于锚点的位置信息
        const glyphQuads = getGlyphQuads(shaping, textOffset, false, this.glyphAtlas.positions);

        glyphQuads.forEach((quad) => {
          // TODO: vertex compression
          charPositionBuffer.push(...position);
          charPositionBuffer.push(...position);
          charPositionBuffer.push(...position);
          charPositionBuffer.push(...position);

          charUVBuffer.push(quad.tex.x, quad.tex.y);
          charUVBuffer.push(quad.tex.x + quad.tex.w, quad.tex.y);
          charUVBuffer.push(quad.tex.x + quad.tex.w, quad.tex.y + quad.tex.h);
          charUVBuffer.push(quad.tex.x, quad.tex.y + quad.tex.h);

          charOffsetBuffer.push(quad.tl.x, quad.tl.y);
          charOffsetBuffer.push(quad.tr.x, quad.tr.y);
          charOffsetBuffer.push(quad.br.x, quad.br.y);
          charOffsetBuffer.push(quad.bl.x, quad.bl.y);

          indexBuffer.push(0 + i, 1 + i, 2 + i);
          indexBuffer.push(2 + i, 3 + i, 0 + i);
          i += 4;
        });
      }
    });

    return {
      indexBuffer,
      charPositionBuffer,
      charUVBuffer,
      charOffsetBuffer,
    };
  }
}
