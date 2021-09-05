import chai, { expect } from 'chai';
import { requestAnimationFrame, cancelAnimationFrame } from '../raf';

describe('Raf utils', () => {
  it('should use raf correctly', () => {
    const raf = () => {};
    const rafId = requestAnimationFrame(raf);
    cancelAnimationFrame(rafId);
  });
});
