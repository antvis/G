import { DisplayObject, DisplayObjectConfig, BaseStyleProps } from '@antv/g';
import { RenderInstUniform } from '../render';

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

  abstract uploadUBO(uniforms: RenderInstUniform[], index: number): void;
}

export * from './Fog';
