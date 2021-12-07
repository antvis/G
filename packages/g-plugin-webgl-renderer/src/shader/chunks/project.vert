vec4 project(vec4 pos, mat4 pm, mat4 vm, mat4 mm) {
  return pm * vm * mm * pos;
}
#pragma glslify: export(project)