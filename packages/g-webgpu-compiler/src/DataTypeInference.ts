import { isBoolean, isFinite } from 'lodash-es';
import {
  AST_TOKEN_TYPES,
  AST_TOKEN_TYPES as SHADER_AST_TOKEN_TYPES,
} from './ast/glsl-ast-node-types';
import { BaseNode as ShaderBaseNode, DataType } from './ast/glsl-tree';
import { AST_NODE_TYPES } from './ast/ts-ast-node-types';
import { ArrayExpression, CallExpression, Expression, MemberExpression } from './ast/ts-estree';
import { dataTypeMap } from './Transformer';
import { componentWiseFunctions, swizzling, typeCastFunctions } from './utils/builtin-functions';
import { compareDataTypePriority, getComponentDataTypeFromVector } from './utils/data-type';
import { getIdentifierFromScope } from './utils/node';

/**
 * 根据表达式进行类型推导
 * 尽管在 TS 的基础上扩充了基础数据类型 Scalar/Vector/Matrix，但我们希望用户可以尽量少的显式声明变量类型
 */
export class DataTypeInference {
  public infer(expression: Expression | null, scopeNode?: ShaderBaseNode): DataType {
    if (expression?.type === AST_NODE_TYPES.Literal) {
      if (isFinite(expression.value)) {
        // var a = 10.2; -> float a = 10.2;
        return SHADER_AST_TOKEN_TYPES.Float;
      } else if (isBoolean(expression.value)) {
        // var a = true; -> bool a = true;
        return SHADER_AST_TOKEN_TYPES.Boolean;
      }
    } else if (expression?.type === AST_NODE_TYPES.ArrayExpression) {
      return this.inferArrayExpression(expression, scopeNode);
    } else if (expression?.type === AST_NODE_TYPES.Identifier && scopeNode) {
      // 从上下文中尝试获取变量类型
      // 尝试在当前 Scope 中查找
      const existedIdentifier = getIdentifierFromScope(scopeNode, expression.name);

      if (existedIdentifier && existedIdentifier.dataType) {
        return existedIdentifier.dataType;
      }
    } else if (expression?.type === AST_NODE_TYPES.CallExpression) {
      return this.inferCallExpression(expression, scopeNode);
    } else if (
      expression?.type === AST_NODE_TYPES.BinaryExpression ||
      expression?.type === AST_NODE_TYPES.LogicalExpression
    ) {
      // let gf = 0.01 * u_K * u_Gravity * d;
      // 注意 1.2 * vec3(1.0) 生成的类型为 vec3
      return compareDataTypePriority(
        this.infer(expression.left, scopeNode),
        this.infer(expression.right, scopeNode),
      );
    } else if (expression?.type === AST_NODE_TYPES.MemberExpression) {
      return this.inferMemberExpression(expression, scopeNode);
    } else if (expression?.type === AST_NODE_TYPES.ConditionalExpression) {
      // 条件表达式推断 consequent 或者 alternate 都行
      return this.infer(expression.consequent, scopeNode);
    }

    return SHADER_AST_TOKEN_TYPES.Float;
  }

  public inferArrayExpression(expression: ArrayExpression, scopeNode?: ShaderBaseNode): DataType {
    // let a = [1, 2, 3] -> vec3 a = vec3(1.0, 2.0, 3.0);
    const elementsSize = expression.elements.length;
    if (elementsSize <= 4) {
      if (
        expression.elements.every((e) => e.type === AST_NODE_TYPES.Literal && isBoolean(e.value))
      ) {
        if (elementsSize === 1) {
          return SHADER_AST_TOKEN_TYPES.Boolean;
        } else if (elementsSize === 2) {
          return SHADER_AST_TOKEN_TYPES.Vector2Boolean;
        } else if (elementsSize === 3) {
          return SHADER_AST_TOKEN_TYPES.Vector3Boolean;
        } else if (elementsSize === 4) {
          return SHADER_AST_TOKEN_TYPES.Vector4Boolean;
        }
      } else {
        if (elementsSize === 1) {
          return SHADER_AST_TOKEN_TYPES.Float;
        } else if (elementsSize === 2) {
          return SHADER_AST_TOKEN_TYPES.Vector2Float;
        } else if (elementsSize === 3) {
          return SHADER_AST_TOKEN_TYPES.Vector3Float;
        } else if (elementsSize === 4) {
          return SHADER_AST_TOKEN_TYPES.Vector4Float;
        }
      }
    } else if (elementsSize === 9) {
      return SHADER_AST_TOKEN_TYPES.Matrix3x3Float;
    } else if (elementsSize === 16) {
      return SHADER_AST_TOKEN_TYPES.Matrix4x4Float;
    }

    return SHADER_AST_TOKEN_TYPES.Float;
  }

  public inferCallExpression(expression: CallExpression, scopeNode?: ShaderBaseNode): DataType {
    // 获取用户自定义或者 import 的函数的返回值
    if (expression.callee.type === AST_NODE_TYPES.Identifier && scopeNode) {
      const id = getIdentifierFromScope(scopeNode, expression.callee.name, true);
      if (id) {
        return id.dataType;
      }
    } else if (
      expression.callee.type === AST_NODE_TYPES.MemberExpression &&
      expression.callee.object.type === AST_NODE_TYPES.Identifier &&
      expression.callee.object.name === 'this'
    ) {
      return this.infer(expression.callee.property, scopeNode);
    }
    // while (parent !== null) {
    //   const variable = parent.variables.find(
    //     (v) =>
    //       v.type === ContextVariableType.Function &&
    //       ((expression.callee.type === AST_NODE_TYPES.Identifier &&
    //         v.name === expression.callee.name) ||
    //         (expression.callee.type === AST_NODE_TYPES.MemberExpression &&
    //           expression.callee.object.type === AST_NODE_TYPES.Identifier &&
    //           expression.callee.object.name === 'this' &&
    //           expression.callee.property.type === AST_NODE_TYPES.Identifier &&
    //           expression.callee.property.name === v.name)),
    //   );
    //   if (variable) {
    //     type = variable.typeAnnotation;
    //     break;
    //   }
    //   parent = parent.parent;
    // }

    if (expression.callee.type === AST_NODE_TYPES.Identifier) {
      if (typeCastFunctions.indexOf(expression.callee.name) > -1) {
        // const a = int(2);
        // let b = vec2(1, 1);
        return dataTypeMap[expression.callee.name];
      } else if (componentWiseFunctions.indexOf(expression.callee.name) > -1) {
        // const a = max(1, 2);
        // -> float a = max(1.0, 2.0);
        // const a = max([1, 2], [2, 1]);
        // -> vec2 a = max(vec2(1,2), vec2(2,1));
        if (expression.arguments.length) {
          // 使用第一个参数推断类型
          return this.infer(expression.arguments[0], scopeNode);
        }
      }
    }
    return SHADER_AST_TOKEN_TYPES.Float;
  }

  public inferMemberExpression(expression: MemberExpression, scopeNode?: ShaderBaseNode): DataType {
    if (expression.object.type === AST_NODE_TYPES.Identifier && expression.object.name === 'this') {
      // skip [this] eg. this.vectorA[index] -> vectorA[index]
      return this.infer(expression.property, scopeNode);
    }

    // 首先获取 vec 的类型
    const objectType = this.infer(expression.object, scopeNode);
    if (!expression.computed) {
      if (expression.property.type === AST_NODE_TYPES.Identifier) {
        // vec.rgba/xyzw/stpq
        // @see https://www.khronos.org/opengl/wiki/Data_Type_(GLSL)#Swizzling
        const propertySize = expression.property.name.length;
        if (
          propertySize <= 4 &&
          expression.property.name.split('').every((p) => swizzling.indexOf(p) > -1)
        ) {
          if (propertySize === 1) {
            // vec3.x
            return getComponentDataTypeFromVector(objectType);
          } else {
            // vec3.xxy
            if (
              objectType === AST_TOKEN_TYPES.Vector2Float ||
              objectType === AST_TOKEN_TYPES.Vector3Float ||
              objectType === AST_TOKEN_TYPES.Vector4Float
            ) {
              if (propertySize === 2) {
                return AST_TOKEN_TYPES.Vector2Float;
              } else if (propertySize === 3) {
                return AST_TOKEN_TYPES.Vector3Float;
              } else if (propertySize === 4) {
                return AST_TOKEN_TYPES.Vector4Float;
              }
            } else if (
              objectType === AST_TOKEN_TYPES.Vector2Int ||
              objectType === AST_TOKEN_TYPES.Vector3Int ||
              objectType === AST_TOKEN_TYPES.Vector4Int
            ) {
              if (propertySize === 2) {
                return AST_TOKEN_TYPES.Vector2Int;
              } else if (propertySize === 3) {
                return AST_TOKEN_TYPES.Vector3Int;
              } else if (propertySize === 4) {
                return AST_TOKEN_TYPES.Vector4Int;
              }
            } else if (
              objectType === AST_TOKEN_TYPES.Vector2Uint ||
              objectType === AST_TOKEN_TYPES.Vector3Uint ||
              objectType === AST_TOKEN_TYPES.Vector4Uint
            ) {
              if (propertySize === 2) {
                return AST_TOKEN_TYPES.Vector2Uint;
              } else if (propertySize === 3) {
                return AST_TOKEN_TYPES.Vector3Uint;
              } else if (propertySize === 4) {
                return AST_TOKEN_TYPES.Vector4Uint;
              }
            } else if (
              objectType === AST_TOKEN_TYPES.Vector2Boolean ||
              objectType === AST_TOKEN_TYPES.Vector3Boolean ||
              objectType === AST_TOKEN_TYPES.Vector4Boolean
            ) {
              if (propertySize === 2) {
                return AST_TOKEN_TYPES.Vector2Boolean;
              } else if (propertySize === 3) {
                return AST_TOKEN_TYPES.Vector3Boolean;
              } else if (propertySize === 4) {
                return AST_TOKEN_TYPES.Vector4Boolean;
              }
            }
            // TODO: 暂不支持 uint WebGL 1 使用 GLSL 100
          }
        }
      }
    } else {
      // console.log(objectType, expression);
      // vec3[0]
      // if (
      //   expression.property.type === AST_NODE_TYPES.Literal &&
      //   isFinite(Number(expression.property.value))
      // ) {
      //   return getComponentDataTypeFromVector(objectType);
      // }
      // // vectorA[threadId + 2]
      // else if (expression.object.type === AST_NODE_TYPES.Identifier) {
      return getComponentDataTypeFromVector(objectType);
      // }
    }

    return SHADER_AST_TOKEN_TYPES.Float;
  }
}
