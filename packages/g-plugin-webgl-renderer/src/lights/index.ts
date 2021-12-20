import { DisplayObject, DisplayObjectConfig, BaseStyleProps } from '@antv/g';

export interface LightProps extends BaseStyleProps {
  intensity: number;
}
export abstract class Light extends DisplayObject<LightProps> {
  static tag = 'light';

  constructor({ style, ...rest }: DisplayObjectConfig<LightProps> = {}) {
    super({
      type: Light.tag,
      style: {
        intensity: Math.PI,
        ...style,
      },
      ...rest,
    });
  }

  abstract getUniformWordCount(): number;
}
