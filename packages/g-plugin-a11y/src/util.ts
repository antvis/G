import type { isMobileResult } from 'ismobilejs';
import isMobileCall from 'ismobilejs';

const isMobile: isMobileResult = isMobileCall(globalThis.navigator);

export { isMobile };
