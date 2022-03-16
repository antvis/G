import { BaseStyleProps } from '..';
import { ICSSStyleDeclaration } from './interfaces';

export class CSSStyleDeclaration<StyleProps extends BaseStyleProps = any>
  implements ICSSStyleDeclaration<StyleProps>
{
  setProperty: <Key extends keyof StyleProps>(
    propertyName: Key,
    value: StyleProps[Key],
    priority?: string,
  ) => void;
  getPropertyValue: (propertyName: keyof StyleProps) => StyleProps[keyof StyleProps];
  removeProperty: (propertyName: keyof StyleProps) => void;
  item: (index: number) => string;
}
