// import { vec3 } from 'gl-matrix';
// import { singleton } from 'mana-syringe';
// import { GeometryAABBUpdater, AABB } from '@antv/g';
// import { ParsedCubeStyleProps } from '../Cube';
// import { Shape_3D } from '../types';

// @singleton({ token: { token: GeometryAABBUpdater, named: Shape_3D.Cube } })
// export class CubeUpdater implements GeometryAABBUpdater<ParsedCubeStyleProps> {
//   dependencies = ['height', 'width', 'depth', 'anchor'];

//   // @ts-ignore
//   update(attributes: ParsedCubeStyleProps) {
//     const { height = 0, width = 0, depth = 0 } = attributes;

//     return {
//       width,
//       height,
//       depth,
//     };
//   }
// }
