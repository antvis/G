import { flatten, isFinite } from 'lodash-es';
import { GLSLContext } from '.';
import {
  AST_NODE_TYPES as SHADER_AST_NODE_TYPES,
  AST_TOKEN_TYPES as SHADER_AST_TOKEN_TYPES,
  STORAGE_CLASS,
} from './ast/glsl-ast-node-types';
import {
  ArrayExpression,
  BaseNode as ShaderBaseNode,
  BlockStatement,
  CallExpression as ShaderCallExpression,
  DataType,
  DoWhileStatement as ShaderDoWhileStatement,
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
  WhileStatement as ShaderWhileStatement,
} from './ast/glsl-tree';
import { AST_NODE_TYPES } from './ast/ts-ast-node-types';
import {
  ClassDeclaration,
  ClassProperty,
  Decorator,
  DoWhileStatement,
  Expression,
  ForStatement,
  FunctionDeclaration,
  Identifier,
  IfStatement,
  MethodDefinition,
  Program,
  Statement,
  VariableDeclaration,
  WhileStatement,
} from './ast/ts-estree';
import { Target } from './backends/ICodeGenerator';
import { DataTypeInference } from './DataTypeInference';
import { exportFunctions } from './utils/builtin-functions';
import { getComponentDataTypeFromVector } from './utils/data-type';
import {
  addIdentifierToScope,
  getIdentifierFromScope,
  getScopeByIdentifierName,
} from './utils/node';

enum PropertyDecorator {
  In = 'in',
  Out = 'out',
  Shared = 'shared',
}

interface IDecorator {
  name: string;
  params: number[];
}

export const dataTypeMap: Record<string, DataType> = {
  void: SHADER_AST_TOKEN_TYPES.Void,
  bool: SHADER_AST_TOKEN_TYPES.Boolean,
  int: SHADER_AST_TOKEN_TYPES.Int32,
  uint: SHADER_AST_TOKEN_TYPES.Uint32,
  float: SHADER_AST_TOKEN_TYPES.Float,
  vec2: SHADER_AST_TOKEN_TYPES.Vector2Float,
  vec3: SHADER_AST_TOKEN_TYPES.Vector3Float,
  vec4: SHADER_AST_TOKEN_TYPES.Vector4Float,
  ivec2: SHADER_AST_TOKEN_TYPES.Vector2Int,
  ivec3: SHADER_AST_TOKEN_TYPES.Vector3Int,
  ivec4: SHADER_AST_TOKEN_TYPES.Vector4Int,
  uvec2: SHADER_AST_TOKEN_TYPES.Vector2Uint,
  uvec3: SHADER_AST_TOKEN_TYPES.Vector3Uint,
  uvec4: SHADER_AST_TOKEN_TYPES.Vector4Uint,
  bvec2: SHADER_AST_TOKEN_TYPES.Vector2Boolean,
  bvec3: SHADER_AST_TOKEN_TYPES.Vector3Boolean,
  bvec4: SHADER_AST_TOKEN_TYPES.Vector4Boolean,
  mat3: SHADER_AST_TOKEN_TYPES.Matrix3x3Float,
  mat4: SHADER_AST_TOKEN_TYPES.Matrix4x4Float,
  'float[]': SHADER_AST_TOKEN_TYPES.FloatArray,
  'vec4[]': SHADER_AST_TOKEN_TYPES.Vector4FloatArray,
};

const emptyShaderStatement: ShaderReturnStatement = {
  type: SHADER_AST_NODE_TYPES.ReturnStatement,
  argument: null,
};

/**
 * 将 ESTree 转换成 ShaderTree，同时完成 Scope 创建
 */
export class Transformer {
  public target: Target = Target.GLSL100;
  private inference: DataTypeInference = new DataTypeInference();
  private context: GLSLContext;

  public transform(program: Program, context?: GLSLContext): ShaderProgram {
    if (context) {
      this.context = context;
    }
    const programNode: ShaderProgram = {
      type: SHADER_AST_NODE_TYPES.Program,
      body: [],
      scope: [], // Root Scope
    };
    // 添加内置变量
    this.addBuiltinVariablesToRootScope(programNode);
    programNode.body = flatten(
      program.body.map((stmt) => this.transformStatement(stmt, programNode, programNode)),
    ).filter((stmt) => stmt) as ShaderStatement[];
    return programNode;
  }

  private addBuiltinVariablesToRootScope(programNode: ShaderProgram) {
    addIdentifierToScope(programNode, {
      type: SHADER_AST_NODE_TYPES.Identifier,
      name: 'globalInvocationID',
      dataType: SHADER_AST_TOKEN_TYPES.Vector3Int,
    });
    addIdentifierToScope(programNode, {
      type: SHADER_AST_NODE_TYPES.Identifier,
      name: 'workGroupSize',
      dataType: SHADER_AST_TOKEN_TYPES.Vector3Int,
    });
    addIdentifierToScope(programNode, {
      type: SHADER_AST_NODE_TYPES.Identifier,
      name: 'workGroupID',
      dataType: SHADER_AST_TOKEN_TYPES.Vector3Int,
    });
    addIdentifierToScope(programNode, {
      type: SHADER_AST_NODE_TYPES.Identifier,
      name: 'localInvocationID',
      dataType: SHADER_AST_TOKEN_TYPES.Vector3Int,
    });
    addIdentifierToScope(programNode, {
      type: SHADER_AST_NODE_TYPES.Identifier,
      name: 'localInvocationIndex',
      dataType: SHADER_AST_TOKEN_TYPES.Int32,
    });
    addIdentifierToScope(programNode, {
      type: SHADER_AST_NODE_TYPES.Identifier,
      name: 'numWorkGroups',
      dataType: SHADER_AST_TOKEN_TYPES.Vector3Int,
    });
    addIdentifierToScope(
      programNode,
      {
        type: SHADER_AST_NODE_TYPES.Identifier,
        name: 'imageLoad',
        dataType: SHADER_AST_TOKEN_TYPES.Vector4Float,
      },
      true,
    );
  }

  private transformStatement(
    stmt: Statement,
    scopeNode: ShaderBaseNode,
    parentNode: ShaderBaseNode,
  ): ShaderStatement | ShaderStatement[] {
    let shaderStatement: ShaderStatement | ShaderStatement[] | null = null;
    if (stmt.type === AST_NODE_TYPES.VariableDeclaration) {
      shaderStatement = this.transformVariableDeclaration(stmt, scopeNode, parentNode);
    } else if (stmt.type === AST_NODE_TYPES.FunctionDeclaration) {
      shaderStatement = this.transformFunctionDeclaration(stmt, parentNode);
    } else if (stmt.type === AST_NODE_TYPES.DoWhileStatement) {
      shaderStatement = this.transformDoWhileStatement(stmt, parentNode);
    } else if (stmt.type === AST_NODE_TYPES.WhileStatement) {
      shaderStatement = this.transformWhileStatement(stmt, parentNode);
    } else if (stmt.type === AST_NODE_TYPES.IfStatement) {
      // eg. if (a > 10) {} else {}
      shaderStatement = this.transformIfStatement(stmt, parentNode);
    } else if (stmt.type === AST_NODE_TYPES.ForStatement) {
      shaderStatement = this.transformForStatement(stmt, parentNode);
    } else if (stmt.type === AST_NODE_TYPES.BreakStatement) {
      shaderStatement = {
        type: SHADER_AST_NODE_TYPES.BreakStatement,
      };
    } else if (stmt.type === AST_NODE_TYPES.ContinueStatement) {
      shaderStatement = {
        type: SHADER_AST_NODE_TYPES.ContinueStatement,
      };
    } else if (stmt.type === AST_NODE_TYPES.BlockStatement) {
      shaderStatement = {
        type: SHADER_AST_NODE_TYPES.BlockStatement,
        parent: parentNode,
        scope: [], // Block Scope
        body: [],
      };

      shaderStatement.body = flatten(
        stmt.body.map((s) =>
          this.transformStatement(
            s,
            shaderStatement as BlockStatement,
            shaderStatement as BlockStatement,
          ),
        ),
      ) as ShaderStatement[];
    } else if (stmt.type === AST_NODE_TYPES.ReturnStatement) {
      shaderStatement = {
        type: SHADER_AST_NODE_TYPES.ReturnStatement,
        parent: parentNode,
        argument: null,
      };

      // 需要找到 function 声明的返回类型 FunctionDeclaration
      shaderStatement.argument = this.transformExpression(
        stmt.argument,
        shaderStatement,
        (parentNode.parent?.parent as ShaderFunctionDeclaration).returnType,
      );
    } else if (stmt.type === AST_NODE_TYPES.ExpressionStatement) {
      // @ts-ignore
      shaderStatement = {
        type: SHADER_AST_NODE_TYPES.ExpressionStatement,
        parent: parentNode,
      };
      // @ts-ignore
      shaderStatement.expression = this.transformExpression(
        stmt.expression,
        shaderStatement as ExpressionStatement,
      );
    } else if (stmt.type === AST_NODE_TYPES.ImportDeclaration) {
      // import { debug } from 'g-webgpu';
      stmt.specifiers.forEach((specifier) => {
        if (specifier.type === AST_NODE_TYPES.ImportSpecifier) {
          // @ts-ignore
          const result = exportFunctions[this.target][specifier.local.name];
          if (result) {
            // 引入内置函数/变量
            // TODO: 生成完整的 AST
            addIdentifierToScope(
              scopeNode,
              {
                type: SHADER_AST_NODE_TYPES.Identifier,
                name: specifier.local.name,
                dataType: result.returnType,
              },
              true,
            );
            shaderStatement = {
              type: SHADER_AST_NODE_TYPES.ImportedFunctionStatement,
              content: result.content,
            };
          }
        }
      });
    } else if (stmt.type === AST_NODE_TYPES.ClassDeclaration) {
      shaderStatement = this.transformClassDeclaration(stmt, scopeNode, parentNode);
    }

    return shaderStatement!;
  }

  private transformExpression(
    expression: Expression | null,
    parentNode: ShaderBaseNode,
    type?: DataType,
  ): ShaderExpression | null {
    let retExpression: ShaderExpression | null = null;
    if (expression) {
      if (expression.type === AST_NODE_TYPES.Identifier) {
        // 尝试在当前 Scope 中查找
        const existedIdentifier = getIdentifierFromScope(parentNode, expression.name);
        retExpression = {
          type: SHADER_AST_NODE_TYPES.Identifier,
          parent: parentNode,
          name: expression.name,
          dataType:
            (existedIdentifier && existedIdentifier.dataType) ||
            type ||
            SHADER_AST_TOKEN_TYPES.Float,
        };
      } else if (expression.type === AST_NODE_TYPES.Literal) {
        retExpression = {
          // @ts-ignore
          type: type || SHADER_AST_TOKEN_TYPES.Float,
          parent: parentNode,
          value: expression.value as number,
        };
      } else if (expression.type === AST_NODE_TYPES.AssignmentExpression) {
        // if (expression.operator === '*=') {
        //   console.log(expression.left, parentNode);
        //   debugger;
        // }

        // 右值类型由左侧推导
        const leftDataType = this.inference.infer(expression.left, parentNode);
        retExpression = {
          // @ts-ignore
          type: SHADER_AST_NODE_TYPES.AssignmentExpression,
          parent: parentNode,
          // @ts-ignore
          left: null,
          // @ts-ignore
          right: null,
          operator: expression.operator,
        };
        // @ts-ignore
        retExpression.left = this.transformExpression(
          expression.left,
          // @ts-ignore
          retExpression,
          leftDataType,
        ) as ShaderExpression;
        // @ts-ignore
        retExpression.right = this.transformExpression(
          expression.right,
          // @ts-ignore
          retExpression,
          leftDataType,
        ) as ShaderExpression;
      } else if (
        expression.type === AST_NODE_TYPES.BinaryExpression ||
        expression.type === AST_NODE_TYPES.LogicalExpression
      ) {
        // 右值类型由左侧推导
        const leftRightDataType = type || this.inference.infer(expression, parentNode);

        retExpression = {
          type: SHADER_AST_NODE_TYPES.BinaryExpression,
          parent: parentNode,
          // @ts-ignore
          left: null,
          // @ts-ignore
          right: null,
          operator: expression.operator,
        };
        // @ts-ignore
        retExpression.left = this.transformExpression(
          expression.left,
          // @ts-ignore
          retExpression,
          leftRightDataType,
        ) as ShaderExpression;
        // @ts-ignore
        retExpression.right = this.transformExpression(
          expression.right,
          // @ts-ignore
          retExpression,
          leftRightDataType,
        ) as ShaderExpression;
      } else if (expression.type === AST_NODE_TYPES.ArrayExpression) {
        retExpression = {
          type: SHADER_AST_NODE_TYPES.ArrayExpression,
          parent: parentNode,
          elements: [],
          dataType: type,
        };
        // 需要根据 vec2<bool> -> bool
        const componentDataType = getComponentDataTypeFromVector(
          type || SHADER_AST_TOKEN_TYPES.Float,
        );
        retExpression.elements = expression.elements.map(
          (e) => this.transformExpression(e, retExpression!, componentDataType)!,
        );
      } else if (expression.type === AST_NODE_TYPES.UpdateExpression) {
        // @ts-ignore
        retExpression = {
          type: SHADER_AST_NODE_TYPES.UpdateExpression,
          parent: parentNode,
          operator: expression.operator,
          // @ts-ignore
          argument: null,
          prefix: expression.prefix,
        };
        // @ts-ignore
        retExpression.argument = this.transformExpression(
          expression.argument,
          // @ts-ignore
          retExpression,
        );
      } else if (expression.type === AST_NODE_TYPES.CallExpression) {
        retExpression = {
          type: SHADER_AST_NODE_TYPES.CallExpression,
          parent: parentNode,
          // @ts-ignore
          callee: null,
          arguments: [],
        };
        // @ts-ignore
        retExpression.callee = this.transformExpression(
          expression.callee,
          // @ts-ignore
          retExpression,
        );
        // @ts-ignore
        retExpression.arguments = expression.arguments.map((arg) =>
          // @ts-ignore
          this.transformExpression(arg, retExpression),
        );
      } else if (expression.type === AST_NODE_TYPES.MemberExpression) {
        // TODO: 在这里对 AST 进行改造，去掉 this.
        // eg. const a = this.sum(); -> const a = sum();
        if (
          expression.object.type === AST_NODE_TYPES.Identifier &&
          expression.object.name === 'this'
        ) {
          return this.transformExpression(expression.property, parentNode);
        }

        retExpression = {
          type: SHADER_AST_NODE_TYPES.MemberExpression,
          parent: parentNode,
          // @ts-ignore
          object: null,
          // @ts-ignore
          property: null,
          // @ts-ignore
          computed: expression.computed,
        };
        // @ts-ignore
        retExpression.object = this.transformExpression(
          expression.object,
          // @ts-ignore
          retExpression,
        );
        // @ts-ignore
        retExpression.property = this.transformExpression(
          expression.property,
          // @ts-ignore
          retExpression,
        );
        return retExpression;
      } else if (expression.type === AST_NODE_TYPES.ConditionalExpression) {
        retExpression = {
          type: SHADER_AST_NODE_TYPES.ConditionalExpression,
          parent: parentNode,
          // @ts-ignore
          test: null,
          // @ts-ignore
          alternate: null,
          // @ts-ignore
          consequent: null,
        };
        // @ts-ignore
        retExpression.test = this.transformExpression(
          expression.test,
          // @ts-ignore
          retExpression,
        );
        // @ts-ignore
        retExpression.alternate = this.transformExpression(
          expression.alternate,
          // @ts-ignore
          retExpression,
        );
        // @ts-ignore
        retExpression.consequent = this.transformExpression(
          expression.consequent,
          // @ts-ignore
          retExpression,
        );
      } else if (expression.type === AST_NODE_TYPES.UnaryExpression) {
        retExpression = {
          // @ts-ignore
          type: SHADER_AST_NODE_TYPES.UnaryExpression,
          parent: parentNode,
          // @ts-ignore
          operator: expression.operator,
          prefix: expression.prefix,
        };
        // @ts-ignore
        retExpression.argument = this.transformExpression(
          expression.argument,
          // @ts-ignore
          retExpression,
        );
      }
    }

    return retExpression;
  }

  private transformIdentifier(id: Identifier, parent?: ShaderBaseNode): ShaderIdentifier {
    const { name, typeAnnotation } = id;
    return {
      type: SHADER_AST_NODE_TYPES.Identifier,
      // TODO: 考虑 Struct
      dataType: (typeAnnotation && dataTypeMap[typeAnnotation]) || SHADER_AST_TOKEN_TYPES.Float,
      name,
      parent,
    };
  }

  private transformDoWhileStatement(
    stmt: DoWhileStatement,
    parentNode: ShaderBaseNode,
  ): ShaderDoWhileStatement {
    const doWhileStatement: ShaderDoWhileStatement = {
      type: SHADER_AST_NODE_TYPES.DoWhileStatement,
      parent: parentNode,
      // @ts-ignore
      test: null,
      // @ts-ignore
      body: null,
    };
    // @ts-ignore
    doWhileStatement.test = this.transformExpression(stmt.test, doWhileStatement);
    // @ts-ignore
    doWhileStatement.body = this.transformStatement(stmt.body, doWhileStatement, doWhileStatement);
    return doWhileStatement;
  }

  private transformWhileStatement(
    stmt: WhileStatement,
    parentNode: ShaderBaseNode,
  ): ShaderWhileStatement {
    const whileStatement: ShaderWhileStatement = {
      type: SHADER_AST_NODE_TYPES.WhileStatement,
      parent: parentNode,
      // @ts-ignore
      test: null,
      // @ts-ignore
      body: null,
    };
    // @ts-ignore
    whileStatement.test = this.transformExpression(stmt.test, whileStatement);
    // @ts-ignore
    whileStatement.body = this.transformStatement(stmt.body, whileStatement, whileStatement);
    return whileStatement;
  }

  private transformForStatement(
    stmt: ForStatement,
    parentNode: ShaderBaseNode,
  ): ShaderForStatement {
    const forStatement: ShaderForStatement = {
      type: SHADER_AST_NODE_TYPES.ForStatement,
      parent: parentNode,
      init: null,
      test: null,
      update: null,
      body: emptyShaderStatement,
    };
    if (stmt.init?.type === AST_NODE_TYPES.VariableDeclaration) {
      // let i: int = 0;
      forStatement.init = this.transformStatement(
        stmt.init as VariableDeclaration,
        parentNode,
        forStatement,
      ) as ShaderVariableDeclaration;
    } else if (stmt.init?.type === AST_NODE_TYPES.AssignmentExpression) {
      // i = 0;
      forStatement.init = this.transformExpression(stmt.init, forStatement);
    }

    forStatement.test = this.transformExpression(
      stmt.test,
      forStatement,
      SHADER_AST_TOKEN_TYPES.Int32, // 固定 i32 类型 eg. i < length
    );
    forStatement.update = this.transformExpression(stmt.update, forStatement);
    forStatement.body = this.transformStatement(
      stmt.body,
      parentNode,
      forStatement,
    ) as ShaderStatement;
    return forStatement;
  }

  private transformVariableDeclaration(
    stmt: VariableDeclaration,
    scopeNode: ShaderBaseNode,
    parentNode: ShaderBaseNode,
  ): ShaderVariableDeclaration {
    // const a: int = 10;
    const shaderStatement: ShaderVariableDeclaration = {
      type: SHADER_AST_NODE_TYPES.VariableDeclaration,
      parent: parentNode,
      declarations: stmt.declarations.map((d) => {
        const id = this.transformIdentifier(d.id as Identifier);

        // 处理别名的情况，例如 const a = b; 此时 a 作为 b 的别名，当然 b 也有可能是别的变量的别名
        if (d.init && d.init.type === AST_NODE_TYPES.Identifier) {
          const scope = getScopeByIdentifierName(scopeNode, d.init.name);
          if (scope) {
            scope.alias.push(d.init.name);
          }
        }

        // 加入变量 id 到 Scope 中
        addIdentifierToScope(scopeNode, id, false);

        // 根据赋值语句推导 id 的类型
        if (!d.id.typeAnnotation) {
          const inferredDataType = this.inference.infer(d.init, scopeNode);
          id.dataType = inferredDataType;
        }

        let storageClass = STORAGE_CLASS.Private;
        /**
         * 全大写常量转译成 GLSL 常量
         * const AAA = 100;
         * ->
         * #define AAA 100
         */
        if (
          !scopeNode.parent && // 必须在 Root Scope 声明
          stmt.kind === 'const' &&
          id.name === id.name.toUpperCase()
        ) {
          let definedValue: number;
          let runtime = false;
          storageClass = STORAGE_CLASS.UniformConstant;
          if (
            d?.init?.type === AST_NODE_TYPES.Literal &&
            d.init.value !== null &&
            isFinite(Number(d.init.value))
          ) {
            // @ts-ignore
            definedValue = d.init.value;
          } else {
            runtime = true;
          }
          if (this.context) {
            this.context.defines.push({
              name: id.name,
              type: id.dataType,
              // @ts-ignore
              value: definedValue,
              runtime,
            });
          }
        }

        const declarator: ShaderVariableDeclarator = {
          type: SHADER_AST_NODE_TYPES.VariableDeclarator,
          id,
          parent: shaderStatement as ShaderVariableDeclaration,
          storageClass,
          init: d.init && this.transformExpression(d.init, parentNode, id.dataType),
        };
        id.parent = declarator;
        return declarator;
      }),
    };

    return shaderStatement;
  }

  private transformFunctionDeclaration(
    stmt: FunctionDeclaration,
    parentNode: ShaderBaseNode,
  ): ShaderFunctionDeclaration {
    const id = this.transformIdentifier(stmt.id!);
    const returnType =
      (stmt.returnType && dataTypeMap[stmt.returnType]) || SHADER_AST_TOKEN_TYPES.Float;
    const shaderStatement: ShaderFunctionDeclaration = {
      type: SHADER_AST_NODE_TYPES.FunctionDeclaration,
      parent: parentNode,
      id,
      body: {
        type: SHADER_AST_NODE_TYPES.BlockStatement,
        body: [],
        scope: [], // Function Scope
      },
      params: [],
      returnType,
    };
    // 必须首先创建好父子关系，才能进行后续的递归创建
    id.parent = shaderStatement;
    shaderStatement.body.parent = shaderStatement;

    // 添加到函数名 Root Scope 中
    addIdentifierToScope(
      parentNode,
      {
        ...id,
        dataType: returnType,
      },
      true,
    );

    shaderStatement.params = stmt.params.map((param) => {
      const paramId = this.transformIdentifier(
        param as Identifier,
        shaderStatement as ShaderFunctionDeclaration,
      );

      // 添加参数到 Function Scope 中
      addIdentifierToScope(shaderStatement.body, paramId, false);

      return paramId;
    });

    shaderStatement.body.body = flatten(
      stmt.body.body.map((b) => this.transformStatement(b, shaderStatement, shaderStatement.body)),
    ) as ShaderStatement[];

    return shaderStatement;
  }

  private transformIfStatement(stmt: IfStatement, parentNode: ShaderBaseNode): ShaderStatement {
    const shaderStatement: ShaderIfStatement = {
      type: SHADER_AST_NODE_TYPES.IfStatement,
      parent: parentNode,
      // @ts-ignore
      test: null,
      // @ts-ignore
      consequent: null,
      alternate: null,
    };

    shaderStatement.test = this.transformExpression(stmt.test, shaderStatement)!;
    shaderStatement.consequent = this.transformStatement(
      stmt.consequent,
      shaderStatement,
      shaderStatement,
    ) as ShaderStatement;

    if (stmt.alternate) {
      shaderStatement.alternate = this.transformStatement(
        stmt.alternate,
        shaderStatement,
        shaderStatement,
      ) as ShaderStatement;
    }

    return shaderStatement;
    // 创建 Block Scope
  }

  private transformClassDeclaration(
    stmt: ClassDeclaration,
    scopeNode: ShaderBaseNode,
    parentNode: ShaderBaseNode,
  ): ShaderStatement[] {
    const shaderStatement: ShaderStatement[] = [];

    stmt.decorators?.forEach((decorator) => {
      if (
        decorator.expression.type === AST_NODE_TYPES.CallExpression &&
        decorator.expression.callee.type === AST_NODE_TYPES.Identifier &&
        decorator.expression.callee.name === 'numthreads'
      ) {
        // numthreads(8, 1, 1)
        const threadGroupSize = decorator.expression.arguments
          .slice(0, 3)
          .map((a) => (a.type === AST_NODE_TYPES.Literal && Number(a.value)) || 1) as [
          number,
          number,
          number,
        ];
        (shaderStatement as ShaderStatement[]).push({
          type: SHADER_AST_NODE_TYPES.NumThreadStatement,
          parent: parentNode,
          threadGroupSize,
        });

        this.context.threadGroupSize = threadGroupSize;
      }
    });

    if (stmt.body.type === AST_NODE_TYPES.ClassBody) {
      /**
       * uniforms
       * eg. prop1: vec3[]
       */
      const classProperties = stmt.body.body.filter(
        (e) => e.type === AST_NODE_TYPES.ClassProperty,
      ) as ClassProperty[];

      if (classProperties.length) {
        const declaration: ShaderVariableDeclaration = {
          type: SHADER_AST_NODE_TYPES.VariableDeclaration,
          declarations: [],
        };
        classProperties.forEach((property) => {
          if (property.key.type === AST_NODE_TYPES.Identifier) {
            const id = this.transformIdentifier(property.key);
            addIdentifierToScope(scopeNode, id, false);

            let storageClass = STORAGE_CLASS.Uniform;
            // 认为是 storage_buffer
            if (
              id.dataType === SHADER_AST_TOKEN_TYPES.FloatArray ||
              id.dataType === SHADER_AST_TOKEN_TYPES.Vector4FloatArray
            ) {
              storageClass = STORAGE_CLASS.StorageBuffer;
            }

            if (property.decorators && this.context) {
              this.analyzeDecorators(
                property.key.name,
                id.dataType,
                storageClass,
                property.decorators,
              );
            }

            // eg. [[binding 0, set 0]] var<uniform> params : SimParams;
            //     [[binding 1, set 0]] var<storage_buffer> particlesA : Particles;
            const declarator = {
              type: SHADER_AST_NODE_TYPES.VariableDeclarator,
              id,
              init: null,
              storageClass,
            };
            declaration.declarations.push(declarator as ShaderVariableDeclarator);
            // @ts-ignore
            id.parent = declarator;
          }
        });
        shaderStatement.push(declaration);
      }

      const methodDefinitions = stmt.body.body.filter(
        (e) => e.type === AST_NODE_TYPES.MethodDefinition,
      ) as MethodDefinition[];
      if (methodDefinitions.length) {
        methodDefinitions.forEach((method) => {
          if (method.value.type === AST_NODE_TYPES.FunctionExpression) {
            // void main() 直接修改 AST
            if (method.decorators && method.decorators.length === 1) {
              method.value.returnType = 'void';
              method.value.params = [];
              (method.value.id as Identifier).name = 'main';
            }

            const functionDeclaration: FunctionDeclaration = {
              ...method.value,
              type: AST_NODE_TYPES.FunctionDeclaration,
              body: method.value.body!,
            };

            (shaderStatement as ShaderStatement[]).push(
              this.transformFunctionDeclaration(functionDeclaration, parentNode),
            );
          }
        });
      }
    }
    return shaderStatement;
  }

  private analyzeDecorators(
    propertyName: string,
    propertyType: DataType,
    storageClass: STORAGE_CLASS,
    decorators: Decorator[],
  ) {
    const analyzeDecorators = decorators.map((d) => this.extractDecorator(d));

    if (
      analyzeDecorators.find((d) => d.name === PropertyDecorator.Out) &&
      analyzeDecorators.find((d) => d.name === PropertyDecorator.In)
    ) {
      // 同时具备输入输出，此时需要通过 pingpong 实现
      this.context.needPingpong = true;
    }

    analyzeDecorators.forEach(({ name, params }) => {
      if (name === PropertyDecorator.Shared) {
        this.context.globalDeclarations.push({
          name: propertyName,
          type: propertyType,
          shared: true,
          value: `${params[0]}`,
        });
      } else if (name === PropertyDecorator.Out || name === PropertyDecorator.In) {
        let existed = this.context.uniforms.find((u) => u.name === propertyName);
        if (!existed) {
          existed = {
            name: propertyName,
            type: propertyType,
            storageClass,
            readonly: !!!analyzeDecorators.find((d) => d.name === PropertyDecorator.Out),
            writeonly: !!!analyzeDecorators.find((d) => d.name === PropertyDecorator.In),
            size: [Number(params[0]) || 1, Number(params[1]) || 1] as [number, number],
          };
          this.context.uniforms.push(existed);
        }

        if (name === PropertyDecorator.Out) {
          this.context.output.name = propertyName;
          this.context.output.size = existed.size;
          this.context.output.length = existed.size![0] * existed.size![1];

          // if (propertyType === 'image2D') {
          //   this.context.output.typedArrayConstructor = Uint8ClampedArray;
          //   this.context.output.length! *= 4;
          // }
        }
      }
    });
  }

  private extractDecorator(decorator: Decorator): IDecorator {
    let name = '';
    let params: number[] = [];
    if (decorator.expression.type === AST_NODE_TYPES.Identifier) {
      name = decorator.expression.name;
    } else if (
      decorator.expression.type === AST_NODE_TYPES.CallExpression &&
      decorator.expression.callee.type === AST_NODE_TYPES.Identifier
    ) {
      name = decorator.expression.callee.name;
      params = decorator.expression.arguments.map(
        (a) => (a.type === AST_NODE_TYPES.Literal && Number(a.value)) || 0,
      );
    }
    return {
      name,
      params,
    };
  }
}
