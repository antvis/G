#pragma glslify: import('@antv/g-shader-components/common.glsl')
#pragma glslify: import('@antv/g-shader-components/scene.both.glsl')
#pragma glslify: import('@antv/g-shader-components/material.both.glsl')
#pragma glslify: import('@antv/g-shader-components/light.both.glsl')

#pragma glslify: import('@antv/g-shader-components/batch.declaration.frag')
#pragma glslify: import('@antv/g-shader-components/uv.declaration.frag')
#pragma glslify: import('@antv/g-shader-components/map.declaration.frag')
#pragma glslify: import('@antv/g-shader-components/bumpmap.declaration.frag')
#pragma glslify: import('@antv/g-shader-components/specularmap.declaration.frag')
#pragma glslify: import('@antv/g-shader-components/bsdf.declaration.frag')
#pragma glslify: import('@antv/g-shader-components/wireframe.declaration.frag')
#pragma glslify: import('@antv/g-shader-components/fog.declaration.frag')
#pragma glslify: import('@antv/g-shader-components/light.phong.declaration.frag')

varying vec3 v_ViewPosition;
varying vec3 v_Normal;

void main() {
  #pragma glslify: import('@antv/g-shader-components/batch.frag')
  #pragma glslify: import('@antv/g-shader-components/map.frag')
  #pragma glslify: import('@antv/g-shader-components/specularmap.frag')

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
  // #endif

  #pragma glslify: import('@antv/g-shader-components/normal.frag')

  gl_FragColor = u_Color;
  gl_FragColor.a = gl_FragColor.a * u_Opacity;

  #ifdef USE_LIGHT
    vec4 diffuseColor = gl_FragColor;
    ReflectedLight reflectedLight = ReflectedLight(vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ));
    vec3 totalEmissiveRadiance = u_Emissive;

    #pragma glslify: import('@antv/g-shader-components/light.phong.frag')

    GeometricContext geometry;
    geometry.position = - v_ViewPosition;
    geometry.normal = normal;
    geometry.viewDir = u_IsOrtho ? vec3(0, 0, 1) : normalize(v_ViewPosition);

    IncidentLight directLight;
    #if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
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
      vec3 iblIrradiance = vec3( 0.0 );
      vec3 irradiance = getAmbientLightIrradiance(u_AmbientLightColor);

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

    #if defined( RE_IndirectDiffuse )
      RE_IndirectDiffuse( irradiance, geometry, material, reflectedLight );
    #endif

    #if defined( RE_IndirectSpecular )
      RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometry, material, reflectedLight );
    #endif

    vec3 outgoingLight = reflectedLight.directDiffuse +
      reflectedLight.indirectDiffuse + 
      reflectedLight.directSpecular + 
      reflectedLight.indirectSpecular + 
      totalEmissiveRadiance;

    gl_FragColor = vec4(outgoingLight, diffuseColor.a);
  #endif

  #ifdef USE_FOG
    gl_FragColor.rgb = addFog(gl_FragColor.rgb);
  #endif

  #ifdef USE_WIREFRAME
    vec3 u_WireframeLineColor = vec3(0.);
    vec3 wireframeAoColor = vec3(1.);
    vec3 color;
    // draw wireframe with ao
    color = mix(gl_FragColor.xyz, u_WireframeLineColor, (1.0 - edgeFactor()));
    gl_FragColor.xyz = color;
  #endif
}