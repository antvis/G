vec4 mvPosition = u_ViewMatrix * u_ModelMatrix * vec4( 0.0, 0.0, u_ZIndex, 1.0 );
vec2 scale;
scale.x = length( vec3( u_ModelMatrix[ 0 ].x, u_ModelMatrix[ 0 ].y, u_ModelMatrix[ 0 ].z ) );
scale.y = length( vec3( u_ModelMatrix[ 1 ].x, u_ModelMatrix[ 1 ].y, u_ModelMatrix[ 1 ].z ) );

// if (sizeAttenuation < 0.5) {
// bool isPerspective = isPerspectiveMatrix( u_ProjectionMatrix );
// if ( isPerspective ) scale *= - mvPosition.z;
// }

vec2 alignedPosition = offset * scale;

float rotation = 0.0;
vec2 rotatedPosition;
rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;

mvPosition.xy += rotatedPosition;

gl_Position = u_ProjectionMatrix * mvPosition;