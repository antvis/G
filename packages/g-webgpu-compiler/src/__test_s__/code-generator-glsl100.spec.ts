import { CodeGeneratorGLSL100 } from '../backends/CodeGeneratorGLSL100';
import { Target } from '../backends/ICodeGenerator';
import { Compiler } from '../Compiler';
import { parse } from '../pegjs/g';
import { Transformer } from '../Transformer';

describe('Code Generator', () => {
  const compiler = new Compiler();
  const transformer = new Transformer();
  const generator = new CodeGeneratorGLSL100();

  describe('Statement', () => {
    describe('Variable Declaration', () => {
      test('should generate const declaration statement correctly.', () => {
        const shaderProgram = transformer.transform(
          parse(`
        const FLOAT = 10;
        const INT: int = 10;
        const UINT: uint = 10;
        const BOOL = false;
        const BOOL2 = true;
        `),
        );
        expect(generator.generate(shaderProgram)).toContain(`#define FLOAT 10.0
#define INT 10
#define UINT 10
#define BOOL false
#define BOOL2 true`);
      });

      test('should generate uniform declaration statement correctly.', () => {
        const shaderProgram = transformer.transform(
          parse(`
          class Add2Vectors {
            @in
            float: float;

            @in
            bool: bool;

            @in
            vec2: vec2;

            @in
            vec3: vec3;

            @in
            vec4: vec4;

            @in
            ivec2: ivec2;

            @in
            ivec3: ivec3;

            @in
            ivec4: ivec4;

            @in
            bvec2: bvec2;

            @in
            bvec3: bvec3;

            @in
            bvec4: bvec4;

            @in
            mat3: mat3;

            @in
            mat4: mat4;

            @in
            vec4Array: vec4[];

            @in
            floatArray: float[];
          }
        `),
        );
        expect(generator.generate(shaderProgram)).toContain(`uniform float float;
uniform bool bool;
uniform vec2 vec2;
uniform vec3 vec3;
uniform vec4 vec4;
uniform ivec2 ivec2;
uniform ivec3 ivec3;
uniform ivec4 ivec4;
uniform bvec2 bvec2;
uniform bvec3 bvec3;
uniform bvec4 bvec4;
uniform mat3 mat3;
uniform mat4 mat4;
uniform sampler2D vec4Array;
uniform vec2 vec4ArraySize;
vec4 getDatavec4Array(vec2 address2D) {
  return vec4(texture2D(vec4Array, address2D).rgba);
}
vec4 getDatavec4Array(float address1D) {
  return getDatavec4Array(addrTranslation_1Dto2D(address1D, vec4ArraySize));
}
vec4 getDatavec4Array(int address1D) {
  return getDatavec4Array(float(address1D));
}
uniform sampler2D floatArray;
uniform vec2 floatArraySize;
float getDatafloatArray(vec2 address2D) {
  return float(texture2D(floatArray, address2D).r);
}
float getDatafloatArray(float address1D) {
  return getDatafloatArray(addrTranslation_1Dto2D(address1D, floatArraySize));
}
float getDatafloatArray(int address1D) {
  return getDatafloatArray(float(address1D));
}`);
      });

      test('should generate variable declaration statement correctly.', () => {
        const shaderProgram = transformer.transform(
          parse(`
        let a: int = 10;
        let b = 10;
        let c = true;
        let vec2 = [1, 2];
        let vec3 = [1, 2, 3];
        let vec4 = [1, 2, 3, 4];
        let ivec2: ivec2 = [1, 2];
        let ivec3: ivec3 = [1, 2, 3];
        let ivec4: ivec4 = [1, 2, 3, 4];
        let bvec2 = [true, true];
        let bvec3 = [true, true, false];
        let bvec4 = [true, true, false, false];
        let mat3 = [1,2,3,4,5,6,7,8,9];
        const id = globalInvocationID;
        `),
        );
        expect(generator.generate(shaderProgram)).toContain(`int a = 10;
float b = 10.0;
bool c = true;
vec2 vec2 = vec2(1.0, 2.0);
vec3 vec3 = vec3(1.0, 2.0, 3.0);
vec4 vec4 = vec4(1.0, 2.0, 3.0, 4.0);
ivec2 ivec2 = ivec2(1, 2);
ivec3 ivec3 = ivec3(1, 2, 3);
ivec4 ivec4 = ivec4(1, 2, 3, 4);
bvec2 bvec2 = bvec2(true, true);
bvec3 bvec3 = bvec3(true, true, false);
bvec4 bvec4 = bvec4(true, true, false, false);
mat3 mat3 = mat3(1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0);
ivec3 id = globalInvocationID;`);
      });

      test('should generate variable declaration statement correctly when type casting needed.', () => {
        const shaderProgram = transformer.transform(
          parse(`
        let a: int = 10;
        let b = 10;
        let c = true;
        let d = c;
        let vec2 = [1, 2];
        let vec3 = [1, 2, 3];
        let vec4 = [1, 2, 3, 4];
        let ivec2: ivec2 = [1, 2];
        let ivec3: ivec3 = [1, 2, 3];
        let ivec4: ivec4 = [1, 2, 3, 4];
        let bvec2 = [true, true];
        let bvec3 = [true, true, false];
        let bvec4 = [true, true, false, false];
        let mat3 = [1,2,3,4,5,6,7,8,9];
        const id = globalInvocationID;

        let ab: int = a + b;
        let ab2 = a + b + 10.5;
        let abb: int = (a + b) * b;
        let avec2 = a + vec2;
        let avec3 = a + vec3;
        let avec4 = a + vec4;
        let aivec2 = a + ivec2;
        let aivec3 = a + ivec3;
        let aivec4 = a + ivec4;
        let abvec2 = a + bvec2;
        let abvec3 = a + bvec3;
        let abvec4 = a + bvec4;
        let vec2vec3 = vec2 + vec3;
        `),
        );
        expect(generator.generate(shaderProgram)).toContain(`int a = 10;
float b = 10.0;
bool c = true;
bool d = c;
vec2 vec2 = vec2(1.0, 2.0);
vec3 vec3 = vec3(1.0, 2.0, 3.0);
vec4 vec4 = vec4(1.0, 2.0, 3.0, 4.0);
ivec2 ivec2 = ivec2(1, 2);
ivec3 ivec3 = ivec3(1, 2, 3);
ivec4 ivec4 = ivec4(1, 2, 3, 4);
bvec2 bvec2 = bvec2(true, true);
bvec3 bvec3 = bvec3(true, true, false);
bvec4 bvec4 = bvec4(true, true, false, false);
mat3 mat3 = mat3(1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0);
ivec3 id = globalInvocationID;
int ab = a + int(b);
int ab2 = (a + int(b)) + 10;
int abb = (a + int(b)) * int(b);
vec2 avec2 = vec2(a) + vec2;
vec3 avec3 = vec3(a) + vec3;
vec4 avec4 = vec4(a) + vec4;
ivec2 aivec2 = ivec2(a) + ivec2;
ivec3 aivec3 = ivec3(a) + ivec3;
ivec4 aivec4 = ivec4(a) + ivec4;
bvec2 abvec2 = bvec2(a) + bvec2;
bvec3 abvec3 = bvec3(a) + bvec3;
bvec4 abvec4 = bvec4(a) + bvec4;
vec3 vec2vec3 = vec3(vec2) + vec3;`);
      });

      test('should generate variable declaration statement correctly when type casting needed.', () => {
        const shaderProgram = transformer.transform(
          parse(`
            const a = int(2);
            let b = vec2(1, 1);
            const maxFloat = max(1, 2);
            const maxInt: int = max(1, 2);
            const a = max([1, 2], [2, 1]);
          `),
        );
        expect(generator.generate(shaderProgram)).toContain(`int a = int(2.0);
vec2 b = vec2(1.0, 1.0);
float maxFloat = max(1.0, 2.0);
int maxInt = max(1, 2);
vec2 a = max(vec2(1.0, 2.0), vec2(2.0, 1.0));`);
      });

      test('should generate variable declaration statement correctly with builtin component-wise functions.', () => {
        const shaderProgram = transformer.transform(
          parse(`
            const a = sin(2);
            const b = sin([1, 2]);
          `),
        );
        expect(generator.generate(shaderProgram)).toContain(`float a = sin(2.0);
vec2 b = sin(vec2(1.0, 2.0));`);
      });
    });

    describe('Function Declaration', () => {
      test('should generate variable declaration statement correctly with custom functions.', () => {
        const shaderProgram = transformer.transform(
          parse(`
            function test(p1: float): int {
              return 2;
            }
            function d(): vec3 {
              const a = 1;
              const b = [1, 2, 3];
              const c = a == 0 ? b.r : 10;
            }
            function d2(): vec3 {
              const dist = [1, 1, 1];
              const repulsiveF = dist.rgb + 0.2;
            }
            function d3(): vec3 {
              const node_i = [1, 2, 3];
              const length = int(floor(node_i.a + 0.5));
            }
            const a = test(2);
          `),
        );
        expect(generator.generate(shaderProgram)).toContain(`int test(float p1) {return 2;}
vec3 d() {float a = 1.0;
vec3 b = vec3(1.0, 2.0, 3.0);
float c = (a == 0.0) ? (b.r) : (10.0);}
vec3 d2() {vec3 dist = vec3(1.0, 1.0, 1.0);
vec3 repulsiveF = dist.rgb + vec3(0.2);}
vec3 d3() {vec3 node_i = vec3(1.0, 2.0, 3.0);
int length = int(floor(node_i.a + 0.5));}
int a = test(2.0);`);
      });

      test('should generate uniform declaration statement correctly.', () => {
        const shaderProgram = transformer.transform(
          parse(`
          class Add2Vectors {
            sum(a: int, b: int): int {
              return a + b;
            }

            @main
            compute() {
              const a = this.sum(1, 2);
            }
          }`),
        );
        expect(generator.generate(shaderProgram)).toContain(`int sum(int a, int b) {return a + b;}
void main() {int a = sum(1, 2);`);
      });
    });

    describe('Control Flow', () => {
      test('should generate if statement correctly.', () => {
        const shaderProgram = transformer.transform(
          parse(`
            function test(p1: float): int {
              if (p1 > 10) {
                return 3;
              }
              if (p1 == 2 && p1 != 3) { p1 = 5; }
              return 2;
            }
          `),
        );
        expect(generator.generate(shaderProgram))
          .toContain(`int test(float p1) {if (p1 > 10.0) {return 3;}
if ((p1 == 2.0) && (p1 != 3.0)) {p1 = 5.0;}
return 2;}`);
      });

      test('should generate for statement correctly.', () => {
        const shaderProgram = transformer.transform(
          parse(`
            function test(p1: int): int {
              for (let i =0;i< 10;i++) {
                p1 = 10.2;
                break;
                continue;
              }
              return 2;
            }
          `),
        );
        expect(generator.generate(shaderProgram))
          .toContain(`int test(int p1) {for (int i = 0; i < 10; i++) {p1 = 10;
break;
continue;}
return 2;}`);
      });

      test('should generate while/doWhile statement correctly.', () => {
        const shaderProgram = transformer.transform(
          parse(`
            function test(p1: int): int {
              while (p1 > 10) {
                p1--;
              }
              do {
                p1++;
              } while(p1 < 10.2);
              return 2;
            }
          `),
        );
        expect(generator.generate(shaderProgram)).toContain(`int test(int p1) {while(p1 > 10) {
p1--;
}
do {
p1++;
} while(p1 < 10);
return 2;}`);
      });
    });

    describe('Get/Set thread Data', () => {
      test('should generate uniform declaration statement correctly.', () => {
        const shaderProgram = transformer.transform(
          parse(`
          class Add2Vectors {
            @in
            vectorA: vec4[];

            @main
            test() {
              const a = this.vectorA[globalInvocationID.x];
              this.vectorA[globalInvocationID.x] = [1, 2, 3, 4];
            }
          }`),
        );
        expect(generator.generate(shaderProgram)).toContain(`uniform sampler2D vectorA;
uniform vec2 vectorASize;
vec4 getDatavectorA(vec2 address2D) {
  return vec4(texture2D(vectorA, address2D).rgba);
}
vec4 getDatavectorA(float address1D) {
  return getDatavectorA(addrTranslation_1Dto2D(address1D, vectorASize));
}
vec4 getDatavectorA(int address1D) {
  return getDatavectorA(float(address1D));
}
void main() {vec4 a = getDatavectorA(globalInvocationID.x);
gbuf_color = vec4(vec4(1.0, 2.0, 3.0, 4.0));`);
      });
    });

    describe('Demos', () => {
      test('add 2 vectors.', () => {
        compiler.setTarget(Target.GLSL100);
        const shaderProgram = compiler.transform(
          parse(`
      @numthreads(8, 1, 1)
      class Add2Vectors {
        @in @out
        vectorA: float[];
      
        @in
        vectorB: float[];
      
        sum(a: float, b: float): float {
          return a + b;
        }
      
        @main
        compute() {
          // 获取当前线程处理的数据
          const a = this.vectorA[globalInvocationID.x];
          const b = this.vectorB[globalInvocationID.x];
        
          // 输出当前线程处理完毕的数据，即两个向量相加后的结果
          this.vectorA[globalInvocationID.x] = this.sum(a, b);
        }
      }`),
        );

        expect(compiler.generateCode(shaderProgram))
          .toContain(`float a = getDatavectorA(globalInvocationID.x);
float b = getDatavectorB(globalInvocationID.x);
gbuf_color = vec4(sum(a, b));if (gWebGPUDebug) {
  gbuf_color = gWebGPUDebugOutput;
}}`);
      });
    });
  });
});
