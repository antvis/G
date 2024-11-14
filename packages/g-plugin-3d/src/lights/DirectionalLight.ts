import type { DisplayObjectConfig } from '@antv/g-lite';
import { isCSSRGB } from '@antv/g-lite';
import type {
  LightProps,
  RenderInstUniform,
} from '@antv/g-plugin-device-renderer';
import { Light } from '@antv/g-plugin-device-renderer';
import { vec3 } from 'gl-matrix';

export interface DirectionalLightProps extends LightProps {
  direction: vec3;
}

export class DirectionalLight extends Light {
  static PARSED_STYLE_LIST = new Set([...Light.PARSED_STYLE_LIST, 'direction']);

  define = 'NUM_DIR_LIGHTS';
  order = 10;

  constructor({
    style,
    ...rest
  }: DisplayObjectConfig<DirectionalLightProps> = {}) {
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

    if (isCSSRGB(fill)) {
      const fillColor = [
        Number(fill.r) / 255,
        Number(fill.g) / 255,
        Number(fill.b) / 255,
      ];
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
