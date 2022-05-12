export function enumToObject(enumObject: any): Record<string, number> {
  const result = {};
  Object.keys(enumObject).forEach((key) => {
    if (typeof enumObject[key as any] === 'number') {
      result[key] = enumObject[key as any];
    }
  });
  return result;
}
