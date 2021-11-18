import { AST_NODE_TYPES } from '../ast/ts-ast-node-types';
import {
  ExportDefaultDeclaration,
  FunctionDeclaration,
  ImportDeclaration,
  ImportDefaultSpecifier,
  ImportNamespaceSpecifier,
  ImportSpecifier,
  VariableDeclaration,
} from '../ast/ts-estree';
import { Compiler } from '../Compiler';
import { parse } from '../pegjs/g';

describe('TS Parser', () => {
  const parser = new Compiler();

  test('should generate empty AST for invalid code.', () => {
    expect(() => {
      parser.parse(`
      const a:;
    `);
    }).toThrowError();
  });

  // https://github.com/estree/estree/blob/master/es2015.md#importdeclaration
  test('should generate AST for ImportDeclaration.', () => {
    let result = parser.parse('import {a, b} from "g-webgpu";')!;
    let declaration = result.body[0] as ImportDeclaration;
    expect(declaration.type).toBe(AST_NODE_TYPES.ImportDeclaration);
    expect(declaration.source.value).toBe('g-webgpu');
    expect(declaration.specifiers.length).toBe(2);

    const specifier0 = declaration.specifiers[0] as ImportSpecifier;
    expect(specifier0.type).toBe(AST_NODE_TYPES.ImportSpecifier);
    expect(specifier0.local.name).toBe('a');

    const specifier1 = declaration.specifiers[1] as ImportSpecifier;
    expect(specifier1.type).toBe(AST_NODE_TYPES.ImportSpecifier);
    expect(specifier1.local.name).toBe('b');

    result = parse('import a from "g-webgpu";');
    declaration = result.body[0] as ImportDeclaration;
    expect(declaration.type).toBe(AST_NODE_TYPES.ImportDeclaration);
    expect(declaration.source.value).toBe('g-webgpu');
    expect(declaration.specifiers.length).toBe(1);
    const specifier2 = declaration.specifiers[0] as ImportDefaultSpecifier;
    expect(specifier2.type).toBe(AST_NODE_TYPES.ImportDefaultSpecifier);
    expect(specifier2.local.name).toBe('a');

    result = parse('import * as a from "g-webgpu";');
    declaration = result.body[0] as ImportDeclaration;
    expect(declaration.type).toBe(AST_NODE_TYPES.ImportDeclaration);
    expect(declaration.source.value).toBe('g-webgpu');
    const specifier3 = declaration.specifiers[0] as ImportNamespaceSpecifier;
    expect(declaration.specifiers.length).toBe(1);
    expect(specifier3.type).toBe(AST_NODE_TYPES.ImportNamespaceSpecifier);
    expect(specifier3.local.name).toBe('a');
  });

  // https://github.com/estree/estree/blob/master/es2015.md#exports
  test('should generate AST for ExportDeclaration.', () => {
    const result = parser.parse('export function a() {};')!;
    const declaration = result.body[0] as ExportDefaultDeclaration;

    expect(declaration.type).toBe(AST_NODE_TYPES.ExportDefaultDeclaration);
    expect((declaration.declaration as FunctionDeclaration).params.length).toBe(0);
    expect((declaration.declaration as FunctionDeclaration).body.type).toBe(
      AST_NODE_TYPES.BlockStatement,
    );
    expect((declaration.declaration as FunctionDeclaration).body.body.length).toBe(0);
  });

  test('should generate AST for typeAnnotation.', () => {
    const result = parser.parse(`
      const a: vec4;
    `)!;
    const declaration = result.body[0] as VariableDeclaration;

    expect(declaration.type).toBe(AST_NODE_TYPES.VariableDeclaration);
    expect(declaration.declarations[0].type).toBe(AST_NODE_TYPES.VariableDeclarator);
    expect(declaration.declarations[0].id.typeAnnotation).toBe('vec4');
  });
});
