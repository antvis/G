import type { DisplayObject } from '../DisplayObject';

export const StylePropertyHandlerFactory = Symbol('StylePropertyHandlerFactory');
export type StylePropertyHandlerFactory = <T, P>(name: string) => StylePropertyHandler<T, P>;

export const StylePropertyHandler = Symbol('StylePropertyHandler');
export interface StylePropertyHandler<Original, Parsed, Formatted = string> {
  parse?(value: Original, displayObject: DisplayObject): Parsed;

  format?(rgba: Parsed): Formatted;

  update?(oldValue: Original, newValue: Original, displayObject: DisplayObject): void;
}

export * from './ClipPath';
export * from './Color';
export * from './ZIndex';
export * from './OffsetPath';
export * from './OffsetDistance';
export * from './Origin';
export * from './Transform';
