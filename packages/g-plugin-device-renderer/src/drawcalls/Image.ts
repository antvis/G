import type { DisplayObject, Image as ImageShape } from '@antv/g-lite';
import { Format, VertexStepMode } from '@antv/g-device-api';
import {
  Instanced,
  VertexAttributeBufferIndex,
  VertexAttributeLocation,
} from './Instanced';
import frag from '../shader/image.frag';
import vert from '../shader/image.vert';
import { enumToObject } from '../utils';

enum ImageVertexAttributeBufferIndex {
  PACKED_STYLE = VertexAttributeBufferIndex.POSITION + 1,
  SIZE = VertexAttributeBufferIndex.MAX,
}

enum ImageVertexAttributeLocation {
  PACKED_STYLE3 = VertexAttributeLocation.MAX,
  SIZE,
}

export class ImageDrawcall extends Instanced {
  shouldMerge(object: DisplayObject, index: number) {
    const shouldMerge = super.shouldMerge(object, index);

    if (!shouldMerge) {
      return false;
    }

    if (this.instance.parsedStyle.src !== object.parsedStyle.src) {
      return false;
    }

    return true;
  }

  // private calculateWithAspectRatio(
  //   object: Image,
  //   imageWidth: number,
  //   imageHeight: number,
  // ) {
  //   const { width, height } = object.parsedStyle;
  //   // if (width && !height) {
  //   //   object.setAttribute('height', (imageHeight / imageWidth) * width);
  //   // } else if (!width && height) {
  //   //   object.setAttribute('width', (imageWidth / imageHeight) * height);
  //   // }
  // }

  createMaterial(objects: DisplayObject[]): void {
    const instance = objects[0];
    const { src } = instance.parsedStyle;

    this.material.defines = {
      ...this.material.defines,
      ...enumToObject(ImageVertexAttributeLocation),
    };

    this.material.vertexShader = vert;
    this.material.fragmentShader = frag;

    const map = this.texturePool.getOrCreateTexture(
      this.context.device,
      src,
      undefined,
      // (texture, image) => {
      //   const { width, height } = image;
      //   objects.forEach((object) => {
      //     const image = object as ImageShape;
      //     const { keepAspectRatio } = image.parsedStyle;
      //     if (keepAspectRatio) {
      //       this.calculateWithAspectRatio(object, width, height);
      //       // set dirty rectangle flag
      //       object.renderable.dirty = true;
      //       this.context.renderingService.dirtify();
      //     }
      //   });
      // },
    );
    this.material.setUniforms({
      u_Map: map,
    });
  }

  createGeometry(objects: DisplayObject[]): void {
    // use default common attributes
    super.createGeometry(objects);

    const positions: number[] = [];
    const sizes: number[] = [];
    const packedStyle: number[] = [];
    objects.forEach((object, i) => {
      const image = object as ImageShape;
      const {
        x = 0,
        y = 0,
        z = 0,
        width,
        height,
        isBillboard,
        billboardRotation,
        isSizeAttenuation,
      } = image.parsedStyle;
      positions.push(x, y, z);
      sizes.push(width, height);
      packedStyle.push(
        isBillboard ? 1 : 0,
        billboardRotation ?? 0,
        isSizeAttenuation ? 1 : 0,
        0,
      );
    });

    this.geometry.setIndexBuffer(new Uint32Array([0, 2, 1, 0, 3, 2]));
    this.geometry.vertexCount = 6;
    this.geometry.setVertexBuffer({
      bufferIndex: VertexAttributeBufferIndex.POSITION,
      byteStride: 4 * 3,
      stepMode: VertexStepMode.INSTANCE,
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
      bufferIndex: ImageVertexAttributeBufferIndex.SIZE,
      byteStride: 4 * 2,
      stepMode: VertexStepMode.INSTANCE,
      attributes: [
        {
          format: Format.F32_RG,
          bufferByteOffset: 4 * 0,
          location: ImageVertexAttributeLocation.SIZE,
        },
      ],
      data: new Float32Array(sizes),
    });
    this.geometry.setVertexBuffer({
      bufferIndex: ImageVertexAttributeBufferIndex.PACKED_STYLE,
      byteStride: 4 * 4,
      stepMode: VertexStepMode.INSTANCE,
      attributes: [
        {
          format: Format.F32_RGBA,
          bufferByteOffset: 4 * 0,
          location: ImageVertexAttributeLocation.PACKED_STYLE3,
          divisor: 1,
        },
      ],
      data: new Float32Array(packedStyle),
    });
    this.geometry.setVertexBuffer({
      bufferIndex: VertexAttributeBufferIndex.UV,
      byteStride: 4 * 2,
      stepMode: VertexStepMode.VERTEX,
      attributes: [
        {
          format: Format.F32_RG,
          bufferByteOffset: 4 * 0,
          location: VertexAttributeLocation.UV,
        },
      ],
      data: new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]),
    });
  }

  updateAttribute(
    objects: DisplayObject[],
    startIndex: number,
    name: string,
    value: any,
  ) {
    if (objects.length === 0) {
      return;
    }

    super.updateAttribute(objects, startIndex, name, value);

    this.updateBatchedAttribute(objects, startIndex, name, value);

    if (name === 'x' || name === 'y' || name === 'z') {
      const packed: number[] = [];
      objects.forEach((object) => {
        const image = object as ImageShape;
        const { x = 0, y = 0, z = 0 } = image.parsedStyle;
        packed.push(x, y, z);
      });

      this.geometry.updateVertexBuffer(
        VertexAttributeBufferIndex.POSITION,
        VertexAttributeLocation.POSITION,
        startIndex,
        new Uint8Array(new Float32Array(packed).buffer),
      );
    } else if (name === 'width' || name === 'height') {
      const packed: number[] = [];
      objects.forEach((object) => {
        const image = object as ImageShape;
        const { width, height } = image.parsedStyle;
        packed.push(width, height);
      });

      this.geometry.updateVertexBuffer(
        ImageVertexAttributeBufferIndex.SIZE,
        ImageVertexAttributeLocation.SIZE,
        startIndex,
        new Uint8Array(new Float32Array(packed).buffer),
      );
    } else if (
      name === 'isBillboard' ||
      name === 'billboardRotation' ||
      name === 'isSizeAttenuation'
    ) {
      const packed: number[] = [];
      objects.forEach((object) => {
        const image = object as ImageShape;
        const { isBillboard, billboardRotation, isSizeAttenuation } =
          image.parsedStyle;
        packed.push(
          isBillboard ? 1 : 0,
          billboardRotation ?? 0,
          isSizeAttenuation ? 1 : 0,
          0,
        );
      });

      this.geometry.updateVertexBuffer(
        ImageVertexAttributeBufferIndex.PACKED_STYLE,
        ImageVertexAttributeLocation.PACKED_STYLE3,
        startIndex,
        new Uint8Array(new Float32Array(packed).buffer),
      );
    } else if (name === 'src') {
      const map = this.texturePool.getOrCreateTexture(
        this.context.device,
        value,
      );
      this.material.setUniforms({
        u_Map: map,
      });
    }
  }
}
