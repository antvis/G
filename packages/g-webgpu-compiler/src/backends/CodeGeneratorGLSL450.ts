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
  NumThreadStatement,
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

export class CodeGeneratorGLSL450 implements ICodeGenerator {
  public static GWEBGPU_UNIFORM_PARAMS = 'gWebGPUUniformParams';
  public static GWEBGPU_BUFFER = 'gWebGPUBuffer';
  private context: GLSLContext;
  private bufferBindingIndex = -1;

  public clear() {
    this.bufferBindingIndex = -1;
  }

  public generate(program: Program, context?: GLSLContext): string {
    if (context) {
      this.context = context;
    }

    const [workGroupSizeX, workGroupSizeY, workGroupSizeZ] = context?.threadGroupSize || [1, 1, 1];

    const body = program.body.map((stmt) => this.generateStatement(stmt)).join('\n');
    return `
${importFunctions[Target.GLSL450]}

bool gWebGPUDebug = false;
vec4 gWebGPUDebugOutput = vec4(0.0);

ivec3 globalInvocationID = ivec3(gl_GlobalInvocationID);
ivec3 workGroupSize = ivec3(${workGroupSizeX},${workGroupSizeY},${workGroupSizeZ});
ivec3 workGroupID = ivec3(gl_WorkGroupID);
ivec3 localInvocationID = ivec3(gl_LocalInvocationID);
ivec3 numWorkGroups = ivec3(gl_NumWorkGroups);
int localInvocationIndex = int(gl_LocalInvocationIndex);

${this.generateUniforms()}
${this.generateBuffers()}
${this.generateGlobalVariableDeclarations()}

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
    } else if (stmt.type === AST_NODE_TYPES.NumThreadStatement) {
      return this.generateNumThreadStatement(stmt);
    } else if (stmt.type === AST_NODE_TYPES.ImportedFunctionStatement) {
      return stmt.content;
    } else {
      // tslint:disable-next-line:no-console
      console.warn(`[GLSL450 compiler]: unknown statement: ${stmt.type}`);
    }
    return '';
  }

  public generateNumThreadStatement(stmt: NumThreadStatement): string {
    const [x, y, z] = stmt.threadGroupSize;
    return `layout (
  local_size_x = ${x},
  local_size_y = ${y},
  local_size_z = ${z}
) in;`;
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
          // const name = declarator.id.name;
          // const componentDataType = getComponentDataTypeFromVector(
          //   declarator.id.dataType,
          // );
          // const componentDataTypeStr = this.generateDataType(componentDataType);
          // const dataType = this.generateDataType(declarator.id.dataType);
          // 不在这里生成
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
          console.warn(`[GLSL450 compiler]: unknown statement: ${stmt}`);
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
      return `${this.generateDataType(stmt.returnType || AST_TOKEN_TYPES.Void)} ${stmt.id?.name}(${(
        stmt.params || []
      )
        .map(
          (p) =>
            p.type === AST_NODE_TYPES.Identifier &&
            `${this.generateDataType(p.dataType)} ${p.name}`,
        )
        .join(', ')}) {${this.generateBlockStatement(stmt.body)}}`;
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
      const id = getIdentifierFromScope(expression, expression.name);
      const storageClass = (id?.parent as VariableDeclarator)?.storageClass;

      // 需要改变引用方式
      if (id && storageClass) {
        if (storageClass === STORAGE_CLASS.StorageBuffer) {
          const bufferIndex = this.context.uniforms
            .filter((u) => u.storageClass === STORAGE_CLASS.StorageBuffer)
            .findIndex((u) => u.name === id.name);
          if (bufferIndex > -1) {
            return `${CodeGeneratorGLSL450.GWEBGPU_BUFFER}${bufferIndex}.${expression.name}`;
          }
        } else if (storageClass === STORAGE_CLASS.Uniform) {
          const uniform = this.context.uniforms
            .filter((u) => u.storageClass === STORAGE_CLASS.Uniform)
            .find((u) => u.name === id.name);
          if (uniform) {
            return `${CodeGeneratorGLSL450.GWEBGPU_UNIFORM_PARAMS}.${expression.name}`;
          }
        }
      }

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
      console.warn(`[GLSL450 compiler]: unknown expression: ${expression}`, dataType);
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
    const objectStr = this.generateExpression(expression.object);
    if (expression.property.type === AST_NODE_TYPES.Identifier) {
      if (!expression.computed) {
        // swizzling & struct uniform eg. params.u_k / vec.rgba
        return `${objectStr}.${(expression.property as Identifier).name}`;
      } else {
        return `${objectStr}[${(expression.property as Identifier).name}]`;
      }
    } else if (
      (expression.property.type === AST_TOKEN_TYPES.Float ||
        expression.property.type === AST_TOKEN_TYPES.Int32 ||
        expression.property.type === AST_TOKEN_TYPES.Uint32) &&
      isFinite(Number(expression.property.value))
    ) {
      const index = Number(expression.property.value);
      if (
        expression.object.type === AST_NODE_TYPES.Identifier &&
        isArray(expression.object.dataType)
      ) {
        // shared[0] 此时不能写成 shared.x
        return `${objectStr}[${index}]`;
      } else {
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
        return `${objectStr}.${swizzlingComponent}`;
      }
    } else {
      // data[a + b]
      return `${objectStr}[${this.generateExpression(expression.property)}]`;
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
    if (expression.operator === '<<=') {
      console.log(expression, dataType);
    }

    const left = this.generateExpression(expression.left, dataType);
    const right = this.generateExpression(expression.right, dataType);
    return `${left} ${expression.operator} ${right}`;
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

  private generateGlobalVariableDeclarations() {
    if (!this.context) {
      return '';
    }

    return `${this.context.globalDeclarations
      .map(
        (gd) =>
          `${(gd.shared && 'shared') || ''} ${this.generateDataType(
            getComponentDataTypeFromVector(gd.type),
          ).replace('[]', '')} ${gd.name}[${gd.value}];`,
      )
      .join('\n')}
`;
  }

  private generateUniforms(): string {
    if (!this.context) {
      return '';
    }

    const uniformDeclarations = this.context.uniforms
      .map((uniform) => {
        if (
          uniform.storageClass === STORAGE_CLASS.Uniform // WebGPU Compute Shader 使用 buffer 而非 uniform
        ) {
          return `${this.generateDataType(uniform.type)} ${uniform.name};`;
        }
        return '';
      })
      .join('\n  ') // 缩进
      .trim();

    return (
      uniformDeclarations &&
      `layout(std140, set = 0, binding = ${++this.bufferBindingIndex}) uniform GWebGPUParams {
  ${uniformDeclarations}
} ${CodeGeneratorGLSL450.GWEBGPU_UNIFORM_PARAMS};`
    );
  }

  private generateBuffers() {
    if (!this.context) {
      return '';
    }

    let bufferIndex = -1;
    return this.context.uniforms
      .map((u) => {
        if (u.storageClass === STORAGE_CLASS.StorageBuffer) {
          bufferIndex++;
          return `layout(std430, set = 0, binding = ${++this.bufferBindingIndex}) buffer ${
            (u.readonly && 'readonly') || ''
          } ${(u.writeonly && 'writeonly') || ''} GWebGPUBuffer${bufferIndex} {
  ${this.generateDataType(getComponentDataTypeFromVector(u.type))} ${u.name}[];
} ${CodeGeneratorGLSL450.GWEBGPU_BUFFER}${bufferIndex};
`;
          //         } else if (u.type === 'image2D') {
          //           return `layout(set = 0, binding = ${++this
          //             .bufferBindingIndex}) uniform texture2D ${u.name};
          // layout(set = 0, binding = ${++this.bufferBindingIndex}) uniform sampler ${
          //             u.name
          //           }Sampler;
          // `;
        }
        return '';
      })
      .filter((line) => line)
      .join('\n')
      .trim();
  }
}
