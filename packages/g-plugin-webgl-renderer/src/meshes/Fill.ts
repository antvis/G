import { injectable } from 'mana-syringe';
import { DisplayObject, PARSED_COLOR_TYPE, Shape, Tuple4Number } from '@antv/g';
import { vec3, mat4 } from 'gl-matrix';
import { Format, VertexBufferFrequency } from '../platform';
import meshVert from '../shader/mesh.vert';
import meshFrag from '../shader/mesh.frag';
import { Instanced } from '../meshes/Instanced';
import { Uniform, updateBuffer } from './Line';
import { RENDER_ORDER_SCALE } from '../renderer/Batch';
import { enumToObject } from '../utils/enum';

enum MeshVertexAttributeLocation {
  POSITION = 0,
}

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
      bufferIndex: 0,
      byteStride: 4 * 2,
      frequency: VertexBufferFrequency.PerVertex,
      attributes: [
        {
          format: Format.F32_RG,
          bufferByteOffset: 4 * 0,
          byteStride: 4 * 2,
          location: MeshVertexAttributeLocation.POSITION,
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
    this.material.defines = {
      ...this.material.defines,
      ...enumToObject(MeshVertexAttributeLocation),
    };

    const instance = objects[0];

    const { fill, opacity, fillOpacity, anchor, visibility } = instance.parsedStyle;
    let fillColor: Tuple4Number = [0, 0, 0, 0];
    if (fill?.type === PARSED_COLOR_TYPE.Constant) {
      fillColor = fill.value;
    }

    // @ts-ignore
    const encodedPickingColor = instance.renderable3D?.encodedPickingColor || [0, 0, 0];
    let translateX = 0;
    let translateY = 0;
    const contentBounds = instance.getGeometryBounds();
    if (contentBounds) {
      const { halfExtents } = contentBounds;
      translateX = -halfExtents[0] * anchor[0] * 2;
      translateY = -halfExtents[1] * anchor[1] * 2;
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
      [Uniform.OPACITY]: opacity,
      [Uniform.FILL_OPACITY]: fillOpacity,
      [Uniform.VISIBLE]: visibility === 'visible' ? 1 : 0,
      [Uniform.Z_INDEX]: instance.sortable.renderOrder * RENDER_ORDER_SCALE,
    });
  }

  updateAttribute(object: DisplayObject, name: string, value: any): void {
    super.updateAttribute(object, name, value);

    const { fill, opacity, fillOpacity, anchor, visibility } = object.parsedStyle;
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
      if (fill?.type === PARSED_COLOR_TYPE.Constant) {
        fillColor = fill.value;
      }
      this.material.setUniforms({
        [Uniform.COLOR]: fillColor,
      });
    } else if (name === 'opacity') {
      this.material.setUniforms({
        [Uniform.OPACITY]: opacity,
      });
    } else if (name === 'fillOpacity') {
      this.material.setUniforms({
        [Uniform.FILL_OPACITY]: fillOpacity,
      });
    } else if (name === 'anchor' || name === 'modelMatrix') {
      let translateX = 0;
      let translateY = 0;
      const contentBounds = object.getGeometryBounds();
      if (contentBounds) {
        const { halfExtents } = contentBounds;
        translateX = -halfExtents[0] * anchor[0] * 2;
        translateY = -halfExtents[1] * anchor[1] * 2;
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
        [Uniform.VISIBLE]: visibility === 'visible' ? 1 : 0,
      });
    }
  }

  changeRenderOrder(object: DisplayObject, renderOrder: number) {
    if (this.material) {
      this.material.setUniforms({
        [Uniform.Z_INDEX]: renderOrder * RENDER_ORDER_SCALE,
      });
    }
  }
}
