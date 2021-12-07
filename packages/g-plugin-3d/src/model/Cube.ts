// import { DisplayObject } from '@antv/g';
// import { singleton } from 'mana-syringe';
// import { vec3 } from 'gl-matrix';
// import {
//   Batch,
//   AttributeLocation,
//   DeviceProgram,
//   Format,
//   makeTextureDescriptor2D,
//   MipFilterMode,
//   TexFilterMode,
//   WrapMode,
//   TextureMapping,
//   RenderInst,
//   VertexBufferFrequency,
// } from '@antv/g-plugin-webgl-renderer';
// import { Cube, CubeStyleProps } from '../Cube';

// const primitiveUv1Padding = 4.0 / 64;
// const primitiveUv1PaddingScale = 1.0 - primitiveUv1Padding * 2;

// class CubeProgram extends DeviceProgram {
//   static a_Position = AttributeLocation.MAX;
//   static a_Normal = AttributeLocation.MAX + 1;
//   static a_Uv = AttributeLocation.MAX + 2;

//   static ub_ObjectParams = 1;

//   both: string = `
//   ${Batch.ShaderLibrary.BothDeclaration}
//   `;

//   vert: string = `
//   ${Batch.ShaderLibrary.VertDeclaration}

//   layout(location = ${CubeProgram.a_Position}) attribute vec3 a_Position;
//   layout(location = ${CubeProgram.a_Normal}) attribute vec3 a_Normal;
//   #ifdef USE_UV
//     layout(location = ${CubeProgram.a_Uv}) attribute vec2 a_Uv;
//     varying vec2 v_Uv;
//   #endif

//   void main() {
//     ${Batch.ShaderLibrary.Vert}

//     gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_ModelMatrix * vec4(a_Position, 1.0);

//     ${Batch.ShaderLibrary.UvVert}
//   }
//   `;

//   frag: string = `
//   ${Batch.ShaderLibrary.FragDeclaration}
//   ${Batch.ShaderLibrary.UvFragDeclaration}
//   ${Batch.ShaderLibrary.MapFragDeclaration}

//   void main() {
//     ${Batch.ShaderLibrary.Frag}
//     ${Batch.ShaderLibrary.MapFrag}

//     gl_FragColor = u_Color;
//     gl_FragColor.a = gl_FragColor.a * u_Opacity * u_FillOpacity;
//   }
//   `;
// }

// @singleton()
// export class CubeModelBuilder extends Batch {
//   program = new CubeProgram();

//   validate(object: DisplayObject) {
//     const instance = this.instance;

//     // TODO: support different tex map, eg. max 24 like PIXI.js
//     if (instance.parsedStyle.map && instance.parsedStyle.map !== object.parsedStyle.map) {
//       return false;
//     }

//     return true;
//   }

//   buildGeometry() {
//     this.program.setDefineBool('USE_UV', true);

//     const { map } = this.instance.parsedStyle;

//     if (map) {
//       this.program.setDefineBool('USE_MAP', true);
//       this.mapping = new TextureMapping();
//       this.mapping.texture = this.texturePool.getOrCreateTexture(
//         this.device,
//         map,
//         makeTextureDescriptor2D(Format.U8_RGBA_NORM, 1, 1, 1),
//         () => {
//           // need re-render
//           this.objects.forEach((object) => {
//             const renderable = object.renderable;
//             renderable.dirty = true;

//             this.renderingService.dirtify();
//           });
//         },
//       );
//       this.device.setResourceName(this.mapping.texture, 'Image Texture');
//       this.mapping.sampler = this.renderHelper.getCache().createSampler({
//         wrapS: WrapMode.Clamp,
//         wrapT: WrapMode.Clamp,
//         minFilter: TexFilterMode.Bilinear,
//         magFilter: TexFilterMode.Bilinear,
//         mipFilter: MipFilterMode.NoMip,
//         minLOD: 0,
//         maxLOD: 0,
//       });
//     }

//     const { indices, positions, normals, uvs } = this.buildAttributes(this.objects);

//     this.geometry.setIndices(new Uint32Array(indices));
//     this.geometry.vertexCount = 36;
//     this.geometry.setVertexBuffer({
//       bufferIndex: 1,
//       byteStride: 4 * 3,
//       frequency: VertexBufferFrequency.PerVertex,
//       attributes: [
//         {
//           format: Format.F32_RGB,
//           bufferByteOffset: 4 * 0,
//           location: CubeProgram.a_Position,
//         },
//       ],
//       data: Float32Array.from(positions),
//     });
//     this.geometry.setVertexBuffer({
//       bufferIndex: 2,
//       byteStride: 4 * 3,
//       frequency: VertexBufferFrequency.PerVertex,
//       attributes: [
//         {
//           format: Format.F32_RGB,
//           bufferByteOffset: 4 * 0,
//           location: CubeProgram.a_Normal,
//         },
//       ],
//       data: Float32Array.from(normals),
//     });
//     this.geometry.setVertexBuffer({
//       bufferIndex: 3,
//       byteStride: 4 * 2,
//       frequency: VertexBufferFrequency.PerVertex,
//       attributes: [
//         {
//           format: Format.F32_RG,
//           bufferByteOffset: 4 * 0,
//           location: CubeProgram.a_Uv,
//         },
//       ],
//       data: Float32Array.from(uvs),
//     });
//   }

//   updateAttribute(object: DisplayObject, name: string, value: any) {
//     super.updateAttribute(object, name, value);
//     const index = this.objects.indexOf(object);
//     const geometry = this.geometry;

//     if (name === 'width' || name === 'height' || name === 'depth') {
//       const { positions } = this.buildAttributes([object]);

//       geometry.updateVertexBuffer(
//         1,
//         CubeProgram.a_Position,
//         index,
//         new Uint8Array(new Float32Array(positions).buffer),
//       );
//     }
//   }

//   uploadUBO(renderInst: RenderInst): void {
//     // need 1 sampler
//     renderInst.setBindingLayouts([{ numUniformBuffers: 1, numSamplers: 1 }]);
//     renderInst.setSamplerBindingsFromTextureMappings([this.mapping]);
//   }

//   protected buildAttributes(objects: Cube[]) {
//     const positionsAll: number[] = [];
//     const normalsAll: number[] = [];
//     const uvsAll: number[] = [];
//     const uvs1All: number[] = [];
//     const indicesAll: number[] = [];
//     let indicesStart = 0;
//     objects.forEach((object) => {
//       const attributes = object.attributes as CubeStyleProps;

//       const {
//         widthSegments = 1,
//         heightSegments = 1,
//         depthSegments = 1,
//         height = 0,
//         width = 0,
//         depth = 0,
//       } = attributes;
//       const ws = widthSegments;
//       const hs = heightSegments;
//       const ds = depthSegments;
//       const hex = width / 2;
//       const hey = height / 2;
//       const hez = depth / 2;

//       const corners = [
//         vec3.fromValues(-hex, -hey, hez),
//         vec3.fromValues(hex, -hey, hez),
//         vec3.fromValues(hex, hey, hez),
//         vec3.fromValues(-hex, hey, hez),
//         vec3.fromValues(hex, -hey, -hez),
//         vec3.fromValues(-hex, -hey, -hez),
//         vec3.fromValues(-hex, hey, -hez),
//         vec3.fromValues(hex, hey, -hez),
//       ];

//       const faceAxes = [
//         [0, 3, 1], // FRONT
//         [4, 7, 5], // BACK
//         [1, 4, 0], // TOP
//         [3, 6, 2], // BOTTOM
//         [1, 2, 4], // RIGHT
//         [5, 6, 0], // LEFT
//       ];

//       const faceNormals = [
//         [0, 0, 1], // FRONT
//         [0, 0, -1], // BACK
//         [0, -1, 0], // TOP
//         [0, 1, 0], // BOTTOM
//         [1, 0, 0], // RIGHT
//         [-1, 0, 0], // LEFT
//       ];

//       const sides = {
//         FRONT: 0,
//         BACK: 1,
//         TOP: 2,
//         BOTTOM: 3,
//         RIGHT: 4,
//         LEFT: 5,
//       };

//       const positions: number[] = [];
//       const normals: number[] = [];
//       const uvs: number[] = [];
//       const uvs1: number[] = [];
//       const indices: number[] = [];
//       let vcounter = 0;

//       const generateFace = (side: number, uSegments: number, vSegments: number) => {
//         let u: number;
//         let v: number;
//         let i: number;
//         let j: number;

//         for (i = 0; i <= uSegments; i++) {
//           for (j = 0; j <= vSegments; j++) {
//             const temp1 = vec3.create();
//             const temp2 = vec3.create();
//             const temp3 = vec3.create();
//             const r = vec3.create();
//             vec3.lerp(temp1, corners[faceAxes[side][0]], corners[faceAxes[side][1]], i / uSegments);
//             vec3.lerp(temp2, corners[faceAxes[side][0]], corners[faceAxes[side][2]], j / vSegments);
//             vec3.sub(temp3, temp2, corners[faceAxes[side][0]]);
//             vec3.add(r, temp1, temp3);
//             u = i / uSegments;
//             v = j / vSegments;

//             positions.push(r[0], r[1], r[2]);
//             normals.push(faceNormals[side][0], faceNormals[side][1], faceNormals[side][2]);
//             uvs.push(u, v);
//             // pack as 3x2
//             // 1/3 will be empty, but it's either that or stretched pixels
//             // TODO: generate non-rectangular lightMaps, so we could use space without stretching
//             u /= 3;
//             v /= 3;
//             u = u * primitiveUv1PaddingScale + primitiveUv1Padding;
//             v = v * primitiveUv1PaddingScale + primitiveUv1Padding;
//             u += (side % 3) / 3;
//             v += Math.floor(side / 3) / 3;
//             uvs1.push(u, v);

//             if (i < uSegments && j < vSegments) {
//               indices.push(
//                 vcounter + vSegments + 1 + indicesStart,
//                 vcounter + 1 + indicesStart,
//                 vcounter + indicesStart,
//               );
//               indices.push(
//                 vcounter + vSegments + 1 + indicesStart,
//                 vcounter + vSegments + 2 + indicesStart,
//                 vcounter + 1 + indicesStart,
//               );
//             }

//             vcounter++;
//           }
//         }
//       };

//       generateFace(sides.FRONT, ws, hs);
//       generateFace(sides.BACK, ws, hs);
//       generateFace(sides.TOP, ws, ds);
//       generateFace(sides.BOTTOM, ws, ds);
//       generateFace(sides.RIGHT, ds, hs);
//       generateFace(sides.LEFT, ds, hs);

//       indicesStart += 24;

//       positionsAll.push(...positions);
//       normalsAll.push(...normals);
//       uvsAll.push(...uvs);
//       indicesAll.push(...indices);
//     });

//     return {
//       indices: indicesAll,
//       positions: positionsAll,
//       normals: normalsAll,
//       uvs: uvsAll,
//     };

//     // TODO: barycentric & tangent
//   }
// }
