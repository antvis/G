import { SHAPE } from '../types';
import type { BaseStyleProps } from '../types';
import { DisplayObject } from '../DisplayObject';
import { DisplayObjectConfig } from '../DisplayObject';
import { Cullable } from '../components';

export interface HTMLStyleProps extends BaseStyleProps {
  html: string | HTMLElement;
}

/**
 * HTML container
 * @see https://github.com/pmndrs/drei#html
 */
export class HTML extends DisplayObject<HTMLStyleProps> {
  constructor({ style, ...rest }: DisplayObjectConfig<HTMLStyleProps>) {
    super({
      type: SHAPE.HTML,
      style: {
        html: '',
        opacity: 1,
        fillOpacity: 1,
        strokeOpacity: 1,
        anchor: [0, 0],
        ...style,
      },
      ...rest,
    });

    const cullable = this.getEntity().getComponent(Cullable);
    cullable.enable = false;
  }
}
