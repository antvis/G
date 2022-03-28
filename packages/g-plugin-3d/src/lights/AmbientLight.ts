import { DisplayObjectConfig, PARSED_COLOR_TYPE, Tuple3Number } from '@antv/g';
import { Light, LightProps, RenderInstUniform } from '@antv/g-plugin-webgl-renderer';

export interface AmbientLightProps extends LightProps {}
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
      const fillColor = fill.value.slice(0, 3) as Tuple3Number;
      uniforms.push({
        name: 'u_AmbientLightColor',
        value: fillColor,
      });
    }
  }
}
