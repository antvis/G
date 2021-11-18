import {
  BaseNode as ShaderBaseNode,
  CallExpression as ShaderCallExpression,
  DataType,
  Expression as ShaderExpression,
  ExpressionStatement,
  ForStatement as ShaderForStatement,
  FunctionDeclaration as ShaderFunctionDeclaration,
  Identifier,
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

export function addIdentifierToScope(
  node: ShaderBaseNode,
  id: ShaderIdentifier,
  isFunction: boolean = false,
) {
  if (!node.scope) {
    node.scope = [];
  }

  if (!node.scope.find((v) => v.id.name === id.name)) {
    node.scope.push({
      id,
      alias: [],
      isFunction,
    });
  }
}

/**
 * 从当前节点向上查找，也要考虑别名
 * @param node 当前节点
 * @param idName id 名称
 */
export function getIdentifierFromScope(
  node: ShaderBaseNode,
  idName: string,
  isFunction: boolean = false,
): ShaderIdentifier | undefined {
  return traverseUpwards<ShaderIdentifier>(node, (currentNode) => {
    const existed = currentNode.scope?.find(
      (v) =>
        (v.id.name === idName || v.alias.includes(idName)) && (isFunction ? v.isFunction : true),
    );
    if (existed) {
      return existed.id;
    }
  });
}

/**
 * 从当前节点向上查找，也要考虑别名
 * @param node 当前节点
 * @param idName id 名称
 */
export function getScopeByIdentifierName(
  node: ShaderBaseNode,
  idName: string,
  isFunction: boolean = false,
):
  | {
      id: Identifier;
      alias: string[];
      isFunction: boolean;
    }
  | undefined {
  return traverseUpwards<{
    id: Identifier;
    alias: string[];
    isFunction: boolean;
  }>(node, (currentNode) => {
    const existed = currentNode.scope?.find(
      (v) =>
        (v.id.name === idName || v.alias.includes(idName)) && (isFunction ? v.isFunction : true),
    );
    if (existed) {
      return existed;
    }
  });
}

export function traverseUpwards<T>(
  node: ShaderBaseNode,
  test: (node: ShaderBaseNode) => undefined | T,
): undefined | T {
  let currentNode: ShaderBaseNode | undefined = node;
  while (currentNode) {
    const result = test(currentNode);
    if (result) {
      return result;
    }
    currentNode = currentNode.parent;
  }
}
