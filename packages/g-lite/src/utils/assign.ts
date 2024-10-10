/**
 * A simplified version of Object.assign to avoid garbage collection.
 * @param target - The target object to assign to.
 * @param source - The source object to assign from.
 */
export function assign(
  target: Record<string, any>,
  source: Record<string, any>,
) {
  for (const key in source) {
    target[key] = source[key];
  }
}
