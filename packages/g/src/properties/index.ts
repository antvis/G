import type { DisplayObject } from '../DisplayObject';

export const StylePropertyHandlerFactory = Symbol('StylePropertyHandlerFactory');
export type StylePropertyHandlerFactory = <Original, Parsed>(name: string) => StylePropertyHandler<Original, Parsed>;

export interface ParsedStyleProperty<T, V, Formatted = string> {
  type: T;
  value: V;
  formatted: Formatted;
}
export const StylePropertyHandler = Symbol('StylePropertyHandler');
export interface StylePropertyHandler<Original, Parsed> {
  parse?(value: Original, displayObject: DisplayObject): Parsed;
  update?(oldValue: Original, newValue: Original, displayObject: DisplayObject): void;
}

export * from './ClipPath';
export * from './Color';
export * from './ZIndex';
export * from './OffsetPath';
export * from './OffsetDistance';
export * from './Origin';
export * from './Transform';
