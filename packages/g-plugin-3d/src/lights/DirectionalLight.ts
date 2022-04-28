import type { DisplayObjectConfig } from '@antv/g';
import { CSSRGB } from '@antv/g';
import type { LightProps, RenderInstUniform } from '@antv/g-plugin-webgl-renderer';
import { Light } from '@antv/g-plugin-webgl-renderer';
import { vec3 } from 'gl-matrix';

export interface DirectionalLightProps extends LightProps {
  direction: vec3;
}

export class DirectionalLight extends Light {
  define = 'NUM_DIR_LIGHTS';
  order = 10;

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

  uploadUBO(uniforms: RenderInstUniform[], index: number) {
    const { fill, direction, intensity } = this.parsedStyle;

    if (fill instanceof CSSRGB) {
      const fillColor = [Number(fill.r) / 255, Number(fill.g) / 255, Number(fill.b) / 255];
      uniforms.push({
        name: `directionalLights[${index}].direction`,
        value: direction,
      });
      uniforms.push({
        name: `directionalLights[${index}].intensity`,
        value: intensity,
      });
      uniforms.push({
        name: `directionalLights[${index}].color`,
        value: fillColor,
      });
    }
  }
}
