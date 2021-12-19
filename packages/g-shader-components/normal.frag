#ifdef USE_BUMPMAP
	normal = perturbNormalArb( - v_ViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif