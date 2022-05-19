export function numberToLongString(x: number) {
  return x.toFixed(6).replace('.000000', '');
}

export function convertHTML(str: string) {
  const regex = /[&|<|>|"|']/g;
  return str.replace(regex, function (match) {
    if (match === '&') {
      return '&amp;';
    } else if (match === '<') {
      return '&lt;';
    } else if (match === '>') {
      return '&gt;';
    } else if (match === '"') {
      return '&quot;';
    } else {
      return '&apos;';
    }
  });
}
