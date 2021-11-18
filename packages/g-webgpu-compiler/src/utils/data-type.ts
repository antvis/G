import { AST_NODE_TYPES, AST_TOKEN_TYPES } from '../ast/glsl-ast-node-types';
import {
  ArrayExpression,
  BaseNode as ShaderBaseNode,
  BlockStatement,
  CallExpression as ShaderCallExpression,
  DataType,
  Expression as ShaderExpression,
  ExpressionStatement,
  ForStatement as ShaderForStatement,
  FunctionDeclaration as ShaderFunctionDeclaration,
  Identifier as ShaderIdentifier,
  IfStatement as ShaderIfStatement,
  Program as ShaderProgram,
  ReturnStatement as ShaderReturnStatement,
  Scope,
  Statement as ShaderStatement,
  UpdateExpression as ShaderUpdateExpression,
  VariableDeclaration as ShaderVariableDeclaration,
  VariableDeclarator as ShaderVariableDeclarator,
} from '../ast/glsl-tree';
import { traverseUpwards } from './node';

export function isLeft(node: ShaderBaseNode): boolean {
  return !!traverseUpwards<boolean>(node, (currentNode) => {
    return (
      // @ts-ignore
      (currentNode.type === AST_NODE_TYPES.BinaryExpression ||
        // @ts-ignore
        currentNode.type === AST_NODE_TYPES.AssignmentExpression) &&
      // @ts-ignore
      currentNode.left === node
    );
  });
}

export function isScalar(dt: DataType): boolean {
  if (
    dt === AST_TOKEN_TYPES.Boolean ||
    dt === AST_TOKEN_TYPES.Int32 ||
    dt === AST_TOKEN_TYPES.Uint32 ||
    dt === AST_TOKEN_TYPES.Float
  ) {
    return true;
  }
  return false;
}

export function isVector(dt: DataType): boolean {
  if (
    dt === AST_TOKEN_TYPES.Vector2Float ||
    dt === AST_TOKEN_TYPES.Vector3Float ||
    dt === AST_TOKEN_TYPES.Vector4Float ||
    dt === AST_TOKEN_TYPES.Vector2Boolean ||
    dt === AST_TOKEN_TYPES.Vector3Boolean ||
    dt === AST_TOKEN_TYPES.Vector4Boolean ||
    dt === AST_TOKEN_TYPES.Vector2Uint ||
    dt === AST_TOKEN_TYPES.Vector3Uint ||
    dt === AST_TOKEN_TYPES.Vector4Uint ||
    dt === AST_TOKEN_TYPES.Vector2Int ||
    dt === AST_TOKEN_TYPES.Vector3Int ||
    dt === AST_TOKEN_TYPES.Vector4Int
  ) {
    return true;
  }
  return false;
}

export function isMatrix(dt: DataType): boolean {
  if (dt === AST_TOKEN_TYPES.Matrix3x3Float || dt === AST_TOKEN_TYPES.Matrix4x4Float) {
    return true;
  }
  return false;
}

export function isArray(dt: DataType): boolean {
  if (dt === AST_TOKEN_TYPES.FloatArray || dt === AST_TOKEN_TYPES.Vector4FloatArray) {
    return true;
  }
  return false;
}

export function getComponentSize(dt: DataType): number {
  if (
    dt === AST_TOKEN_TYPES.Vector2Boolean ||
    dt === AST_TOKEN_TYPES.Vector2Float ||
    dt === AST_TOKEN_TYPES.Vector2Int ||
    dt === AST_TOKEN_TYPES.Vector2Uint
  ) {
    return 2;
  } else if (
    dt === AST_TOKEN_TYPES.Vector3Boolean ||
    dt === AST_TOKEN_TYPES.Vector3Float ||
    dt === AST_TOKEN_TYPES.Vector3Int ||
    dt === AST_TOKEN_TYPES.Vector3Uint
  ) {
    return 3;
  } else if (
    dt === AST_TOKEN_TYPES.Vector4Boolean ||
    dt === AST_TOKEN_TYPES.Vector4Float ||
    dt === AST_TOKEN_TYPES.Vector4Int ||
    dt === AST_TOKEN_TYPES.Vector4Uint
  ) {
    return 4;
  }
  return 1;
}

export function getByteCount(dt: DataType): number {
  if (dt === AST_TOKEN_TYPES.Vector2Boolean) {
    return 2;
  } else if (dt === AST_TOKEN_TYPES.Vector3Boolean) {
    return 3;
  } else if (dt === AST_TOKEN_TYPES.Vector4Boolean) {
    return 4;
  } else if (
    dt === AST_TOKEN_TYPES.Float ||
    dt === AST_TOKEN_TYPES.Int32 ||
    dt === AST_TOKEN_TYPES.Uint32
  ) {
    return 4;
  } else if (
    dt === AST_TOKEN_TYPES.Vector2Float ||
    dt === AST_TOKEN_TYPES.Vector2Int ||
    dt === AST_TOKEN_TYPES.Vector2Uint
  ) {
    return 8;
  } else if (
    dt === AST_TOKEN_TYPES.Vector3Float ||
    dt === AST_TOKEN_TYPES.Vector3Int ||
    dt === AST_TOKEN_TYPES.Vector3Uint
  ) {
    return 12;
  } else if (
    dt === AST_TOKEN_TYPES.Vector4Float ||
    dt === AST_TOKEN_TYPES.Vector4Int ||
    dt === AST_TOKEN_TYPES.Vector4Uint
  ) {
    return 16;
  } else if (dt === AST_TOKEN_TYPES.Matrix3x3Float) {
    return 36;
  } else if (dt === AST_TOKEN_TYPES.Matrix4x4Float) {
    return 64;
  }
  return 1;
}

/**
 * 从向量/矩阵数据类型中获取每个分量的数据类型
 * eg. vec2 -> float
 *     ivec2 -> int
 *     bvec4 -> bool
 *     mat3 -> float
 * vec4[] -> vec4
 * @param dt 向量类型
 */
export function getComponentDataTypeFromVector(dt: DataType): DataType {
  if (
    dt === AST_TOKEN_TYPES.Vector2Boolean ||
    dt === AST_TOKEN_TYPES.Vector3Boolean ||
    dt === AST_TOKEN_TYPES.Vector4Boolean
  ) {
    return AST_TOKEN_TYPES.Boolean;
  } else if (
    dt === AST_TOKEN_TYPES.Vector2Float ||
    dt === AST_TOKEN_TYPES.Vector3Float ||
    dt === AST_TOKEN_TYPES.Vector4Float ||
    dt === AST_TOKEN_TYPES.FloatArray ||
    dt === AST_TOKEN_TYPES.Matrix3x3Float ||
    dt === AST_TOKEN_TYPES.Matrix4x4Float
  ) {
    return AST_TOKEN_TYPES.Float;
  } else if (
    dt === AST_TOKEN_TYPES.Vector2Int ||
    dt === AST_TOKEN_TYPES.Vector3Int ||
    dt === AST_TOKEN_TYPES.Vector4Int
  ) {
    return AST_TOKEN_TYPES.Int32;
  } else if (
    dt === AST_TOKEN_TYPES.Vector2Uint ||
    dt === AST_TOKEN_TYPES.Vector3Uint ||
    dt === AST_TOKEN_TYPES.Vector4Uint
  ) {
    return AST_TOKEN_TYPES.Uint32;
  } else if (dt === AST_TOKEN_TYPES.Vector4FloatArray) {
    return AST_TOKEN_TYPES.Vector4Float;
  }
  return dt;
}

export const typePriority: Record<DataType, number> = {
  [AST_TOKEN_TYPES.Void]: 0,
  [AST_TOKEN_TYPES.Float]: 1,
  [AST_TOKEN_TYPES.Int32]: 2,
  [AST_TOKEN_TYPES.Uint32]: 3,
  [AST_TOKEN_TYPES.Boolean]: 4,
  [AST_TOKEN_TYPES.Vector2Float]: 100,
  [AST_TOKEN_TYPES.Vector3Float]: 101,
  [AST_TOKEN_TYPES.Vector4Float]: 102,
  [AST_TOKEN_TYPES.Vector2Int]: 200,
  [AST_TOKEN_TYPES.Vector3Int]: 201,
  [AST_TOKEN_TYPES.Vector4Int]: 202,
  [AST_TOKEN_TYPES.Vector2Uint]: 300,
  [AST_TOKEN_TYPES.Vector3Uint]: 301,
  [AST_TOKEN_TYPES.Vector4Uint]: 302,
  [AST_TOKEN_TYPES.Vector2Boolean]: 400,
  [AST_TOKEN_TYPES.Vector3Boolean]: 401,
  [AST_TOKEN_TYPES.Vector4Boolean]: 402,
  [AST_TOKEN_TYPES.Matrix3x3Float]: 1000,
  [AST_TOKEN_TYPES.Matrix4x4Float]: 1001,
  [AST_TOKEN_TYPES.FloatArray]: 2000,
  [AST_TOKEN_TYPES.Vector4FloatArray]: 2001,
};
/**
 * 用于强制类型转换
 * eg. float + int -> int(float) + int
 *     float + vec3 -> vec3(float) + vec3
 * @param type1 dt1
 * @param type2 dt2
 */
export function compareDataTypePriority(type1: DataType, type2: DataType): DataType {
  if (typePriority[type1] && typePriority[type2]) {
    if (typePriority[type1] > typePriority[type2]) {
      return type1;
    } else {
      return type2;
    }
  }
  return type1;
}
