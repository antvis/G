import { injectable } from 'mana-syringe';
import type { DisplayObject, ParsedBaseStyleProps, Tuple4Number } from '@antv/g';
import { CSSRGB } from '@antv/g';
import { Shape } from '@antv/g';
import { vec3, mat4 } from 'gl-matrix';
import { Format, VertexBufferFrequency } from '../platform';
import meshVert from '../shader/mesh.vert';
import meshFrag from '../shader/mesh.frag';
import {
  Instanced,
  VertexAttributeBufferIndex,
  VertexAttributeLocation,
} from '../meshes/Instanced';
import { Uniform, updateBuffer } from './Line';
import { RENDER_ORDER_SCALE } from '../renderer/Batch';

@injectable()
export class FillMesh extends Instanced {
  shouldMerge(object: DisplayObject, index: number) {
    return false;
  }

  createGeometry(objects: DisplayObject[]): void {
    const instance = objects[0];

    // use triangles for Polygon
    const { triangles, pointsBuffer } = updateBuffer(instance, true);
    this.geometry.setVertexBuffer({
      bufferIndex: VertexAttributeBufferIndex.POSITION,
      byteStride: 4 * 2,
      frequency: VertexBufferFrequency.PerVertex,
      attributes: [
        {
          format: Format.F32_RG,
          bufferByteOffset: 4 * 0,
          byteStride: 4 * 2,
          location: VertexAttributeLocation.POSITION,
        },
      ],
      data: new Float32Array(pointsBuffer),
    });
    this.geometry.vertexCount = triangles.length;
    this.geometry.setIndexBuffer(new Uint32Array(triangles));
  }

  createMaterial(objects: DisplayObject[]): void {
    this.material.vertexShader = meshVert;
    this.material.fragmentShader = meshFrag;

    const instance = objects[0];
    const { fill, opacity, fillOpacity, anchor, visibility } =
      instance.parsedStyle as ParsedBaseStyleProps;
    let fillColor: Tuple4Number = [0, 0, 0, 0];
    if (fill instanceof CSSRGB) {
      fillColor = [
        Number(fill.r) / 255,
        Number(fill.g) / 255,
        Number(fill.b) / 255,
        Number(fill.alpha),
      ];
    }

    const encodedPickingColor = (instance.isInteractive() &&
      // @ts-ignore
      instance.renderable3D?.encodedPickingColor) || [0, 0, 0];
    let translateX = 0;
    let translateY = 0;
    const contentBounds = instance.getGeometryBounds();
    if (contentBounds) {
      const { halfExtents } = contentBounds;
      translateX = -halfExtents[0] * anchor[0].value * 2;
      translateY = -halfExtents[1] * anchor[1].value * 2;
    }

    const m = mat4.create();
    mat4.mul(
      m,
      instance.getWorldTransform(), // apply anchor
      mat4.fromTranslation(m, vec3.fromValues(translateX, translateY, 0)),
    );

    this.material.setUniforms({
      [Uniform.MODEL_MATRIX]: m,
      [Uniform.COLOR]: fillColor,
      [Uniform.PICKING_COLOR]: encodedPickingColor,
      [Uniform.OPACITY]: opacity.value,
      [Uniform.FILL_OPACITY]: fillOpacity.value,
      [Uniform.VISIBLE]: visibility.value === 'visible' ? 1 : 0,
      [Uniform.Z_INDEX]: instance.sortable.renderOrder * RENDER_ORDER_SCALE,
    });
  }

  updateAttribute(objects: DisplayObject[], startIndex: number, name: string, value: any): void {
    super.updateAttribute(objects, startIndex, name, value);

    objects.forEach((object) => {
      const { fill, opacity, fillOpacity, anchor, visibility } =
        object.parsedStyle as ParsedBaseStyleProps;
      if (
        name === 'lineJoin' ||
        name === 'lineCap' ||
        (object.nodeName === Shape.RECT &&
          (name === 'width' || name === 'height' || name === 'radius')) ||
        (object.nodeName === Shape.LINE &&
          (name === 'x1' || name === 'y1' || name === 'x2' || name === 'y2')) ||
        (object.nodeName === Shape.POLYLINE && name === 'points') ||
        (object.nodeName === Shape.POLYGON && name === 'points') ||
        (object.nodeName === Shape.PATH && name === 'path')
      ) {
        // need re-calc geometry
        this.material.geometryDirty = true;
        this.material.programDirty = true;
      } else if (name === 'fill') {
        let fillColor: Tuple4Number = [0, 0, 0, 0];
        if (fill instanceof CSSRGB) {
          fillColor = [
            Number(fill.r) / 255,
            Number(fill.g) / 255,
            Number(fill.b) / 255,
            Number(fill.alpha),
          ];
        }
        this.material.setUniforms({
          [Uniform.COLOR]: fillColor,
        });
      } else if (name === 'opacity') {
        this.material.setUniforms({
          [Uniform.OPACITY]: opacity.value,
        });
      } else if (name === 'fillOpacity') {
        this.material.setUniforms({
          [Uniform.FILL_OPACITY]: fillOpacity.value,
        });
      } else if (name === 'anchor' || name === 'modelMatrix') {
        let translateX = 0;
        let translateY = 0;
        const contentBounds = object.getGeometryBounds();
        if (contentBounds) {
          const { halfExtents } = contentBounds;
          translateX = -halfExtents[0] * anchor[0].value * 2;
          translateY = -halfExtents[1] * anchor[1].value * 2;
        }
        const m = mat4.create();
        mat4.mul(
          m,
          object.getWorldTransform(), // apply anchor
          mat4.fromTranslation(m, vec3.fromValues(translateX, translateY, 0)),
        );
        this.material.setUniforms({
          [Uniform.MODEL_MATRIX]: m,
        });
      } else if (name === 'visibility') {
        this.material.setUniforms({
          [Uniform.VISIBLE]: visibility.value === 'visible' ? 1 : 0,
        });
      } else if (name === 'pointerEvents') {
        const encodedPickingColor = (object.isInteractive() &&
          // @ts-ignore
          object.renderable3D?.encodedPickingColor) || [0, 0, 0];
        this.material.setUniforms({
          [Uniform.PICKING_COLOR]: encodedPickingColor,
        });
      }
    });
  }

  changeRenderOrder(object: DisplayObject, renderOrder: number) {
    if (this.material) {
      this.material.setUniforms({
        [Uniform.Z_INDEX]: renderOrder * RENDER_ORDER_SCALE,
      });
    }
  }
}
