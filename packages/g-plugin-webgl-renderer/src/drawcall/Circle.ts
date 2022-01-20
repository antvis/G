import { Circle, CircleStyleProps, DisplayObject, SHAPE, RenderingService } from '@antv/g';
import { injectable } from 'mana-syringe';
import { Format, VertexBufferFrequency } from '../platform';
import { Batch, AttributeLocation } from './Batch';
import { ShapeRenderer, ShapeMesh } from '../tokens';
import vert from '../shader/circle.vert';
import frag from '../shader/circle.frag';
import { BatchMesh } from './BatchMesh';

enum CircleProgram {
  a_Extrude = AttributeLocation.MAX,
  a_StylePacked3,
  a_Size,
  a_Uv,
}

const PointShapes: string[] = [SHAPE.Circle, SHAPE.Ellipse, SHAPE.Rect];

@injectable({
  token: [
    { token: ShapeMesh, named: SHAPE.Circle },
    { token: ShapeMesh, named: SHAPE.Ellipse },
    { token: ShapeMesh, named: SHAPE.Rect },
  ],
})
export class CircleBatchMesh extends BatchMesh {
  protected createMaterial(objects: DisplayObject[]): void {
    this.material.vertexShader = vert;
    this.material.fragmentShader = frag;
  }
  protected createGeometry(objects: DisplayObject[]): void {
    // use default common attributes
    this.createBatchedGeometry(objects);

    const interleaved = [];
    const instanced = [];
    const instanced2 = [];
    const indices = [];
    objects.forEach((object, i) => {
      const circle = object as Circle;
      const offset = i * 4;
      // @ts-ignore
      const { lineWidth = 0, radius } = circle.parsedStyle;
      const [halfWidth, halfHeight] = this.getSize(object.attributes, circle.nodeName);
      const size = [halfWidth + lineWidth / 2, halfHeight + lineWidth / 2];
      instanced.push(...size);
      instanced2.push(PointShapes.indexOf(circle.nodeName), radius || 0, 0, 0);

      interleaved.push(-1, -1, 0, 0, 1, -1, 1, 0, 1, 1, 1, 1, -1, 1, 0, 1);
      indices.push(0 + offset, 2 + offset, 1 + offset, 0 + offset, 3 + offset, 2 + offset);
    });

    this.bufferGeometry.setIndices(new Uint32Array(indices));
    this.bufferGeometry.vertexCount = 6;
    this.bufferGeometry.setVertexBuffer({
      bufferIndex: 1,
      byteStride: 4 * 4,
      frequency: VertexBufferFrequency.PerVertex,
      attributes: [
        {
          format: Format.F32_RG,
          bufferByteOffset: 4 * 0,
          location: CircleProgram.a_Extrude,
        },
        {
          format: Format.F32_RG,
          bufferByteOffset: 4 * 2,
          location: CircleProgram.a_Uv,
        },
      ],
      data: new Float32Array(interleaved),
    });
    this.bufferGeometry.setVertexBuffer({
      bufferIndex: 2,
      byteStride: 4 * 2,
      frequency: VertexBufferFrequency.PerInstance,
      attributes: [
        {
          format: Format.F32_RG,
          bufferByteOffset: 4 * 0,
          location: CircleProgram.a_Size,
          divisor: 1,
        },
      ],
      data: new Float32Array(instanced),
    });
    this.bufferGeometry.setVertexBuffer({
      bufferIndex: 3,
      byteStride: 4 * 4,
      frequency: VertexBufferFrequency.PerInstance,
      attributes: [
        {
          format: Format.F32_RGBA,
          bufferByteOffset: 4 * 0,
          location: CircleProgram.a_StylePacked3,
          divisor: 1,
        },
      ],
      data: new Float32Array(instanced2),
    });
  }

  protected updateMeshAttribute(object: DisplayObject, index: number, name: string, value: any) {
    this.updateBatchedAttribute(object, index, name, value);

    if (
      name === 'r' ||
      name === 'rx' ||
      name === 'ry' ||
      name === 'width' ||
      name === 'height' ||
      name === 'lineWidth'
    ) {
      const circle = object as Circle;
      const { lineWidth } = circle.parsedStyle;
      const [halfWidth, halfHeight] = this.getSize(object.attributes, object.nodeName);
      const size = [halfWidth + lineWidth / 2, halfHeight + lineWidth / 2];

      this.geometry.updateVertexBuffer(
        2,
        CircleProgram.a_Size,
        index,
        new Uint8Array(new Float32Array([...size]).buffer),
      );
    } else if (name === 'radius') {
      this.geometry.updateVertexBuffer(
        3,
        CircleProgram.a_StylePacked3,
        index,
        new Uint8Array(
          new Float32Array([
            PointShapes.indexOf(object.nodeName),
            object.parsedStyle.radius || 0,
            0,
            0,
          ]).buffer,
        ),
      );
    }
  }

  private getSize(attributes: CircleStyleProps, tagName: string) {
    if (tagName === SHAPE.Circle) {
      return [attributes.r, attributes.r];
    } else if (tagName === SHAPE.Ellipse) {
      // @ts-ignore
      return [attributes.rx, attributes.ry];
    } else if (tagName === SHAPE.Rect) {
      // @ts-ignore
      return [(attributes.width || 0) / 2, (attributes.height || 0) / 2];
    }
    return [0, 0];
  }
}

@injectable({
  token: [
    { token: ShapeRenderer, named: SHAPE.Circle },
    { token: ShapeRenderer, named: SHAPE.Ellipse },
    { token: ShapeRenderer, named: SHAPE.Rect },
  ],
})
export class CircleRenderer extends Batch {
  protected validate(object: DisplayObject<any, any>): boolean {
    // cannot be merged when lineDash used
    if (object.parsedStyle.lineDash) {
      return false;
    }

    return true;
  }

  protected createBatchMeshList() {
    // draw stroke separate
    this.batchMeshList.push(this.meshFactory(SHAPE.Circle));
    // this.batchMeshList.push(this.meshFactory(SHAPE.Path));
  }
}
