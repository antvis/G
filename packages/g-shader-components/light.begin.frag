GeometricContext geometry;
geometry.position = - v_ViewPosition;
geometry.normal = normal;
geometry.viewDir = u_IsOrtho == 1.0 ? vec3(0, 0, 1) : normalize(v_ViewPosition);

IncidentLight directLight;
#if defined( NUM_DIR_LIGHTS ) && ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
  DirectionalLight directionalLight;
  #if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
    DirectionalLightShadow directionalLightShadow;
  #endif

  #pragma unroll_loop_start
  for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {

    directionalLight = directionalLights[ i ];

    getDirectionalLightInfo( directionalLight, geometry, directLight );

    #if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
      directionalLightShadow = directionalLightShadows[ i ];
      directLight.color *= all( bvec2( directLight.visible, receiveShadow ) ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
    #endif

    RE_Direct( directLight, geometry, material, reflectedLight );
  }
  #pragma unroll_loop_end

#endif

#if defined( RE_IndirectDiffuse )
  vec3 iblIrradiance = vec3(0.0);
  vec3 ambient = vec3(0.0);
  #ifdef NUM_AMBIENT_LIGHTS
    ambient = u_AmbientLightColor;
  #endif
  vec3 irradiance = getAmbientLightIrradiance(ambient);

  // irradiance += getLightProbeIrradiance( lightProbe, geometry.normal );
  // #if ( NUM_HEMI_LIGHTS > 0 )
  //   #pragma unroll_loop_start
  //   for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
  //     irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometry.normal );
  //   }
  //   #pragma unroll_loop_end
  // #endif
#endif

#if defined( RE_IndirectSpecular )
  vec3 radiance = vec3( 0.0 );
  vec3 clearcoatRadiance = vec3( 0.0 );
#endif
