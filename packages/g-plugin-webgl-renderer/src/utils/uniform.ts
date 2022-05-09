// import { isTypedArray } from './is-typedarray';
// import { IUniform } from '../services/renderer';

// /**
//  * 考虑结构体命名, eg:
//  * a: { b: 1 }  ->  'a.b'
//  * a: [ { b: 1 } ] -> 'a[0].b'
//  */
// export function extractUniforms(uniforms: { [key: string]: IUniform }): {
//   [key: string]: IUniform;
// } {
//   const extractedUniforms = {};
//   Object.keys(uniforms).forEach((uniformName) => {
//     extractUniformsRecursively(uniformName, uniforms[uniformName], extractedUniforms, '');
//   });

//   return extractedUniforms;
// }

// function extractUniformsRecursively(
//   uniformName: string,
//   uniformValue: IUniform,
//   uniforms: {
//     [key: string]: IUniform;
//   },
//   prefix: string
// ) {
//   if (
//     uniformValue === null ||
//     typeof uniformValue === 'number' || // u_A: 1
//     typeof uniformValue === 'boolean' || // u_A: false
//     (Array.isArray(uniformValue) && typeof uniformValue[0] === 'number') || // u_A: [1, 2, 3]
//     isTypedArray(uniformValue) || // u_A: Float32Array
//     // @ts-ignore
//     uniformValue === '' ||
//     // @ts-ignore
//     uniformValue.resize !== undefined
//   ) {
//     uniforms[`${prefix && prefix + '.'}${uniformName}`] = uniformValue;
//     return;
//   }

//   // u_Struct.a.b.c
//   if (isPlainObject(uniformValue)) {
//     Object.keys(uniformValue).forEach((childName) => {
//       extractUniformsRecursively(
//         childName,
//         // @ts-ignore
//         uniformValue[childName],
//         uniforms,
//         `${prefix && prefix + '.'}${uniformName}`
//       );
//     });
//   }

//   // u_Struct[0].a
//   if (Array.isArray(uniformValue)) {
//     // @ts-ignore
//     uniformValue.forEach((child, idx) => {
//       Object.keys(child).forEach((childName) => {
//         extractUniformsRecursively(
//           childName,
//           // @ts-ignore
//           child[childName],
//           uniforms,
//           `${prefix && prefix + '.'}${uniformName}[${idx}]`
//         );
//       });
//     });
//   }
// }
