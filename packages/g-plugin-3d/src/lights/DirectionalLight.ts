import { DisplayObjectConfig } from '@antv/g';
import { Light, LightProps } from '@antv/g-plugin-webgl-renderer';
import { vec3 } from 'gl-matrix';

export interface DirectionalLightProps extends LightProps {
  direction: vec3;
}
export class DirectionalLight extends Light {
  constructor({ style, ...rest }: DisplayObjectConfig<DirectionalLightProps> = {}) {
    super({
      style: {
        direction: vec3.fromValues(0, -1, 0),
        ...style,
      },
      ...rest,
    });
  }

  getUniformWordCount() {
    return 4 + 4;
  }
}
