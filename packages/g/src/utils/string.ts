export function camelCase(str: string = '') {
  return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}

export function isString(str: any): str is string {
  if (str !== null && typeof str.valueOf() === 'string') {
    return true;
  }
  return false;
}
