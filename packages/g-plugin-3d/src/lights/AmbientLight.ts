import { DisplayObjectConfig, PARSED_COLOR_TYPE, Tuple4Number } from '@antv/g';
import { Light, LightProps, fillVec4 } from '@antv/g-plugin-webgl-renderer';

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

  getUniformWordCount() {
    return 4;
  }

  uploadUBO(d: Float32Array, offs: number) {
    const { fill } = this.parsedStyle;

    if (fill?.type === PARSED_COLOR_TYPE.Constant) {
      const fillColor = fill.value as Tuple4Number;
      offs += fillVec4(d, offs, ...fillColor); // color
    }

    return offs;
  }
}
