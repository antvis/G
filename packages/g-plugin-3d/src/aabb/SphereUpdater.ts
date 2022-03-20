// import { vec3 } from 'gl-matrix';
// import { singleton } from 'mana-syringe';
// import { GeometryAABBUpdater, AABB } from '@antv/g';
// import { SphereStyleProps } from '../Sphere';
// import { Shape_3D } from '../types';

// @singleton({ token: { token: GeometryAABBUpdater, named: Shape_3D.Sphere } })
// // @ts-ignore
// export class SphereUpdater implements GeometryAABBUpdater<SphereStyleProps> {
//   dependencies = ['height', 'width', 'depth', 'anchor'];

//   // @ts-ignore
//   update(attributes: SphereStyleProps, aabb: AABB) {
//     const { height = 0, width = 0, depth = 0 } = attributes;

//     return {
//       width,
//       height,
//       depth,
//     };
//   }
// }
