import type { isMobileResult } from 'ismobilejs';
import isMobileCall from 'ismobilejs';

const isMobile: isMobileResult = isMobileCall(window.navigator);

export { isMobile };
