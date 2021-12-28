float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
vec3 normal = normalize(v_Normal);
#ifdef USE_DOUBLESIDE
  normal = normal * faceDirection;
#endif

// #ifdef USE_TANGENT
//   vec3 tangent = normalize( vTangent );
//   vec3 bitangent = normalize( vBitangent );

//   #ifdef DOUBLE_SIDED
//     tangent = tangent * faceDirection;
//     bitangent = bitangent * faceDirection;
//   #endif

// #if defined( TANGENTSPACE_NORMALMAP ) || defined( USE_CLEARCOAT_NORMALMAP )

// mat3 vTBN = mat3( tangent, bitangent, normal );

// #endif
// #endif