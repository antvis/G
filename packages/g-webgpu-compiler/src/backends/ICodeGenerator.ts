import { Target } from '@antv/g-plugin-gpgpu';
import { DataType, Expression, Program, Statement } from '../ast/glsl-tree';
import { GLSLContext } from '../Compiler';

export { Target };

export interface ICodeGenerator {
  generate(program: Program, context?: GLSLContext): string;
  generateStatement(stmt: Statement): string;
  generateExpression(expression: Expression | null, dataType?: DataType): string;
  clear(): void;
}
