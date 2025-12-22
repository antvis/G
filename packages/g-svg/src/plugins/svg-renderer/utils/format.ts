export function numberToLongString(x: number) {
  return x.toFixed(6).replace('.000000', '');
}

export function convertHTML(str: string) {
  const regex = /[&|<|>|"|']/g;
  return str.replace(regex, function (match) {
    if (match === '&') {
      return '&amp;';
    }
    if (match === '<') {
      return '&lt;';
    }
    if (match === '>') {
      return '&gt;';
    }
    if (match === '"') {
      return '&quot;';
    }
    return '&apos;';
  });
}
