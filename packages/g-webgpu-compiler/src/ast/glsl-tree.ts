// @see https://gpuweb.github.io/gpuweb/wgsl.html
import { DataType } from '@antv/g-plugin-gpgpu';
import { AST_NODE_TYPES, AST_TOKEN_TYPES, STORAGE_CLASS } from './glsl-ast-node-types';

// Root、Function、Block 三类
export type Scope = Array<{
  id: Identifier;
  alias: string[];
  isFunction: boolean;
}>;

export interface BaseNode {
  parent?: BaseNode;
  scope?: Scope;
}

export { DataType };

export interface Identifier extends BaseNode {
  type: AST_NODE_TYPES.Identifier;
  dataType: DataType;
  name: string;
}
export type Literal = Scalar;

export interface Uint32 extends BaseNode {
  type: AST_TOKEN_TYPES.Uint32;
  value: number;
}

export interface Int32 extends BaseNode {
  type: AST_TOKEN_TYPES.Int32;
  value: number;
}

export interface Boolean extends BaseNode {
  type: AST_TOKEN_TYPES.Boolean;
  value: boolean;
}

export interface Float extends BaseNode {
  type: AST_TOKEN_TYPES.Float;
  value: number;
}

export interface Void extends BaseNode {
  type: AST_TOKEN_TYPES.Void;
  value: null;
}

export type Integer = Uint32 | Int32;

// https://gpuweb.github.io/gpuweb/wgsl.html#scalar-types
// tslint:disable-next-line:ban-types
export type Scalar = Boolean | Integer | Float;

// https://gpuweb.github.io/gpuweb/wgsl.html#vector-types
// eg. vec2<f32>
export interface Vector extends BaseNode {
  type: AST_TOKEN_TYPES.Vector;
  size: 2 | 3 | 4;
  value: Scalar[];
}

// https://gpuweb.github.io/gpuweb/wgsl.html#matrix-types
// eg. mat2x3<f32>
export interface Matrix extends BaseNode {
  type: AST_TOKEN_TYPES.Matrix;
  size: [2 | 3 | 4, 2 | 3 | 4];
  value: Float[];
}

// struct Data {
//  a : i32;
//  b : vec2<f32>;
// }
export interface Struct extends BaseNode {
  type: AST_TOKEN_TYPES.Struct;
  members: Array<{
    key: Identifier;
    value: Scalar | Vector | Matrix;
  }>;
  name: Identifier;
}

export interface Program extends BaseNode {
  type: AST_NODE_TYPES.Program;
  body: Statement[];
}
// https://gpuweb.github.io/gpuweb/wgsl.html#statements-summary
export type Statement =
  | BlockStatement
  | DeclarationStatement
  | VariableDeclaration
  | ReturnStatement
  | ExpressionStatement
  | NumThreadStatement
  | IterationStatement
  | BreakStatement
  | ContinueStatement
  | IfStatement
  | ImportedFunctionStatement;
export interface BlockStatement extends BaseNode {
  type: AST_NODE_TYPES.BlockStatement;
  body: Statement[];
}
export type DeclarationStatement = FunctionDeclaration;

// https://gpuweb.github.io/gpuweb/wgsl.html#expression-grammar
export type Expression =
  | AssignmentExpression
  | BinaryExpression
  | LiteralExpression
  | LeftHandSideExpression
  | UnaryExpression
  | ConditionalExpression
  | UpdateExpression;

export type LeftHandSideExpression =
  | CallExpression
  | FunctionExpression
  | LiteralExpression
  | MemberExpression
  | PrimaryExpression;
export type PrimaryExpression =
  | ArrayExpression
  // | ArrayPattern
  | FunctionExpression
  | Identifier
  | Literal
  | LiteralExpression;

// https://gpuweb.github.io/gpuweb/wgsl.html#assignment
export interface VariableDeclaration extends BaseNode {
  type: AST_NODE_TYPES.VariableDeclaration;
  declarations: VariableDeclarator[];
}

export interface VariableDeclarator extends BaseNode {
  type: AST_NODE_TYPES.VariableDeclarator;
  id: Identifier;
  init: Expression | null;
  storageClass?: STORAGE_CLASS;
}

interface BinaryExpressionBase extends BaseNode {
  operator: string;
  left: Expression;
  right: Expression;
}

export interface AssignmentExpression extends BinaryExpressionBase {
  type: AST_NODE_TYPES.AssignmentExpression;
}

export interface BinaryExpression extends BinaryExpressionBase {
  type: AST_NODE_TYPES.BinaryExpression;
}

interface FunctionDeclarationBase extends BaseNode {
  id: Identifier;
  params: Identifier[];
  body?: BlockStatement | null;
  returnType: DataType;
}
export interface FunctionDeclaration extends FunctionDeclarationBase {
  type: AST_NODE_TYPES.FunctionDeclaration;
  body: BlockStatement;
}
export interface FunctionExpression extends FunctionDeclarationBase {
  type: AST_NODE_TYPES.FunctionExpression;
}

export interface ConditionalExpression extends BaseNode {
  type: AST_NODE_TYPES.ConditionalExpression;
  test: Expression;
  consequent: Expression;
  alternate: Expression;
}

interface UnaryExpressionBase extends BaseNode {
  operator: string;
  prefix: boolean;
  argument: LeftHandSideExpression | Literal | UnaryExpression;
}
export interface UnaryExpression extends UnaryExpressionBase {
  type: AST_NODE_TYPES.UnaryExpression;
  operator: '+' | '-' | '!' | '~';
}
export interface UpdateExpression extends UnaryExpressionBase {
  type: AST_NODE_TYPES.UpdateExpression;
  operator: '++' | '--';
}

export interface CallExpression extends BaseNode {
  type: AST_NODE_TYPES.CallExpression;
  callee: LeftHandSideExpression;
  arguments: Expression[];
}

export interface ReturnStatement extends BaseNode {
  type: AST_NODE_TYPES.ReturnStatement;
  argument: Expression | null;
}

export type LiteralExpression = Literal;

export interface ExpressionStatement extends BaseNode {
  type: AST_NODE_TYPES.ExpressionStatement;
  expression: Expression;
}

export interface NumThreadStatement extends BaseNode {
  type: AST_NODE_TYPES.NumThreadStatement;
  threadGroupSize: number[];
}

export interface ArrayExpression extends BaseNode {
  type: AST_NODE_TYPES.ArrayExpression;
  elements: Expression[];
  dataType?: DataType;
}

export type MemberExpression = MemberExpressionComputedName | MemberExpressionNonComputedName;

interface MemberExpressionBase extends BaseNode {
  object: LeftHandSideExpression;
  property: Expression | Identifier;
  computed: boolean;
}

interface MemberExpressionComputedNameBase extends MemberExpressionBase {
  property: Expression;
  computed: true;
}

interface MemberExpressionNonComputedNameBase extends MemberExpressionBase {
  property: Identifier;
  computed: false;
}
export interface MemberExpressionComputedName extends MemberExpressionComputedNameBase {
  type: AST_NODE_TYPES.MemberExpression;
}

export interface MemberExpressionNonComputedName extends MemberExpressionNonComputedNameBase {
  type: AST_NODE_TYPES.MemberExpression;
}

export interface DoWhileStatement extends BaseNode {
  type: AST_NODE_TYPES.DoWhileStatement;
  test: Expression;
  body: Statement;
}
export interface WhileStatement extends BaseNode {
  type: AST_NODE_TYPES.WhileStatement;
  test: Expression;
  body: Statement;
}
export type ForInitialiser = Expression | VariableDeclaration;
export interface ForStatement extends BaseNode {
  type: AST_NODE_TYPES.ForStatement;
  init: Expression | ForInitialiser | null;
  test: Expression | null;
  update: Expression | null;
  body: Statement;
}
export type IterationStatement = DoWhileStatement | ForStatement | WhileStatement;

export interface BreakStatement extends BaseNode {
  type: AST_NODE_TYPES.BreakStatement;
}

export interface ContinueStatement extends BaseNode {
  type: AST_NODE_TYPES.ContinueStatement;
}

export interface IfStatement extends BaseNode {
  type: AST_NODE_TYPES.IfStatement;
  test: Expression;
  consequent: Statement;
  alternate: Statement | null;
}

export interface ImportedFunctionStatement extends BaseNode {
  type: AST_NODE_TYPES.ImportedFunctionStatement;
  content: string;
}
