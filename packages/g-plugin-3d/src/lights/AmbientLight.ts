import type { DisplayObjectConfig, Tuple4Number } from '@antv/g';
import { PARSED_COLOR_TYPE } from '@antv/g';
import type { LightProps, RenderInstUniform } from '@antv/g-plugin-webgl-renderer';
import { Light } from '@antv/g-plugin-webgl-renderer';

export type AmbientLightProps = LightProps
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

    if (fill?.type === PARSED_COLOR_TYPE.Constant) {
      const fillColor = fill.value as Tuple4Number;
      uniforms.push({
        name: 'u_AmbientLightColor',
        value: fillColor,
      });
    }
  }
}
