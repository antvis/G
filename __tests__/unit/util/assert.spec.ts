import {
  Circle,
  isDisplayObject,
} from '../../../packages/g-lite/src/display-objects';
import { definedProps } from '../../../packages/g-lite/src/utils';

describe('Assert utils', () => {
  it('should check isDisplayObject correctly', () => {
    expect(isDisplayObject(undefined)).toBeFalsy();
    expect(isDisplayObject(null)).toBeFalsy();
    expect(isDisplayObject('')).toBeFalsy();
    expect(isDisplayObject(() => {})).toBeFalsy();
    expect(isDisplayObject(20)).toBeFalsy();
    expect(isDisplayObject(new Circle())).toBeTruthy();
  });

  it('should definedProps correctly', () => {
    expect(definedProps({ a: 1, b: undefined })).toStrictEqual({ a: 1 });
  });
});
