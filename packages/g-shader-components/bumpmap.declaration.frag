#if defined(USE_BUMPMAP) && defined(USE_LIGHT)
  uniform sampler2D u_BumpMap;

  // Bump Mapping Unparametrized Surfaces on the GPU by Morten S. Mikkelsen
  // http://api.unrealengine.com/attachments/Engine/Rendering/LightingAndShadows/BumpMappingWithoutTangentSpace/mm_sfgrad_bump.pdf

  // Evaluate the derivative of the height w.r.t. screen-space using forward differencing (listing 2)

  vec2 dHdxy_fwd() {
    vec2 dSTdx = dFdx( v_Uv );
    vec2 dSTdy = dFdy( v_Uv );

    float Hll = u_BumpScale * texture(SAMPLER_2D(u_BumpMap), v_Uv ).x;
    float dBx = u_BumpScale * texture(SAMPLER_2D(u_BumpMap), v_Uv + dSTdx ).x - Hll;
    float dBy = u_BumpScale * texture(SAMPLER_2D(u_BumpMap), v_Uv + dSTdy ).x - Hll;

    return vec2( dBx, dBy );
  }

  vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {

    // Workaround for Adreno 3XX dFd*( vec3 ) bug. See #9988

    vec3 vSigmaX = vec3( dFdx( surf_pos.x ), dFdx( surf_pos.y ), dFdx( surf_pos.z ) );
    vec3 vSigmaY = vec3( dFdy( surf_pos.x ), dFdy( surf_pos.y ), dFdy( surf_pos.z ) );
    vec3 vN = surf_norm;		// normalized

    vec3 R1 = cross( vSigmaY, vN );
    vec3 R2 = cross( vN, vSigmaX );

    float fDet = dot( vSigmaX, R1 ) * faceDirection;

    vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
    return normalize( abs( fDet ) * surf_norm - vGrad );
  }
#endif