#ifdef USE_UV
    v_Uv = a_Uv;
#endif

#ifdef VIEWPORT_ORIGIN_TL
    v_Uv.y = 1.0 - v_Uv.y;
#endif