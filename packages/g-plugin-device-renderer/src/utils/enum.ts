export function enumToObject(enumObject: any): Record<string, number> {
  const result = {};
  Object.keys(enumObject).forEach((key) => {
    if (typeof enumObject[key as any] === 'number') {
      result[key] = enumObject[key as any];
    }
  });
  return result;
}

export function compareDefines(
  d1: Record<string, any>,
  d2: Record<string, any>,
) {
  const d1Keys = Object.keys(d1);
  const d2Keys = Object.keys(d2);
  if (d1Keys.length !== d2Keys.length) {
    return false;
  }

  return d1Keys.every((key) => d1[key] === d2[key]);
}

export const definedProps = (obj: Record<string, unknown>) =>
  Object.fromEntries(Object.entries(obj).filter(([k, v]) => v !== undefined));
