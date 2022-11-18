export function assert(b: boolean, message = ''): asserts b {
  if (!b) {
    console.error(new Error().stack);
    throw new Error(`Assert fail: ${message}`);
  }
}

export function assertExists<T>(v: T | null | undefined): T {
  if (v !== undefined && v !== null) return v;
  else throw new Error('Missing object');
}
