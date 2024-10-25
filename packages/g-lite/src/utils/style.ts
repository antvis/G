import { DisplayObject } from '../display-objects';

export function getParsedStyle<
  T extends DisplayObject,
  K extends keyof T['parsedStyle'],
>(object: T, key: K, defaultValue = undefined) {
  return (
    ((object.parsedStyle[key] ??
      object.attributes[key]) as T['parsedStyle'][K]) ?? defaultValue
  );
}
