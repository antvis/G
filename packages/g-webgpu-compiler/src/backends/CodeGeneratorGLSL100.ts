import { AST_NODE_TYPES, AST_TOKEN_TYPES, STORAGE_CLASS } from '../ast/glsl-ast-node-types';
import {
  ArrayExpression,
  AssignmentExpression,
  BaseNode,
  BinaryExpression,
  BlockStatement,
  CallExpression,
  ConditionalExpression,
  DataType,
  DoWhileStatement,
  Expression,
  ExpressionStatement,
  ForStatement,
  FunctionDeclaration,
  FunctionExpression,
  Identifier,
  IfStatement,
  MemberExpression,
  Program,
  ReturnStatement,
  Scalar,
  Scope,
  Statement,
  UnaryExpression,
  UpdateExpression,
  VariableDeclaration,
  VariableDeclarator,
  WhileStatement,
} from '../ast/glsl-tree';
import { DefineValuePlaceholder, GLSLContext } from '../Compiler';
import {
  builtinFunctions,
  componentWiseFunctions,
  importFunctions,
} from '../utils/builtin-functions';
import {
  compareDataTypePriority,
  getComponentDataTypeFromVector,
  getComponentSize,
  isArray,
  isLeft,
  isMatrix,
  isScalar,
  isVector,
} from '../utils/data-type';
import { getIdentifierFromScope, traverseUpwards } from '../utils/node';
import { ICodeGenerator, Target } from './ICodeGenerator';

const dataTypeMap: Record<DataType, string> = {
  [AST_TOKEN_TYPES.Void]: 'void',
  [AST_TOKEN_TYPES.Boolean]: 'bool',
  [AST_TOKEN_TYPES.Int32]: 'int',
  [AST_TOKEN_TYPES.Uint32]: 'uint',
  [AST_TOKEN_TYPES.Float]: 'float',
  [AST_TOKEN_TYPES.Vector2Float]: 'vec2',
  [AST_TOKEN_TYPES.Vector3Float]: 'vec3',
  [AST_TOKEN_TYPES.Vector4Float]: 'vec4',
  [AST_TOKEN_TYPES.Vector2Int]: 'ivec2',
  [AST_TOKEN_TYPES.Vector3Int]: 'ivec3',
  [AST_TOKEN_TYPES.Vector4Int]: 'ivec4',
  [AST_TOKEN_TYPES.Vector2Uint]: 'uvec2',
  [AST_TOKEN_TYPES.Vector3Uint]: 'uvec3',
  [AST_TOKEN_TYPES.Vector4Uint]: 'uvec4',
  [AST_TOKEN_TYPES.Vector2Boolean]: 'bvec2',
  [AST_TOKEN_TYPES.Vector3Boolean]: 'bvec3',
  [AST_TOKEN_TYPES.Vector4Boolean]: 'bvec4',
  [AST_TOKEN_TYPES.Matrix3x3Float]: 'mat3',
  [AST_TOKEN_TYPES.Matrix4x4Float]: 'mat4',
  [AST_TOKEN_TYPES.FloatArray]: 'sampler2D',
  [AST_TOKEN_TYPES.Vector4FloatArray]: 'sampler2D',
};

export class CodeGeneratorGLSL100 implements ICodeGenerator {
  private context: GLSLContext;

  public clear() {
    //
  }

  public generate(program: Program, context?: GLSLContext): string {
    if (context) {
      this.context = context;
    }

    const body = program.body.map((stmt) => this.generateStatement(stmt)).join('\n');
    return `
${importFunctions[Target.GLSL100]}

uniform vec2 u_OutputTextureSize;
uniform int u_OutputTexelCount;
varying vec2 v_TexCoord;

bool gWebGPUDebug = false;
vec4 gWebGPUDebugOutput = vec4(0.0);

${body}
`;
  }

  public generateStatement(stmt: Statement): string {
    if (stmt.type === AST_NODE_TYPES.VariableDeclaration) {
      return this.generateVariableDeclaration(stmt);
    } else if (stmt.type === AST_NODE_TYPES.FunctionDeclaration) {
      return this.generateFunctionExpression(stmt);
    } else if (stmt.type === AST_NODE_TYPES.BlockStatement) {
      return this.generateBlockStatement(stmt);
    } else if (stmt.type === AST_NODE_TYPES.ImportedFunctionStatement) {
      return stmt.content;
    } else {
      // tslint:disable-next-line:no-console
      console.warn(`[GLSL100 compiler]: unknown statement: ${stmt.type}`);
    }
    return '';
  }

  public generateVariableDeclaration(stmt: VariableDeclaration): string {
    return stmt.declarations
      .map((declarator) => {
        if (declarator.storageClass === STORAGE_CLASS.UniformConstant) {
          const define = this.context?.defines.find((d) => d.name === declarator.id.name);
          const placeHolder = `${DefineValuePlaceholder}${define?.name}`;
          // #define CONST 10
          return `#define ${declarator.id.name} ${
            define?.runtime ? placeHolder : this.generateExpression(declarator.init)
          }`;
        } else if (
          declarator.storageClass === STORAGE_CLASS.Uniform ||
          declarator.storageClass === STORAGE_CLASS.StorageBuffer
        ) {
          const name = declarator.id.name;
          const componentDataType = getComponentDataTypeFromVector(declarator.id.dataType);
          const componentDataTypeStr = this.generateDataType(componentDataType);
          const dataType = this.generateDataType(declarator.id.dataType);

          if (isArray(declarator.id.dataType)) {
            // uniform float a;
            // uniform sampler2D b;
            // 额外生成读取纹理 Getter
            return `uniform ${dataType} ${name};
uniform vec2 ${name}Size;
${componentDataTypeStr} getData${name}(vec2 address2D) {
  return ${componentDataTypeStr}(texture2D(${name}, address2D)${this.generateSwizzling(
              componentDataType,
            )});
}
${componentDataTypeStr} getData${name}(float address1D) {
  return getData${name}(addrTranslation_1Dto2D(address1D, ${name}Size));
}
${componentDataTypeStr} getData${name}(int address1D) {
  return getData${name}(float(address1D));
}`;
          } else {
            return `uniform ${dataType} ${name};`;
          }
        } else if (declarator.storageClass === STORAGE_CLASS.Private) {
          if (declarator.init) {
            // float a = 1.0;
            // float b = vec3(1.0);
            return `${this.generateDataType(declarator.id.dataType)} ${
              declarator.id.name
            } = ${this.generateExpression(declarator.init, declarator.id.dataType)};`;
          } else {
            // float a;
            // Root Scope 中不允许声明变量但不赋值
            if (stmt.parent && (stmt.parent as Program).type === AST_NODE_TYPES.Program) {
              return '';
            }
            return `${this.generateDataType(declarator.id.dataType)} ${declarator.id.name};`;
          }
        }
        return '';
      })
      .join('\n');
  }

  public generateBlockStatement(stmt: BlockStatement): string {
    return stmt.body
      .map((s) => {
        if (s.type === AST_NODE_TYPES.VariableDeclaration) {
          return this.generateVariableDeclaration(s);
        } else if (s.type === AST_NODE_TYPES.ExpressionStatement) {
          return this.generateExpression(s.expression) + ';';
        } else if (s.type === AST_NODE_TYPES.ReturnStatement) {
          return this.generateReturnStatement(s);
        } else if (s.type === AST_NODE_TYPES.IfStatement) {
          return this.generateIfStatement(s);
        } else if (s.type === AST_NODE_TYPES.ForStatement) {
          return this.generateForStatement(s);
        } else if (s.type === AST_NODE_TYPES.BreakStatement) {
          return 'break;';
        } else if (s.type === AST_NODE_TYPES.ContinueStatement) {
          return 'continue;';
        } else if (s.type === AST_NODE_TYPES.WhileStatement) {
          return this.generateWhileStatement(s);
        } else if (s.type === AST_NODE_TYPES.DoWhileStatement) {
          return this.generateDoWhileStatement(s);
        } else {
          // tslint:disable-next-line:no-console
          console.warn(`[GLSL100 compiler]: unknown statement: ${stmt}`);
        }
        return '';
      })
      .join('\n');
  }

  public generateReturnStatement(stmt: ReturnStatement): string {
    // 必须匹配函数返回值类型，需要向上查找最近的的 FunctionDeclaration
    const returnType = traverseUpwards<DataType>(stmt, (currentNode) => {
      if (
        (currentNode as FunctionDeclaration).type === AST_NODE_TYPES.FunctionDeclaration &&
        (currentNode as FunctionDeclaration).returnType
      ) {
        return (currentNode as FunctionDeclaration).returnType;
      }
    });
    return `return ${(stmt.argument && this.generateExpression(stmt.argument, returnType)) || ''};`;
  }

  public generateWhileStatement(stmt: WhileStatement): string {
    return `while(${this.generateExpression(stmt.test)}) {
${this.generateStatement(stmt.body)}
}`;
  }

  public generateDoWhileStatement(stmt: DoWhileStatement): string {
    return `do {
${this.generateStatement(stmt.body)}
} while(${this.generateExpression(stmt.test)});`;
  }

  public generateForStatement(node: ForStatement): string {
    let init = '';
    if (node.init?.type === AST_NODE_TYPES.VariableDeclaration) {
      // 修改 init 类型例如 int i = 0;
      node.init.declarations.forEach((d) => {
        d.id.dataType = AST_TOKEN_TYPES.Int32;
      });
      init = this.generateVariableDeclaration(node.init);
    } else if (node.init?.type === AST_NODE_TYPES.AssignmentExpression) {
      init = this.generateExpression(node.init);
    }
    return `for (${init} ${node.test && this.generateExpression(node.test)}; ${
      node.update && this.generateExpression(node.update)
    }) {${this.generateBlockStatement(node.body as BlockStatement)}}`;
  }

  public generateIfStatement(node: IfStatement): string {
    let consequent = '';
    if (node.consequent.type === AST_NODE_TYPES.ExpressionStatement) {
      consequent = this.generateExpression(node.consequent.expression);
    } else if (node.consequent.type === AST_NODE_TYPES.BlockStatement) {
      consequent = this.generateBlockStatement(node.consequent);
    } else if (node.consequent.type === AST_NODE_TYPES.ReturnStatement) {
      consequent = this.generateReturnStatement(node.consequent);
    } else if (node.consequent.type === AST_NODE_TYPES.BreakStatement) {
      consequent = 'break;';
    }

    let alternate = '';
    if (node.alternate) {
      if (node.alternate.type === AST_NODE_TYPES.ExpressionStatement) {
        alternate = this.generateExpression(node.alternate.expression);
      } else if (node.alternate.type === AST_NODE_TYPES.BlockStatement) {
        alternate = this.generateBlockStatement(node.alternate);
      } else if (node.alternate.type === AST_NODE_TYPES.ReturnStatement) {
        alternate = this.generateReturnStatement(node.alternate);
      } else if (node.alternate.type === AST_NODE_TYPES.BreakStatement) {
        alternate = 'break;';
      }
    }

    return `if (${this.generateExpression(node.test)}) {${consequent}}${
      alternate ? `else {${alternate}}` : ''
    }`;
  }

  public generateFunctionExpression(stmt: FunctionDeclaration | FunctionExpression): string {
    if (stmt.body) {
      let prepend = '';
      let append = '';
      if (this.context) {
        // 不能在全局作用域定义
        // @see https://community.khronos.org/t/gles-compile-errors-under-marshmallow/74876
        const [localSizeX, localSizeY, localSizeZ] = this.context.threadGroupSize;
        const [groupX, groupY, groupZ] = this.context.dispatch;
        // TODO: 按需添加使用到的内置变量
        prepend = `
ivec3 workGroupSize = ivec3(${localSizeX}, ${localSizeY}, ${localSizeZ});
ivec3 numWorkGroups = ivec3(${groupX}, ${groupY}, ${groupZ});     
int globalInvocationIndex = int(floor(v_TexCoord.x * u_OutputTextureSize.x))
  + int(floor(v_TexCoord.y * u_OutputTextureSize.y)) * int(u_OutputTextureSize.x);
int workGroupIDLength = globalInvocationIndex / (workGroupSize.x * workGroupSize.y * workGroupSize.z);
ivec3 workGroupID = ivec3(workGroupIDLength / numWorkGroups.y / numWorkGroups.z, workGroupIDLength / numWorkGroups.x / numWorkGroups.z, workGroupIDLength / numWorkGroups.x / numWorkGroups.y);
int localInvocationIDZ = globalInvocationIndex / (workGroupSize.x * workGroupSize.y);
int localInvocationIDY = (globalInvocationIndex - localInvocationIDZ * workGroupSize.x * workGroupSize.y) / workGroupSize.x;
int localInvocationIDX = globalInvocationIndex - localInvocationIDZ * workGroupSize.x * workGroupSize.y - localInvocationIDY * workGroupSize.x;
ivec3 localInvocationID = ivec3(localInvocationIDX, localInvocationIDY, localInvocationIDZ);
ivec3 globalInvocationID = workGroupID * workGroupSize + localInvocationID;
int localInvocationIndex = localInvocationID.z * workGroupSize.x * workGroupSize.y
                + localInvocationID.y * workGroupSize.x + localInvocationID.x;
`;
      }

      if (stmt.id?.name === 'main') {
        append = `if (gWebGPUDebug) {
  gbuf_color = gWebGPUDebugOutput;
}`;
      }

      return `${this.generateDataType(stmt.returnType || AST_TOKEN_TYPES.Void)} ${stmt.id?.name}(${(
        stmt.params || []
      )
        .map(
          (p) =>
            p.type === AST_NODE_TYPES.Identifier &&
            `${this.generateDataType(p.dataType)} ${p.name}`,
        )
        .join(', ')}) {${prepend}${this.generateBlockStatement(stmt.body)}${append}}`;
    }
    return '';
  }

  public generateExpression(expression: Expression | null, dataType?: DataType): string {
    // @ts-ignore
    if (isScalar(expression?.type)) {
      return this.generateScalar(
        // @ts-ignore
        dataType || expression?.type,
        // @ts-ignore
        expression.value,
      );
      // @ts-ignore
    } else if (isVector(expression?.type)) {
      // @ts-ignore
      return this.generateVector(
        // @ts-ignore
        dataType || expression?.type,
        // @ts-ignore
        expression.value,
      );
      // @ts-ignore
    } else if (isMatrix(expression?.type)) {
      return this.generateMatrix(
        // @ts-ignore
        dataType || expression?.type,
        // @ts-ignore
        expression.value,
      );
    } else if (expression?.type === AST_NODE_TYPES.ArrayExpression) {
      return this.generateArrayExpression(expression, dataType);
    } else if (expression?.type === AST_NODE_TYPES.Identifier) {
      return this.castingDataType(dataType, expression.dataType, expression.name);
    } else if (expression?.type === AST_NODE_TYPES.BinaryExpression) {
      return this.generateBinaryExpression(expression, dataType);
    } else if (expression?.type === AST_NODE_TYPES.CallExpression) {
      return this.generateCallExpression(expression, dataType);
    } else if (expression?.type === AST_NODE_TYPES.AssignmentExpression) {
      return this.generateAssignmentExpression(expression, dataType);
    } else if (expression?.type === AST_NODE_TYPES.UpdateExpression) {
      return this.generateUpdateExpression(expression);
    } else if (expression?.type === AST_NODE_TYPES.MemberExpression) {
      return this.generateMemberExpression(expression);
    } else if (expression?.type === AST_NODE_TYPES.ConditionalExpression) {
      return this.generateConditionalExpression(expression);
    } else if (expression?.type === AST_NODE_TYPES.UnaryExpression) {
      return this.generateUnaryExpression(expression, dataType);
    } else {
      // tslint:disable-next-line:no-console
      console.warn(`[GLSL100 compiler]: unknown expression: ${expression}`, dataType);
    }
    return '';
  }

  public generateUnaryExpression(expression: UnaryExpression, dataType?: DataType): string {
    return `${expression.operator}${this.generateExpression(expression.argument, dataType)}`;
  }

  public generateConditionalExpression(expression: ConditionalExpression): string {
    // 条件判断也应该丢弃掉之前推断的类型
    return `(${this.generateExpression(expression.test)}) ? (${this.generateExpression(
      expression.consequent,
    )}) : (${this.generateExpression(expression.alternate)})`;
  }

  public generateMemberExpression(expression: MemberExpression): string {
    if (expression.object.type === AST_NODE_TYPES.Identifier) {
      // const a = this.sum(1, 2);
      // vectorA[threadId]
      const objectName = expression.object.name;
      const isLeftSide = isLeft(expression);
      const id = getIdentifierFromScope(expression, objectName);

      if (id && isArray(id.dataType)) {
        if (isLeftSide) {
          return 'gbuf_color';
        } else {
          return this.generateExpression({
            type: AST_NODE_TYPES.CallExpression,
            callee: {
              type: AST_NODE_TYPES.Identifier,
              name: `getData${objectName}`,
              dataType: AST_TOKEN_TYPES.Vector4Float,
            },
            arguments: [expression.property],
          });
        }
      }
    }

    if (expression.property.type === AST_NODE_TYPES.Identifier) {
      if (!expression.computed) {
        // swizzling & struct uniform eg. params.u_k / vec.rgba
        return `${(expression.object as Identifier).name}.${
          (expression.property as Identifier).name
        }`;
      } else {
        return `${(expression.object as Identifier).name}[${
          (expression.property as Identifier).name
        }]`;
      }
    } else if (
      (expression.property.type === AST_TOKEN_TYPES.Float ||
        expression.property.type === AST_TOKEN_TYPES.Int32 ||
        expression.property.type === AST_TOKEN_TYPES.Uint32) &&
      isFinite(Number(expression.property.value))
    ) {
      const index = Number(expression.property.value);
      let swizzlingComponent = 'x';
      switch (index) {
        case 0:
          swizzlingComponent = 'x';
          break;
        case 1:
          swizzlingComponent = 'y';
          break;
        case 2:
          swizzlingComponent = 'z';
          break;
        case 3:
          swizzlingComponent = 'w';
          break;
      }
      // vec[0]
      // 考虑 getData()[0] 的情况，转译成 getData().x
      return `${(expression.object as Identifier).name}.${swizzlingComponent}`;
    } else {
      // data[a + b]
      return `${(expression.object as Identifier).name}[${this.generateExpression(
        expression.property,
      )}]`;
    }
  }

  public generateUpdateExpression(expression: UpdateExpression): string {
    // i++ ++i
    return expression.prefix
      ? `${expression.operator}${(expression.argument as Identifier).name}`
      : `${(expression.argument as Identifier).name}${expression.operator}`;
  }

  public generateAssignmentExpression(
    expression: AssignmentExpression,
    dataType?: DataType,
  ): string {
    const left = this.generateExpression(expression.left, dataType);
    let castVec4 = false;
    if (left === 'gbuf_color') {
      // gbuf_color = vec4();
      // dt = AST_TOKEN_TYPES.Vector4Float;
      castVec4 = true;
    }
    // TODO: 更优雅的方式进行类型转换
    return `${left} ${expression.operator} ${castVec4 ? 'vec4(' : ''}${this.generateExpression(
      expression.right,
      dataType,
    )}${castVec4 ? ')' : ''}`;
  }

  public generateArrayExpression(expression: ArrayExpression, dataType?: DataType): string {
    const dt = expression.dataType || dataType || AST_TOKEN_TYPES.Vector4Float;
    // vec3(1.0, 2.0, 3.0)
    return `${this.generateDataType(dt)}(${expression.elements
      .map((e) => this.generateExpression(e, getComponentDataTypeFromVector(dt)))
      .join(', ')})`;
  }

  public generateBinaryExpression(expression: BinaryExpression, dataType?: DataType): string {
    const needBracket =
      // @ts-ignore
      expression.parent?.type === AST_NODE_TYPES.BinaryExpression;
    return `${needBracket ? '(' : ''}${this.generateExpression(expression.left, dataType)} ${
      expression.operator
    } ${this.generateExpression(expression.right, dataType)}${needBracket ? ')' : ''}`;
  }

  // TODO: 替换 Math.sin() -> sin()
  public generateCallExpression(expression: CallExpression, dataType?: DataType): string {
    const isComponentWise =
      expression.callee.type === AST_NODE_TYPES.Identifier &&
      componentWiseFunctions.indexOf(expression.callee.name) > -1;
    let params: Identifier[] = [];

    if (expression.callee.type === AST_NODE_TYPES.Identifier) {
      // 获取函数声明时的参数类型
      const functionId = getIdentifierFromScope(expression, expression.callee.name, true);
      if (
        functionId &&
        functionId.parent &&
        (functionId.parent as FunctionDeclaration).type === AST_NODE_TYPES.FunctionDeclaration
      ) {
        params = (functionId.parent as FunctionDeclaration).params;
      }
    }
    return `${this.generateExpression(expression.callee)}(${expression.arguments
      .map((e, i) => {
        // if (e.type === AST_NODE_TYPES.CallExpression) {
        //   // int(floor(v.x + 0.5))
        //   // 考虑函数嵌套的情况，需要丢弃掉外层推断的类型
        //   return this.generateExpression(e);
        // }
        return this.generateExpression(
          e,
          isComponentWise ? dataType : params[i] && params[i].dataType,
        );
      })
      .join(', ')})`;
  }

  public generateDataType(dt: DataType): string {
    return dataTypeMap[dt];
  }

  public generateScalar(dt: DataType, scalar: number | boolean): string {
    if (dt === AST_TOKEN_TYPES.Boolean) {
      return `${!!scalar}`;
    } else if (dt === AST_TOKEN_TYPES.Float) {
      return this.wrapFloat(`${Number(scalar)}`);
    } else if (dt === AST_TOKEN_TYPES.Int32 || dt === AST_TOKEN_TYPES.Uint32) {
      return parseInt(`${Number(scalar)}`, 10).toString();
    }
    return `${scalar}`;
  }

  public generateVector(dt: DataType, vector: number | boolean): string {
    const componentDataType = getComponentDataTypeFromVector(dt);
    return this.castingDataType(
      dt,
      componentDataType,
      this.generateScalar(componentDataType, vector),
    );
  }

  public generateMatrix(dt: DataType, vector: number | boolean): string {
    const componentDataType = getComponentDataTypeFromVector(dt);
    return this.castingDataType(
      dt,
      componentDataType,
      this.generateScalar(componentDataType, vector),
    );
  }

  private wrapFloat(float: string): string {
    return float.indexOf('.') === -1 ? `${float}.0` : float;
  }

  private castingDataType(dt1: DataType | undefined, dt2: DataType, content: string): string {
    // 需要强制类型转换
    if (dt1 && dt1 !== dt2) {
      const castDataType = compareDataTypePriority(dt1, dt2);
      if (castDataType !== dt2) {
        return `${this.generateDataType(castDataType)}(${content})`;
      }
    }
    return content;
  }

  private generateSwizzling(dt: DataType): string {
    const size = getComponentSize(dt);
    if (size === 3) {
      return '.rgb';
    } else if (size === 2) {
      return '.rg';
    } else if (size === 4) {
      return '.rgba';
    } else {
      return '.r';
    }
  }
}
