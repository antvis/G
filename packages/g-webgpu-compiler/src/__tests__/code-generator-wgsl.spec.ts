import { CodeGeneratorWGSL } from '../backends/CodeGeneratorWGSL';
import { Target } from '../backends/ICodeGenerator';
import { Compiler } from '../Compiler';
import { parse } from '../pegjs/g';
import { Transformer } from '../Transformer';

describe('Code Generator', () => {
  const compiler = new Compiler();
  const transformer = new Transformer();
  const generator = new CodeGeneratorWGSL();

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
        expect(generator.generate(shaderProgram)).toContain(`const FLOAT : f32 = 10.0;
const INT : i32 = 10;
const UINT : u32 = 10;
const BOOL : bool = false;
const BOOL2 : bool = true;`);
      });

      test('should generate uniform & buffer declaration statement correctly.', () => {
        compiler.setTarget(Target.WGSL);
        const shaderProgram = compiler.transform(
          compiler.parse(`
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
        `)!,
        );
        expect(compiler.generateCode(shaderProgram))
          .toContain(`type GWebGPUParams = [[block]] struct {
  [[offset 0]] float : f32;
  [[offset 4]] bool : bool;
  [[offset 5]] vec2 : vec2<f32>;
  [[offset 13]] vec3 : vec3<f32>;
  [[offset 25]] vec4 : vec4<f32>;
  [[offset 41]] ivec2 : vec2<i32>;
  [[offset 49]] ivec3 : vec3<i32>;
  [[offset 61]] ivec4 : vec4<i32>;
  [[offset 77]] bvec2 : vec2<bool>;
  [[offset 79]] bvec3 : vec3<bool>;
  [[offset 82]] bvec4 : vec4<bool>;
  [[offset 86]] mat3 : mat3x3<f32>;
  [[offset 122]] mat4 : mat4x4<f32>;
};
[[binding 0, set 0]] var<uniform> gWebGPUUniformParams : GWebGPUParams;
type GWebGPUBuffer0 = [[block]] struct {
  [[offset 0]] vec4Array : [[stride 16]] array<vec4<f32>>;
};
[[binding 1, set 0]] var<storage_buffer> gWebGPUBuffer0 : GWebGPUBuffer0;
type GWebGPUBuffer1 = [[block]] struct {
  [[offset 0]] floatArray : [[stride 4]] array<f32>;
};
[[binding 2, set 0]] var<storage_buffer> gWebGPUBuffer1 : GWebGPUBuffer1;`);
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
        expect(generator.generate(shaderProgram)).toContain(`var a : i32 = 10;
var b : f32 = 10.0;
var c : bool = true;
var vec2 : vec2<f32> = vec2<f32>(1.0, 2.0);
var vec3 : vec3<f32> = vec3<f32>(1.0, 2.0, 3.0);
var vec4 : vec4<f32> = vec4<f32>(1.0, 2.0, 3.0, 4.0);
var ivec2 : vec2<i32> = vec2<i32>(1, 2);
var ivec3 : vec3<i32> = vec3<i32>(1, 2, 3);
var ivec4 : vec4<i32> = vec4<i32>(1, 2, 3, 4);
var bvec2 : vec2<bool> = vec2<bool>(true, true);
var bvec3 : vec3<bool> = vec3<bool>(true, true, false);
var bvec4 : vec4<bool> = vec4<bool>(true, true, false, false);
var mat3 : mat3x3<f32> = mat3x3<f32>(1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0);
var id : vec3<i32> = globalInvocationID;`);
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
        expect(generator.generate(shaderProgram)).toContain(`var a : i32 = 10;
var b : f32 = 10.0;
var c : bool = true;
var d : bool = c;
var vec2 : vec2<f32> = vec2<f32>(1.0, 2.0);
var vec3 : vec3<f32> = vec3<f32>(1.0, 2.0, 3.0);
var vec4 : vec4<f32> = vec4<f32>(1.0, 2.0, 3.0, 4.0);
var ivec2 : vec2<i32> = vec2<i32>(1, 2);
var ivec3 : vec3<i32> = vec3<i32>(1, 2, 3);
var ivec4 : vec4<i32> = vec4<i32>(1, 2, 3, 4);
var bvec2 : vec2<bool> = vec2<bool>(true, true);
var bvec3 : vec3<bool> = vec3<bool>(true, true, false);
var bvec4 : vec4<bool> = vec4<bool>(true, true, false, false);
var mat3 : mat3x3<f32> = mat3x3<f32>(1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0);
var id : vec3<i32> = globalInvocationID;
var ab : i32 = a + i32(b);
var ab2 : i32 = (a + i32(b)) + 10;
var abb : i32 = (a + i32(b)) * i32(b);
var avec2 : vec2<f32> = vec2<f32>(a) + vec2;
var avec3 : vec3<f32> = vec3<f32>(a) + vec3;
var avec4 : vec4<f32> = vec4<f32>(a) + vec4;
var aivec2 : vec2<i32> = vec2<i32>(a) + ivec2;
var aivec3 : vec3<i32> = vec3<i32>(a) + ivec3;
var aivec4 : vec4<i32> = vec4<i32>(a) + ivec4;
var abvec2 : vec2<bool> = vec2<bool>(a) + bvec2;
var abvec3 : vec3<bool> = vec3<bool>(a) + bvec3;
var abvec4 : vec4<bool> = vec4<bool>(a) + bvec4;
var vec2vec3 : vec3<f32> = vec3<f32>(vec2) + vec3;`);
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
        expect(generator.generate(shaderProgram)).toContain(`var a : i32 = i32(2.0);
var b : vec2<f32> = vec2<f32>(1.0, 1.0);
var maxFloat : f32 = std::max(1.0, 2.0);
var maxInt : i32 = std::max(1, 2);
var a : vec2<f32> = std::max(vec2<f32>(1.0, 2.0), vec2<f32>(2.0, 1.0));

entry_point compute as \"main\" = main;`);
      });

      test('should generate variable declaration statement correctly with builtin component-wise functions.', () => {
        const shaderProgram = transformer.transform(
          parse(`
            const a = sin(2);
            const b = sin([1, 2]);
          `),
        );
        expect(generator.generate(shaderProgram)).toContain(`var a : f32 = std::sin(2.0);
var b : vec2<f32> = std::sin(vec2<f32>(1.0, 2.0));`);
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
        expect(generator.generate(shaderProgram)).toContain(`fn test(p1 : f32) -> i32 {return 2;}
fn d() -> vec3<f32> {var a : f32 = 1.0;
var b : vec3<f32> = vec3<f32>(1.0, 2.0, 3.0);
var c : f32 = select(b.r, 10.0, a == 0.0);
return;}
fn d2() -> vec3<f32> {var dist : vec3<f32> = vec3<f32>(1.0, 1.0, 1.0);
var repulsiveF : vec3<f32> = dist.rgb + vec3<f32>(0.2);
return;}
fn d3() -> vec3<f32> {var node_i : vec3<f32> = vec3<f32>(1.0, 2.0, 3.0);
var length : i32 = i32(std::floor(node_i.a + 0.5));
return;}
var a : i32 = test(2.0);`);
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
        expect(generator.generate(shaderProgram))
          .toContain(`fn sum(a : i32, b : i32) -> i32 {return a + b;}
fn main() -> void {var a : i32 = sum(1, 2);
return;}`);
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
          .toContain(`fn test(p1 : f32) -> i32 {if (p1 > 10.0) {return 3;}
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
          .toContain(`fn test(p1 : i32) -> i32 {for (var i : i32 = 0; i < 10; i = i + 1) {p1 = 10;
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
        expect(generator.generate(shaderProgram)).toContain(`fn test(p1 : i32) -> i32 {loop {
  if (p1 > 10) { break; }
p1 = p1 - 1;
}
loop {
p1 = p1 + 1;
  if (p1 < 10) { break; }
}
return 2;}`);
      });
    });

    describe('Demos', () => {
      test('add 2 vectors.', () => {
        compiler.setTarget(Target.WGSL);
        const shaderProgram = compiler.transform(
          compiler.parse(`
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
      }`)!,
        );

        const code = compiler.generateCode(shaderProgram);
        expect(code).toContain(`type GWebGPUBuffer0 = [[block]] struct {
  [[offset 0]] vectorA : [[stride 4]] array<f32>;
};
[[binding 0, set 0]] var<storage_buffer> gWebGPUBuffer0 : GWebGPUBuffer0;
type GWebGPUBuffer1 = [[block]] struct {
  [[offset 0]] vectorB : [[stride 4]] array<f32>;
};
[[binding 1, set 0]] var<storage_buffer> gWebGPUBuffer1 : GWebGPUBuffer1;`);
        expect(code).toContain(`fn sum(a : f32, b : f32) -> f32 {return a + b;}
fn main() -> void {var a : f32 = gWebGPUBuffer0.vectorA[globalInvocationID.x];
var b : f32 = gWebGPUBuffer1.vectorB[globalInvocationID.x];
gWebGPUBuffer0.vectorA[globalInvocationID.x] = sum(a, b);
return;}`);
      });
    });
  });
});
