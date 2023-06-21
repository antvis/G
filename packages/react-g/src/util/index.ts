import { Canvas, Group } from '@antv/g';
import type React from 'react';

export function assertRef<T>(
  forwardedRef: any,
): asserts forwardedRef is React.MutableRefObject<T> {
  if (typeof forwardedRef === 'function') {
    throw new Error('Callback ref not support!');
  }
}

export const isContainer = (element: any) => {
  if (element instanceof Canvas || element instanceof Group) {
    return true;
  }
  return false;
};
