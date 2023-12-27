#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6

#ifndef saturate
  #define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )

float pow2( float x ) { return x*x; }
float pow3( float x ) { return x*x*x; }
float pow4( float x ) { float x2 = x*x; return x2*x2; }
float max3( vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( vec3 color ) { return dot( color, vec3( 0.3333 ) ); }

// expects values in the range of [0,1]x[0,1], returns values in the [0,1] range.
// do not collapse into a single function per: http://byteblacksmith.com/improvements-to-the-canonical-one-liner-glsl-rand-for-opengl-es-2-0/
highp float rand( vec2 uv ) {
  const highp float a = 12.9898, b = 78.233, c = 43758.5453;
  highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );

  return fract( sin( sn ) * c );
}

mat3 transposeMat3(mat3 inMatrix) {
  vec3 i0 = inMatrix[0];
  vec3 i1 = inMatrix[1];
  vec3 i2 = inMatrix[2];

  mat3 outMatrix = mat3(
    vec3(i0.x, i1.x, i2.x),
    vec3(i0.y, i1.y, i2.y),
    vec3(i0.z, i1.z, i2.z)
    );

  return outMatrix;
}

// https://github.com/glslify/glsl-inverse/blob/master/index.glsl
mat3 inverseMat3(mat3 inMatrix) {
  float a00 = inMatrix[0][0], a01 = inMatrix[0][1], a02 = inMatrix[0][2];
  float a10 = inMatrix[1][0], a11 = inMatrix[1][1], a12 = inMatrix[1][2];
  float a20 = inMatrix[2][0], a21 = inMatrix[2][1], a22 = inMatrix[2][2];

  float b01 = a22 * a11 - a12 * a21;
  float b11 = -a22 * a10 + a12 * a20;
  float b21 = a21 * a10 - a11 * a20;

  float det = a00 * b01 + a01 * b11 + a02 * b21;

  return mat3(b01, (-a22 * a01 + a02 * a21), (a12 * a01 - a02 * a11),
          b11, (a22 * a00 - a02 * a20), (-a12 * a00 + a02 * a10),
          b21, (-a21 * a00 + a01 * a20), (a11 * a00 - a01 * a10)) / det;
}

struct DirectionalLight {
  vec3 direction;
  float intensity;
  vec3 color;
};

struct IncidentLight {
  vec3 color;
  vec3 direction;
  bool visible;
};

struct ReflectedLight {
  vec3 directDiffuse;
  vec3 directSpecular;
  vec3 indirectDiffuse;
  vec3 indirectSpecular;
};

struct GeometricContext {
  vec3 position;
  vec3 normal;
  vec3 viewDir;
};