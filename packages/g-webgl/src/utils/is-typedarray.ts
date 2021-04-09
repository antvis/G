const reTypedTag = /^\[object (?:Float(?:32|64)|(?:Int|Uint)(?:8|16|32)|Uint8Clamped)Array\]$/;

const toString = Object.prototype.toString;
function getTag(value: any) {
  if (value == null) {
    return value === undefined ? '[object Undefined]' : '[object Null]';
  }
  return toString.call(value);
}

const isTypedArray = (value: any) => reTypedTag.test(getTag(value));

export { isTypedArray };
