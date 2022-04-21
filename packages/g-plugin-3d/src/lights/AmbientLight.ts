import type { DisplayObjectConfig } from '@antv/g';
import { CSSRGB } from '@antv/g';
import type { LightProps, RenderInstUniform } from '@antv/g-plugin-webgl-renderer';
import { Light } from '@antv/g-plugin-webgl-renderer';

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
    if (fill instanceof CSSRGB) {
      const fillColor = [Number(fill.r) / 255, Number(fill.g) / 255, Number(fill.b) / 255];
      uniforms.push({
        name: 'u_AmbientLightColor',
        value: fillColor,
      });
    }
  }
}
