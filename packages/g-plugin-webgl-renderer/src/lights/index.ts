import { DisplayObject, DisplayObjectConfig, BaseStyleProps } from '@antv/g';
import { Material } from '../materials';

export interface LightProps extends BaseStyleProps {
  intensity: number;
}
export abstract class Light extends DisplayObject<LightProps> {
  static tag = 'light';

  abstract define: string;
  abstract order: number;

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

  abstract uploadUBO(d: Float32Array, off: number): number;
}

export * from './Fog';
