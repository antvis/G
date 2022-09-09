import { GlobalContainer } from '@antv/g-lite';
import { AdvancedCamera } from './AdvancedCamera';

export { AdvancedCamera };

/**
 * Override CameraContribution
 */
GlobalContainer.register(AdvancedCamera);
