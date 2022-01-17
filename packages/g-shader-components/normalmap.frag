#ifdef OBJECTSPACE_NORMALMAP
  // normal = texture2D( normalMap, vUv ).xyz * 2.0 - 1.0; // overrides both flatShading and attribute normals

  // #ifdef FLIP_SIDED
  //   normal = - normal;
  // #endif

  // #ifdef DOUBLE_SIDED
  //   normal = normal * faceDirection;
  // #endif

  // normal = normalize( normalMatrix * normal );
#elif defined( TANGENTSPACE_NORMALMAP )
  // vec3 mapN = texture2D( normalMap, vUv ).xyz * 2.0 - 1.0;
  // mapN.xy *= normalScale;

  // #ifdef USE_TANGENT
  //   normal = normalize( vTBN * mapN );
  // #else
  //   normal = perturbNormal2Arb( - v_ViewPosition, normal, mapN, faceDirection );
  // #endif

#elif defined(USE_BUMPMAP) && defined(USE_LIGHT)
  normal = perturbNormalArb( - v_ViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif