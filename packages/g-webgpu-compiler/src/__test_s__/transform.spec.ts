/**
 * 将 ESTree 转换成 ShaderTree
 */

import { AST_NODE_TYPES, AST_TOKEN_TYPES, STORAGE_CLASS } from '../ast/glsl-ast-node-types';
import {
  ArrayExpression,
  AssignmentExpression,
  BinaryExpression,
  CallExpression,
  DeclarationStatement,
  ExpressionStatement,
  ForStatement,
  FunctionDeclaration,
  Identifier,
  IfStatement,
  Literal,
  MemberExpression,
  NumThreadStatement,
  ReturnStatement,
  Scalar,
  UpdateExpression,
  VariableDeclaration,
  VariableDeclarator,
} from '../ast/glsl-tree';
import { parse } from '../pegjs/g';
import { Transformer } from '../Transformer';

describe('Transformation', () => {
  const transformer = new Transformer();

  describe('Statement', () => {
    describe('Variable Declaration', () => {
      test('should transform variable declaration statement correctly.', () => {
        const shaderProgram = transformer.transform(parse('let a = 10;'));
        expect(shaderProgram.body.length).toBe(1);

        const declaration = shaderProgram.body[0] as VariableDeclaration;
        expect(declaration.declarations.length).toBe(1);

        const declarator = declaration.declarations[0] as VariableDeclarator;
        expect(declarator.id.type).toBe(AST_NODE_TYPES.Identifier);
        expect(declarator.id.name).toBe('a');
        expect(declarator.id.dataType).toBe(AST_TOKEN_TYPES.Float);

        // 未声明类型，默认使用 f32
        expect((declarator.init as Literal).type).toBe(AST_TOKEN_TYPES.Float);
        expect((declarator.init as Literal).value).toBe(10);
      });

      test('should transform variable declaration statement correctly.', () => {
        const shaderProgram = transformer.transform(parse('let a = [1, 2, 3];'));
        expect(shaderProgram.body.length).toBe(1);

        const declaration = shaderProgram.body[0] as VariableDeclaration;
        expect(declaration.declarations.length).toBe(1);

        const declarator = declaration.declarations[0] as VariableDeclarator;
        expect(declarator.id.type).toBe(AST_NODE_TYPES.Identifier);
        expect(declarator.id.name).toBe('a');
        expect(declarator.id.dataType).toBe(AST_TOKEN_TYPES.Vector3Float);

        // 未声明类型，默认使用 f32
        expect((declarator.init as ArrayExpression).type).toBe(AST_NODE_TYPES.ArrayExpression);
        expect((declarator.init as ArrayExpression).elements.length).toBe(3);
        expect((declarator.init as ArrayExpression).elements[0].type).toBe(AST_TOKEN_TYPES.Float);
        expect(((declarator.init as ArrayExpression).elements[0] as Scalar).value).toBe(1);
      });

      test('should transform const declaration statement correctly.', () => {
        const shaderProgram = transformer.transform(parse('const AAA = 10;'));
        expect(shaderProgram.body.length).toBe(1);

        const declaration = shaderProgram.body[0] as VariableDeclaration;
        expect(declaration.declarations.length).toBe(1);

        const declarator = declaration.declarations[0] as VariableDeclarator;
        expect(declarator.id.type).toBe(AST_NODE_TYPES.Identifier);
        expect(declarator.id.name).toBe('AAA');
        expect(declarator.storageClass).toBe(STORAGE_CLASS.UniformConstant);
        expect(declarator.id.dataType).toBe(AST_TOKEN_TYPES.Float);

        // 未声明类型，默认使用 f32
        expect((declarator.init as Literal).type).toBe(AST_TOKEN_TYPES.Float);
        expect((declarator.init as Literal).value).toBe(10);
      });

      test('should transform variable declaration statement with type annotation correctly.', () => {
        const shaderProgram = transformer.transform(
          parse('const a: int = 10;\nconst b: bool = false;'),
        );
        expect(shaderProgram.body.length).toBe(2);

        const declaration1 = shaderProgram.body[0] as VariableDeclaration;
        expect(declaration1.declarations.length).toBe(1);

        const declarator1 = declaration1.declarations[0] as VariableDeclarator;
        expect(declarator1.id.type).toBe(AST_NODE_TYPES.Identifier);
        expect(declarator1.id.name).toBe('a');
        expect(declarator1.id.dataType).toBe(AST_TOKEN_TYPES.Int32);
        expect((declarator1.init as Literal).type).toBe(AST_TOKEN_TYPES.Int32);
        expect((declarator1.init as Literal).value).toBe(10);

        const declaration2 = shaderProgram.body[1] as VariableDeclaration;
        expect(declaration2.declarations.length).toBe(1);

        const declarator2 = declaration2.declarations[0] as VariableDeclarator;
        expect(declarator2.id.type).toBe(AST_NODE_TYPES.Identifier);
        expect(declarator2.id.name).toBe('b');
        expect(declarator2.id.dataType).toBe(AST_TOKEN_TYPES.Boolean);
        expect((declarator2.init as Literal).type).toBe(AST_TOKEN_TYPES.Boolean);
        expect((declarator2.init as Literal).value).toBe(false);
      });

      test('should generate numthreads statement correctly.', () => {
        const shaderProgram = transformer.transform(
          parse(`
          @numthreads(8, 1, 1)
          class Demo {}`),
        );
        expect(shaderProgram.body.length).toBe(1);
        const numthreadsDeclaration = shaderProgram.body[0] as NumThreadStatement;
        expect(numthreadsDeclaration.type).toBe(AST_NODE_TYPES.NumThreadStatement);
        expect(numthreadsDeclaration.threadGroupSize).toEqual([8, 1, 1]);
      });

      test('should generate variable declaration with storage class correctly.', () => {
        const shaderProgram = transformer.transform(
          parse(`
          class Demo {
            @in
            p1: float;

            @in @out
            p2: float[];
          }`),
        );
        expect(shaderProgram.body.length).toBe(1);
        const variableDeclaration = shaderProgram.body[0] as VariableDeclaration;
        expect(variableDeclaration.type).toBe(AST_NODE_TYPES.VariableDeclaration);
        expect(variableDeclaration.declarations.length).toBe(2);
        expect(variableDeclaration.declarations[0].id.name).toBe('p1');
        expect(variableDeclaration.declarations[0].id.dataType).toBe(AST_TOKEN_TYPES.Float);
        expect(variableDeclaration.declarations[0].storageClass).toBe(STORAGE_CLASS.Uniform);
        expect(variableDeclaration.declarations[1].id.name).toBe('p2');
        expect(variableDeclaration.declarations[1].id.dataType).toBe(AST_TOKEN_TYPES.FloatArray);
        expect(variableDeclaration.declarations[1].storageClass).toBe(STORAGE_CLASS.StorageBuffer);
      });
    });

    describe('Function Declaration', () => {
      test('should transform function declaration statement with type annotation correctly.', () => {
        const shaderProgram = transformer.transform(
          parse(`function f1(p1: int, p2: float): float {
            const a: int = 1;
            a = a + 2;
            return a + 2;
          }`),
        );

        // scope 中最后一个变量是 f1
        expect(shaderProgram.scope?.length).toBe(8);
        expect(shaderProgram.scope![7].isFunction).toBe(true);
        expect(shaderProgram.scope![7].id.name).toBe('f1');
        expect(shaderProgram.scope![7].id.dataType).toBe(AST_TOKEN_TYPES.Float);

        expect(shaderProgram.body.length).toBe(1);

        const declaration1 = shaderProgram.body[0] as FunctionDeclaration;
        expect(declaration1.type).toBe(AST_NODE_TYPES.FunctionDeclaration);

        expect(declaration1.id.type).toBe(AST_NODE_TYPES.Identifier);
        expect(declaration1.id.name).toBe('f1');
        expect(declaration1.params.length).toBe(2);
        expect(declaration1.params[0].name).toBe('p1');
        expect(declaration1.params[0].dataType).toBe(AST_TOKEN_TYPES.Int32);
        expect(declaration1.params[1].name).toBe('p2');
        expect(declaration1.params[1].dataType).toBe(AST_TOKEN_TYPES.Float);
        expect(declaration1.body.type).toBe(AST_NODE_TYPES.BlockStatement);
        expect(declaration1.body.body.length).toBe(3);

        // const a: int = 1;
        expect(declaration1.body.body[0].type).toBe(AST_NODE_TYPES.VariableDeclaration);

        // a = a + 2;
        const expressionStatement = declaration1.body.body[1] as ExpressionStatement;
        const assignment = expressionStatement.expression as AssignmentExpression;
        expect(assignment.operator).toBe('=');
        expect(assignment.left.type).toBe(AST_NODE_TYPES.Identifier);
        // @ts-ignore
        expect(assignment.left.dataType).toBe(AST_TOKEN_TYPES.Int32);
        expect(assignment.right.type).toBe(AST_NODE_TYPES.BinaryExpression);
        // @ts-ignore
        expect(assignment.right.left.dataType).toBe(AST_TOKEN_TYPES.Int32);

        // return a + 2;
        const returnStatement = declaration1.body.body[2] as ReturnStatement;
        expect(returnStatement.type).toBe(AST_NODE_TYPES.ReturnStatement);
        expect(returnStatement.argument?.type).toBe(AST_NODE_TYPES.BinaryExpression);
        const binaryExpression = returnStatement.argument as BinaryExpression;
        expect(binaryExpression.operator).toBe('+');
        expect(binaryExpression.left.type).toBe(AST_NODE_TYPES.Identifier);
        expect((binaryExpression.left as Identifier).dataType).toBe(AST_TOKEN_TYPES.Int32);
        // expect(binaryExpression.right.type).toBe(AST_TOKEN_TYPES.Int32);

        expect(declaration1.returnType).toBe(AST_TOKEN_TYPES.Float);
      });

      test('should use builtin variables in root scope correctly.', () => {
        const shaderProgram = transformer.transform(
          parse(`function f1(): int {
            const a = globalInvocationID;
          }`),
        );

        // scope 中最后一个变量是 f1
        expect(shaderProgram.scope?.length).toBe(8);
        expect(shaderProgram.scope![7].isFunction).toBe(true);
        expect(shaderProgram.scope![7].id.name).toBe('f1');
        expect(shaderProgram.scope![7].id.dataType).toBe(AST_TOKEN_TYPES.Int32);

        expect(shaderProgram.body.length).toBe(1);
        const functionDeclaration = shaderProgram.body[0] as FunctionDeclaration;
        expect(functionDeclaration.type).toBe(AST_NODE_TYPES.FunctionDeclaration);

        // const a = globalInvocationID;
        const variableDeclaration = functionDeclaration.body.body[0] as VariableDeclaration;
        expect(variableDeclaration.type).toBe(AST_NODE_TYPES.VariableDeclaration);

        const declarator1 = variableDeclaration.declarations[0] as VariableDeclarator;
        expect(declarator1.id.type).toBe(AST_NODE_TYPES.Identifier);
        expect(declarator1.id.name).toBe('a');
        // 这里不进行类型转换，在生成代码时进行
        expect(declarator1.id.dataType).toBe(AST_TOKEN_TYPES.Vector3Int);
        expect((declarator1.init as Identifier).type).toBe(AST_NODE_TYPES.Identifier);
        expect((declarator1.init as Identifier).dataType).toBe(AST_TOKEN_TYPES.Vector3Int);
      });
    });

    // https://gpuweb.github.io/gpuweb/wgsl.html#control-flow
    describe('Control Flow', () => {
      test('should transform for statement correctly.', () => {
        const shaderProgram = transformer.transform(
          parse(`for (let i: int = 0; i < 10; i++) {

          }`),
        );

        expect(shaderProgram.body.length).toBe(1);
        const forStatement = shaderProgram.body[0] as ForStatement;
        expect(forStatement.type).toBe(AST_NODE_TYPES.ForStatement);
        expect((forStatement.init as VariableDeclaration).type).toBe(
          AST_NODE_TYPES.VariableDeclaration,
        );
      });

      test('should transform for statement with AssignmentExpression correctly.', () => {
        const shaderProgram = transformer.transform(
          parse(`
          let i: int;
          for (i = 0; i < 10; i++) {

          }`),
        );

        expect(shaderProgram.body.length).toBe(2);
        const forStatement = shaderProgram.body[1] as ForStatement;
        expect(forStatement.type).toBe(AST_NODE_TYPES.ForStatement);
        expect((forStatement.init as AssignmentExpression).type).toBe(
          AST_NODE_TYPES.AssignmentExpression,
        );
        expect((forStatement.test as BinaryExpression).type).toBe(AST_NODE_TYPES.BinaryExpression);
        expect((forStatement.test as BinaryExpression).right.type).toBe(AST_TOKEN_TYPES.Int32);
        // @ts-ignore
        expect((forStatement.test as BinaryExpression).right.value).toBe(10);
        expect((forStatement.update as UpdateExpression).type).toBe(
          AST_NODE_TYPES.UpdateExpression,
        );
        expect((forStatement.update as UpdateExpression).operator).toBe('++');
      });

      test('should transform if statement correctly.', () => {
        const shaderProgram = transformer.transform(parse('if (a > 0) {} else {}'));

        expect(shaderProgram.body.length).toBe(1);
        const ifStatement = shaderProgram.body[0] as IfStatement;
        expect(ifStatement.type).toBe(AST_NODE_TYPES.IfStatement);
        expect(ifStatement.consequent.type).toBe(AST_NODE_TYPES.BlockStatement);
        expect(ifStatement.alternate?.type).toBe(AST_NODE_TYPES.BlockStatement);
      });

      test('should transform if statement without alternate correctly.', () => {
        const shaderProgram = transformer.transform(parse('if (a > 0) {}'));

        expect(shaderProgram.body.length).toBe(1);
        const ifStatement = shaderProgram.body[0] as IfStatement;
        expect(ifStatement.type).toBe(AST_NODE_TYPES.IfStatement);
        expect(ifStatement.consequent.type).toBe(AST_NODE_TYPES.BlockStatement);
        expect(ifStatement.alternate).toBeNull();
      });
    });
  });

  describe('Expression', () => {
    test('should transform call expression correctly.', () => {
      const shaderProgram = transformer.transform(parse('fn(1, 2);'));

      expect(shaderProgram.body.length).toBe(1);
      const expressionStatement = shaderProgram.body[0] as ExpressionStatement;
      const callExpression = expressionStatement.expression as CallExpression;
      expect(callExpression.type).toBe(AST_NODE_TYPES.CallExpression);
      // @ts-ignore
      expect(callExpression.callee.name).toBe('fn');
      expect(callExpression.arguments.length).toBe(2);
      // @ts-ignore
      expect(callExpression.arguments[0].value).toBe(1);
      // @ts-ignore
      expect(callExpression.arguments[1].value).toBe(2);
    });

    test('should transform non-computed member expression correctly.', () => {
      const shaderProgram = transformer.transform(parse('a.xyz;'));

      expect(shaderProgram.body.length).toBe(1);
      const expressionStatement = shaderProgram.body[0] as ExpressionStatement;
      const memberExpression = expressionStatement.expression as MemberExpression;
      expect(memberExpression.type).toBe(AST_NODE_TYPES.MemberExpression);
      expect(memberExpression.computed).toBe(false);
      // @ts-ignore
      expect(memberExpression.object.name).toBe('a');
      // @ts-ignore
      expect(memberExpression.property.name).toBe('xyz');
    });

    test('should transform computed member expression correctly.', () => {
      const shaderProgram = transformer.transform(parse('a[c];'));

      expect(shaderProgram.body.length).toBe(1);
      const expressionStatement = shaderProgram.body[0] as ExpressionStatement;
      const memberExpression = expressionStatement.expression as MemberExpression;
      expect(memberExpression.type).toBe(AST_NODE_TYPES.MemberExpression);
      expect(memberExpression.computed).toBe(true);
      // @ts-ignore
      expect(memberExpression.object.name).toBe('a');
      // @ts-ignore
      expect(memberExpression.property.name).toBe('c');
    });
  });
});
