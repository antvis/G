import { runtime } from '@antv/g-lite';
import type { isMobileResult } from 'ismobilejs';
import isMobileCall from 'ismobilejs';

const isMobile: isMobileResult = isMobileCall(runtime.globalThis.navigator);

export { isMobile };
