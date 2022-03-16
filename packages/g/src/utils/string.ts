export function camelCase(str: string = '') {
  return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}
