export enum Endianness {
  LITTLE_ENDIAN,
  BIG_ENDIAN,
}

const test: Uint16Array = new Uint16Array([0xfeff]);
const testView: DataView = new DataView(test.buffer);
const systemEndianness: Endianness =
  testView.getUint8(0) == 0xff ? Endianness.LITTLE_ENDIAN : Endianness.BIG_ENDIAN;

export function getSystemEndianness(): Endianness {
  return systemEndianness;
}
