export const isColorProp = (prop: string) => ['fill', 'stroke', 'fillStyle', 'strokeStyle'].includes(prop);
export const isGradientColor = (val: string) => /^[r,R,L,l]{1}[\s]*\(/.test(val);
