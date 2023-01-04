import type { DisplayObjectConfig } from '@antv/g-lite';
import { isCSSRGB } from '@antv/g-lite';
import type {
  LightProps,
  RenderInstUniform,
} from '@antv/g-plugin-device-renderer';
import { Light } from '@antv/g-plugin-device-renderer';

export type AmbientLightProps = LightProps;
export class AmbientLight extends Light {
  define = 'NUM_AMBIENT_LIGHTS';
  order = -1;

  constructor({ style, ...rest }: DisplayObjectConfig<AmbientLightProps> = {}) {
    super({
      style: {
        fill: 'black',
        ...style,
      },
      ...rest,
    });
  }

  // getUniformWordCount() {
  //   return 4;
  // }

  uploadUBO(uniforms: RenderInstUniform[], index: number) {
    const { fill } = this.parsedStyle;
    if (isCSSRGB(fill)) {
      const fillColor = [
        Number(fill.r) / 255,
        Number(fill.g) / 255,
        Number(fill.b) / 255,
      ];
      uniforms.push({
        name: 'u_AmbientLightColor',
        value: fillColor,
      });
    }
  }
}
