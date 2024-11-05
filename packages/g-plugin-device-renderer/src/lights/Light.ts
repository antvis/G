import type { BaseStyleProps, DisplayObjectConfig } from '@antv/g-lite';
import { DisplayObject } from '@antv/g-lite';
import type { RenderInstUniform } from '../render';

export interface LightProps extends BaseStyleProps {
  intensity?: number;
}
export abstract class Light extends DisplayObject<LightProps> {
  static PARSED_STYLE_LIST = new Set([
    ...DisplayObject.PARSED_STYLE_LIST,
    'intensity',
  ]);

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
