// import { vec3 } from 'gl-matrix';
// import { singleton } from 'mana-syringe';
// import { GeometryAABBUpdater, AABB } from '@antv/g';
// import { GridStyleProps } from '../Grid';
// import { SHAPE_3D } from '../types';

// @singleton({ token: { token: GeometryAABBUpdater, named: SHAPE_3D.Grid } })
// // @ts-ignore
// export class GridUpdater implements GeometryAABBUpdater<GridStyleProps> {
//   dependencies = ['width', 'height', 'anchor'];

//   // @ts-ignore
//   update(attributes: GridStyleProps, aabb: AABB) {
//     const { width = 0, height = 0 } = attributes;

//     return {
//       width,
//       height,
//     };
//   }
// }
